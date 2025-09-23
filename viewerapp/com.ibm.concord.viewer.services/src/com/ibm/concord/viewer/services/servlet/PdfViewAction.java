package com.ibm.concord.viewer.services.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.PdfCacheDescriptor;
import com.ibm.concord.viewer.document.services.AttachmentsUtil;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.exceptions.MalformedRequestException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
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
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.exception.FileSizeException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.exception.SnapshotException;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.viewer.mail.repository.MailRepository;
import com.ibm.json.java.JSONObject;

class PdfViewAction extends AbstractViewAction implements IViewAction
{
  private static final Logger logger = Logger.getLogger(PdfViewAction.class.getName());

  private static final String PARAM_PREVENT_CACHE = "preventCache";

  public PdfViewAction(UserBean user, IDocumentEntry entry, String contentPath, String modified, HashMap<String, Boolean> parameters)
  {
    super(user, entry, contentPath, modified, parameters);
  }

  protected boolean requireConvert() throws CacheStorageAccessException, CacheDataAccessException, SnapshotException, Exception
  {
    return false;
  }

  protected void conversionDone(final HttpServletRequest request, final HttpServletResponse response,
      ImportDraftFromRepositoryContext jContext) throws InterruptedException, IOException
  {

  }

  public void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException,
      InterruptedException
  {
    try
    {
      if (!Platform.getViewerConfig().isSmartCloud())
      {
        // disable help for all on-premise deployment
        parameters.put("help", Boolean.FALSE);
      }

      // TODO:copy file to cache directory.
      File sourceDir = new File(cacheDesc.getPdfURI());
      if (!sourceDir.exists())
        sourceDir.mkdirs();
      File contentFile = new File(sourceDir, "content.pdf");
      // content file existence means the pdf file is not the first time accessed.
      // And because the path is hashed out with last update time, when original file updated,
      // it will get to different path
      if (!contentFile.exists())
      {
        MediaDescriptor media = RepositoryServiceUtil.download(this.getUser(), docEntry);
        InputStream mis = media.getStream();
        InputStream is = ViewerUtil.getEncryptStream(mis, docEntry, user, Encryptor.EncryptionMode.ENCRYPTION);
        FileUtil.copyInputStreamToFile(is, contentFile);
        if (docEntry.getRepository().equals(RepositoryServiceUtil.MAIL_REPO_ID))
        {
          File oriattach = new File(cacheDesc.getInternalURI(), MailRepository.TEMP_ATTACHEMENT_NAME);
          if (oriattach.exists())
            oriattach.delete();
        }
      }

      IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform
          .getComponent(DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
      String type = serviceProvider.getDocumentType(docEntry.getMimeType());
      request.setAttribute("doc_entry", docEntry);
      request.setAttribute("doc_type", type);
      request.setAttribute("doc_mode", "view");
      request.setAttribute("isPDFJsViewMode", "YES");

      request.getRequestDispatcher("/WEB-INF/pages/pdfjsview.jsp").forward(request, response);
      logViewRequest();
    }
    catch (RepositoryAccessException eec)
    {
      request.setAttribute(ATTR_ERROR_CODE, eec.getErrorCode());
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
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
    String range = request.getHeader("Range");

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

    if (contentPath.indexOf("pdf") >= 0)
    {
      logger.log(Level.FINE, "pdf document is requested, Document Id:" + docEntry.getDocId());
    }
    try
    {
      // LOG.log(Level.SEVERE, path);
      if (range == null) // for first content.pdf or encrypted cache request
        media = AttachmentsUtil.getDraftAttachment(cacheDesc, path);
      else
        // for second pdf range request
        media = AttachmentsUtil.getPDFViewAttachment(cacheDesc, path);

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
      if (browser_cache.equals("false"))
      {
        setNoCache(response);
      }
      else
      {
        response.setHeader("Cache-Control", "private, must-revalidate, max-age=" + 3600);
      }
      return;
    }
    else
    {
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
        else if (browser_cache.equals("false"))
        {
          setNoCache(response);
        }
      }

      response.setHeader("Content-disposition", "filename=" + media.getTitle());
      // Add Etag
      response.setHeader("ETag", eTag);

      if (range == null)
      {
        // Setting Accept-Ranges header will notify pdf.worker.js of supporting range, but
        // when content is encrypted, it doesn't support RandomAccessFile. So for encrypt cache,
        // Always DON'T setting the header!!!
        // pdf.worker.js will request by size RANGE_CHUNK_SIZE = 65536 if Accept-Ranges is set.
        // response.setHeader("Accept-Ranges", "bytes");
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(media.getMimeType());
        InputStream is = null;
        BufferedInputStream bis = new BufferedInputStream(media.getStream());
        if (RepositoryServiceUtil.needEncryption(docEntry.getRepository()))
        {
          response.setContentLength((int) docEntry.getMediaSize());
          is = ViewerUtil.getEncryptStream(bis, docEntry, user, Encryptor.EncryptionMode.DECRYPTION);
        }
        else
        {
          response.setContentLength((int) media.getLength());
          // set Accept-Ranges only when it is not encrypted cache
          response.setHeader("Accept-Ranges", "bytes");
        }
        if (is == null)
          is = bis;
        ServletOutputStream out = response.getOutputStream();
        int numRead = -1;
        byte[] data = new byte[8192];
        try
        {
          while ((numRead = is.read(data)) > 0)
          {
            out.write(data, 0, numRead);
          }
        }
        catch (Exception e)
        {
          logger.log(Level.SEVERE, "Failed to write content.", e);
        }
        finally
        {
          is.close();
          out.close();
        }
      }
      else
      {
        response.setContentType("arraybuffer");
        response.setHeader("Accept-Ranges", "bytes");
        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        String[] ranges = range.substring(6).split("-");
        int start = Integer.valueOf(ranges[0]).intValue();
        int len = (Integer.valueOf(ranges[1]).intValue() - start) + 1;
        RandomAccessFile raf = media.getRandomStream();
        raf.seek(start);
        ServletOutputStream out = response.getOutputStream();
        int numRead = -1;
        byte[] data = new byte[len];
        try
        {
          if ((numRead = raf.read(data, 0, len)) > 0)
          {
            response.setHeader("Content-Length", String.valueOf(len));
            response.setHeader("Content-Range",
                "bytes " + String.valueOf(start) + "-" + String.valueOf(start + numRead - 1) + "/" + String.valueOf(numRead));
            out.write(data, 0, len);
          }
        }
        catch (Exception e)
        {
          logger.log(Level.SEVERE, "Failed to write content.", e);
        }
        finally
        {
          raf.close();
          out.close();
        }
      }
    }
  }

  private void setNoCache(HttpServletResponse response)
  {
    response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=3600");
  }

  @Override
  protected void setViewContext()
  {
    this.viewCxt = ViewContext.VIEW_PDF;
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
    config.put("pdf", limits);
    request.setAttribute("viewer_config", config);
    request.setAttribute("doc_type", "pdf");

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
    if (docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.MAIL_REPO_ID)
        || docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.VSFILES_REPO_ID)
        || docEntry.getRepositoryType().equalsIgnoreCase(RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE)
        || docEntry.getRepositoryType().equalsIgnoreCase(RepositoryServiceUtil.EXTERNAL_CMIS_REPO_TYPE)
        || docEntry.getRepository().equalsIgnoreCase(RepositoryServiceUtil.TEMP_STORAGE_REPO_ID))
    {
      return;
    }
    ThumbnailService4Doc ts = new ThumbnailService4Doc(user, docEntry);
    ts.exec();
  }

  @Override
  protected void initMore()
  {
    // DO NOTHING
  }

  @Override
  protected void initCacheDescriptor()
  {
    cacheDesc = new PdfCacheDescriptor(user, docEntry);
  }
}
