package com.ibm.concord.viewer.services.servlet;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.document.common.rendition.Rendition;
import com.ibm.concord.viewer.document.common.rendition.RenditionUtil;
import com.ibm.concord.viewer.document.services.AttachmentsUtil;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.exceptions.MalformedRequestException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ConcurrentFileUtil;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.platform.util.MD5;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.spi.action.IViewAction;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.exception.FileSizeException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.viewer.platform.encryption.Encryptor;

class ImageViewAction extends AbstractViewAction implements IViewAction
{
  private static final Logger logger = Logger.getLogger(ImageViewAction.class.getName());

  private static final String PARAM_PREVENT_CACHE = "preventCache";

  public ImageViewAction(UserBean user, IDocumentEntry entry, String contentPath, String modified, HashMap<String, Boolean> parameters)
  {
    super(user, entry, contentPath, modified, parameters);
  }

  protected void conversionDone(final HttpServletRequest request, final HttpServletResponse response,
      ImportDraftFromRepositoryContext jContext) throws InterruptedException, IOException
  {
    JSONObject data = null;
    File renditionMeta = new File(cacheDesc.getInternalURI(), "images.json");
    if (renditionMeta.exists())
    {
      data = ConcurrentFileUtil.safeReadJsonFromFile(renditionMeta);
      if (data == null)
      {
        logger.log(Level.INFO, "The image.json is null!! " + cacheDesc.getMediaURI());
        data = new JSONObject();
      }
    }
    request.setAttribute("data", data);
  }

  protected void prepare4ViewPage2(final HttpServletRequest request) throws InterruptedException, IOException
  {

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NOT_NEEDED);
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    logger.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NOT_NEEDED, msg.toString()));

    JSONObject data = new JSONObject();
    File renditionMeta = new File(cacheDesc.getInternalURI(), "images.json");
    if (renditionMeta.exists())
    {
      data = ConcurrentFileUtil.safeReadJsonFromFile(renditionMeta);
      // if the image json is invalid reconstruct it
      // check fullimage and thumbnails
      boolean bRewriteImageJSON = false;
      JSONObject fullImage = (JSONObject) data.get("fullImages");
      if (fullImage == null || fullImage.isEmpty())
      {
        List<Rendition> renditions = RenditionUtil.fromFile(new File(cacheDesc.getFullImageURI()), true);
        fullImage = new JSONObject();
        for (int i = 0; i < renditions.size(); i++)
        {
          Rendition r = renditions.get(i);
          JSONObject size = new JSONObject();
          size.put("w", r.getWidth());
          size.put("h", r.getHeigth());
          JSONObject sizeName = new JSONObject();
          sizeName.put("size", size);
          sizeName.put("name", r.getName());
          fullImage.put("pictures_" + i, sizeName);
        }
        bRewriteImageJSON = true;
        logger.log(Level.INFO, "The full image of images.json is not valid. Reconstruction image number: " + renditions.size() + " "
            + renditionMeta.getAbsolutePath());
      }

      JSONObject thumbnails = (JSONObject) data.get("thumbnails");
      if (thumbnails == null || thumbnails.isEmpty())
      {
        if (!DocumentServiceUtil.getDocumentType(docEntry).equalsIgnoreCase("sheet"))
        {
          List<Rendition> renditions = RenditionUtil.fromFile(new File(cacheDesc.getThumbnailURI()), true);
          thumbnails = new JSONObject();
          for (int i = 0; i < renditions.size(); i++)
          {
            Rendition r = renditions.get(i);
            JSONObject size = new JSONObject();
            size.put("w", r.getWidth());
            size.put("h", r.getHeigth());
            JSONObject sizeName = new JSONObject();
            sizeName.put("size", size);
            sizeName.put("name", r.getName());
            thumbnails.put("thumbnails_" + i, sizeName);
          }
          bRewriteImageJSON = true;
          logger.log(Level.INFO, "The thumbnail of images.json is not valid. Reconstruction image number: " + renditions.size() + " "
              + renditionMeta.getAbsolutePath());
        }
      }

      if (bRewriteImageJSON)
      {
        data = new JSONObject();
        data.put("thumbnails", thumbnails);
        data.put("fullImages", fullImage);
        ConcurrentFileUtil.safeWriteJSONtoFile(renditionMeta, data);
      }
    }
    request.setAttribute("data", data);

  }

  public void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException,
      InterruptedException
  {
    if (!convertIgnored)
    {
      request.setAttribute("jobId", this.jobId);
    }
    else
    {
      prepare4ViewPage2(request);
    }

    try
    {
      if (!Platform.getViewerConfig().isSmartCloud())
      {
        // disable help for all on-premise deployment
        parameters.put("help", Boolean.FALSE);
      }

      DocumentServiceUtil.forwardView(user, docEntry, request, response);
    }
    catch (Exception e)
    {
      String problemId = ViewerUtil.generateProblemId();
      logger.log(Level.WARNING, "problem id: " + problemId, e);
      request.setAttribute("problem_id", problemId);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }

  public void serveAttachment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    MediaDescriptor media = null;
    String path = contentPath;
    StringBuffer msg = new StringBuffer();

    String browser_cache = (String) Platform.getViewerConfig().getSubConfig("browserCache").get("enabled");

    // Here age is used by iNotes only
    String cacheControl = (String) request.getAttribute("cache-control-value");

    if (cacheControl != null)
    {
      if (!cacheControl.equals("") && cacheControl.indexOf("must-revalidate") < 0)
      {
        cacheControl = cacheControl + ", must-revalidate";
      }
      else if (cacheControl.equals(""))
      {
        cacheControl = cacheControl + "must-revalidate";
      }
    }

    if (contentPath.indexOf("pictures") >= 0 && contentPath.indexOf("image.") >= 0)
    {
      if (request.getParameter(PARAM_PREVENT_CACHE) != null)
      {
        logViewRequest();
      }
      logger.log(Level.FINE, "first image for pictures is requested, Document Id:" + docEntry.getDocId());
    }
    if (contentPath.indexOf("thumbnails") >= 0 && contentPath.indexOf("image.") >= 0)
    {
      logger.log(Level.FINE, "first image for thumbnails is requested, Document Id:" + docEntry.getDocId());
    }
    try
    {
      // LOG.log(Level.SEVERE, path);
      // media = AttachmentsUtil.getDraftAttachment(user, docEntry, path, false);
      media = AttachmentsUtil.getDraftAttachment(cacheDesc, path);
      if (media == null)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_SEVERE_MALFORMED_URL);
        msg.append(" " + request.getRequestURL());
        logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_MALFORMED_URL, msg.toString()));
        // malformed request
        request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_MALFORMED_INVALID_REQUEST);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "get attachment error!");
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    String eTag = "\"" + MD5.getMD5(String.valueOf(media.getLength())) + "\"";

    String reqETag = request.getHeader("If-None-Match");
    if (reqETag != null && reqETag.equals(eTag))
    {
      response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
      return;
    }

    if (IHSDownload)
    {
      String relPath = cacheDesc.getRelativeURI() + "/" + path;
      response.setHeader("X-IBM-Local-Redirect", cacheRootAlias + "/" + relPath);
      response.setHeader("Content-Length", "0");
      response.setHeader("ETag", eTag);
      if (cacheControl != null)
      {
        response.setHeader("Cache-Control", cacheControl);
        return;
      }
      if (browser_cache.equals("true"))
      {
        response.setHeader("Cache-Control", "private, must-revalidate, max-age=" + 3600);
      }
      else
      {
        setNoCache(response);
      }
      return;
    }
    else
    {
      response.setContentType(media.getMimeType());
      response.setCharacterEncoding("UTF-8");
      if (cacheControl != null)
      {
        response.setHeader("Cache-Control", cacheControl);
      }
      else
      {
        if (browser_cache.equals("true"))
        {
          response.setHeader("Cache-Control", "private, must-revalidate, max-age=" + 3600);
        }
        else
        {
          setNoCache(response);
        }
      }

      response.setHeader("Content-disposition", "filename=" + media.getTitle());
      // Add Etag
      response.setHeader("ETag", eTag);
      response.setStatus(HttpServletResponse.SC_OK);

      // check if need de-encyption the content,
      // When conversion has not done, disable encryption!
      boolean needDecryption = RepositoryServiceUtil.needEncryption(docEntry.getRepository());
      if (needDecryption)
      {
        File tmpFile = new File(cacheDesc.getMediaURI(), contentPath);
        File encryption_done = new File(tmpFile.getParent(), ConversionUtils.ENCRYPTION_DONE);
        if (!encryption_done.exists())
          needDecryption = false;
      }

      if (needDecryption)
        logger.log(Level.FINE, "from ServeAttachment, need decryption file " + cacheDesc.getMediaURI() + File.separator + path);

      BufferedInputStream bis = new BufferedInputStream(media.getStream());
      InputStream is = null;
      if (needDecryption && path.matches(RenditionUtil.sourcePattern))
        is = ViewerUtil.getEncryptStream(bis, docEntry, user, Encryptor.EncryptionMode.DECRYPTION);
      if (is == null)
        is = bis;
      ServletOutputStream out = response.getOutputStream();
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = is.read(data)) > 0)
      {
        out.write(data, 0, numRead);
      }
      is.close();
      out.close();
    }
  }

  private void setNoCache(HttpServletResponse response)
  {
    response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=3600");
    response.setHeader("Pragma", "no-cache");
  }

  @Override
  protected void setViewContext()
  {
    this.viewCxt = ViewContext.VIEW_IMAGE;
  }

  @Override
  protected boolean allowViewEditorDraft()
  {
    return false;
  }

  @Override
  protected void doFileSizeCheck(HttpServletRequest request) throws FileSizeException
  {
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
    JSONObject limits = (JSONObject) docSrv.getConfigs().get("limits");
    JSONObject config = new JSONObject();
    config.put("sizeLimit", limits.get("max-size"));
    request.setAttribute("viewer_config", config);

    if (LimitsUtil.exceedLimits(docEntry.getMediaSize(), limits))
    {
      throw new FileSizeException();
    }
  }

  @Override
  protected void initConversionHelper()
  {
    this.conHelper = IConversionHelper.DEFAULT_CONVERSION_HELPER;
  }

  @Override
  protected void postServeViewerPage(HttpServletRequest request) throws InterruptedException, IOException
  {
    if (convertIgnored && !docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID)
        && !docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.VSFILES_REPO_ID)
        && !docEntry.getRepositoryType().equalsIgnoreCase(RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE)
        && !docEntry.getRepositoryType().equalsIgnoreCase(RepositoryServiceUtil.EXTERNAL_CMIS_REPO_TYPE)
        && !docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.TEMP_STORAGE_REPO_ID))
    {
      ThumbnailService4Doc ts = new ThumbnailService4Doc(user, docEntry);
      if (!ts.isThumbnailsExisted())
      {
        ts.generateThumbnailsFromVallidCache();
      }
    }
  }

  @Override
  protected void initMore()
  {
    // DO NOTHING
  }

  @Override
  protected void initCacheDescriptor()
  {
    cacheDesc = new ImageCacheDescriptor(user, docEntry);
  }
}
