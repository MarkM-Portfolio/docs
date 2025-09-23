/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.config.HTMLViewConfig;
import com.ibm.concord.viewer.config.PresConfig;
import com.ibm.concord.viewer.config.TextConfig;
import com.ibm.concord.viewer.document.services.AttachmentsUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.cache.CacheComponent;
import com.ibm.concord.viewer.platform.component.IComponent;
import com.ibm.concord.viewer.platform.encryption.Encryptor;
import com.ibm.concord.viewer.platform.exceptions.MalformedRequestException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.platform.util.MD5;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.CacheStorageAdapterFactory;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.cache.ICacheStorageAdapter;
import com.ibm.concord.viewer.spi.exception.FileSizeException;
import com.ibm.json.java.JSONObject;

public class HtmlViewAction extends AbstractViewAction
{
  private static final Logger logger = Logger.getLogger(HtmlViewAction.class.getName());

  private static final Map<String, String> pageMap = new HashMap<String, String>();

  protected String pathPrefix = "";

  private static final String CLASS_NAME = HtmlViewAction.class.getName();

  private static final String TEXT_DIRECTION = "_textDirection";
  
  public HtmlViewAction(UserBean user, IDocumentEntry entry, String contentPath, String docVersion, HashMap<String, Boolean> parameters)
  {
    super(user, entry, contentPath, docVersion, parameters);
    pathPrefix = "html/";
  }

  static
  {
    pageMap.put(DocumentTypeUtils.SPREADSHEET, "/WEB-INF/pages/htmlview.jsp");
    pageMap.put(DocumentTypeUtils.TEXT, "/WEB-INF/pages/docview.jsp");
    pageMap.put(DocumentTypeUtils.SPREADSHEET + "_compact", "/WEB-INF/pages/htmlview.jsp");
    pageMap.put(DocumentTypeUtils.TEXT + "_compact", "/WEB-INF/pages/docview.jsp");
    pageMap.put(DocumentTypeUtils.TEXT + "_htmlprint", "/jsp/viewTextForHtmlPrint.jsp");
    pageMap.put(DocumentTypeUtils.PRESENTATION, "/WEB-INF/pages/presview.jsp");
    pageMap.put(DocumentTypeUtils.PRESENTATION + "_compact", "/WEB-INF/pages/presview.jsp");
    pageMap.put(DocumentTypeUtils.PRESENTATION + "_slideshow", "/jsp/htmlSlideShow.jsp");
  }

  @Override
  protected void initMore()
  {
    // DO NOTHING
  }

  protected void conversionDone(final HttpServletRequest request, final HttpServletResponse response,
      ImportDraftFromRepositoryContext jContext) throws InterruptedException, IOException
  {
    logger.entering(CLASS_NAME, "prepare4ViewPage");

    request.setAttribute("jobId", jContext.getJobId());
    request.setAttribute("doc_mimeType", docEntry.getMimeType());

    logger.exiting(CLASS_NAME, "prepare4ViewPage");
  }

  /**
   * Forward to the Viewer Page.
   * 
   * @throws ServletException
   * @throws IOException
   */
  public void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {

    if (!convertIgnored)
    {
      request.setAttribute("jobId", jobId);
      request.setAttribute("jobLive", true);
      request.setAttribute("doc_mimeType", docEntry.getMimeType());
      request.setAttribute("upgradeConvert", false);
    }

    request.setAttribute("doc_entry", docEntry);
    request.setAttribute("doc_mode", "html");

    try
    {
      String type = DocumentTypeUtils.getStellentType(docEntry.getMimeType());
      request.setAttribute("doc_type", type);
      String mode = request.getParameter("mode");
      mode = mode == null ? "" : "_" + mode;
      String page = pageMap.get(type + mode);
      if (DocumentTypeUtils.SPREADSHEET.equalsIgnoreCase(type))
      {
        getBidiCookie(request, response);
        request.setAttribute("hasACL", checkACL());
      } 
      else if (DocumentTypeUtils.TEXT.equalsIgnoreCase(type))
      {
    	  request.setAttribute("hasTrack", checkTrack()); 
      }

      if (page == null)
      {
        logger.log(Level.WARNING, "Failed to get the endpoint.  Key is {0}.", type + mode);
      }
      else
      {
        request.getRequestDispatcher(page).forward(request, response);
        logViewRequest();
      }
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

  private boolean checkACL()
  {
    logger.entering(HtmlViewAction.CLASS_NAME, "checkACL");

    boolean hasACL = false;
    if (cacheDesc.getViewContext() == ViewContext.VIEW_HTML_SS)
    {
      hasACL = ((SnapshotDescriptor) cacheDesc).getACLFromDraftCache();
    }

    logger.exiting(HtmlViewAction.CLASS_NAME, "checkACL", hasACL);
    return hasACL;
  }

  private boolean checkTrack()
  {
    logger.entering(HtmlViewAction.CLASS_NAME, "checkTrack");

    boolean hasTrack = false;
    if (cacheDesc.getViewContext() == ViewContext.VIEW_HTML_SS)
    {
    	hasTrack = ((SnapshotDescriptor) cacheDesc).getTrackFromDraftCache();
    }

    logger.exiting(HtmlViewAction.CLASS_NAME, "checkTrack", hasTrack);
    return hasTrack;
  }
  
  private void getBidiCookie(HttpServletRequest request, HttpServletResponse response) throws ServletException
  {
    String textDir = getDataFromCookie(request.getCookies(), TEXT_DIRECTION);
    if (textDir == null)
      textDir = "contextual";

    request.setAttribute(TEXT_DIRECTION, textDir);
  }

  private static String getDataFromCookie(Cookie cookies[], String key)
  {
    String value = null;
    for (int i = 0; i < cookies.length; i++)
    {
      Cookie cookie = cookies[i];
      if (cookie.getName().endsWith(key))
      {
        try
        {
          value = cookie.getValue();
          if (value != null && !value.equals("") && !value.equals("null"))
            value = URLDecoder.decode(value, "UTF-8");

          break;
        }
        catch (IOException e)
        {
          logger.log(Level.WARNING, "io error when get data from cookie.", e);
        }
      }
    }
    return value;
  }

  public void serveAttachment(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    MediaDescriptor media = null;
    String path = pathPrefix + contentPath;
    StringBuffer msg = new StringBuffer();
    try
    {
      // LOG.log(Level.SEVERE, path);
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

    response.setContentType(media.getMimeType());
    response.setCharacterEncoding("UTF-8");
    response.setHeader("Content-disposition", "filename=" + media.getTitle());
    // Add Etag
    response.setHeader("ETag", eTag);
    response.setStatus(HttpServletResponse.SC_OK);

    InputStream is = media.getStream();

    // check decryption is required here ....
    File encryption_done = new File(cacheDesc.getHtmlURI(), ConversionUtils.ENCRYPTION_DONE);
    if (encryption_done.exists())
      is = ViewerUtil.getEncryptStream(is, docEntry, user, Encryptor.EncryptionMode.DECRYPTION);

    BufferedInputStream bis = new BufferedInputStream(is);
    ServletOutputStream out = response.getOutputStream();
    int numRead = -1;
    byte[] data = new byte[1024 * 100];
    while ((numRead = bis.read(data)) > 0)
    {
      out.write(data, 0, numRead);
    }
    try
    {
      media.getStream().close();
    }
    catch (Exception e)
    {
      logger.warning(e.getMessage());
    }
    try
    {
      bis.close();
    }
    catch (Exception e)
    {
      logger.warning(e.getMessage());
    }
    try
    {
      out.close();
    }
    catch (Exception e)
    {
      logger.warning(e.getMessage());
    }
  }

  @Override
  protected void setViewContext()
  {
    this.viewCxt = ViewContext.VIEW_HTML_NON_SS;
  }

  @Override
  protected boolean allowViewEditorDraft()
  {
    return false;
  }

  @Override
  protected void doFileSizeCheck(HttpServletRequest request) throws FileSizeException
  {
    boolean exceedHtmlLimit = false;
    String maxSize = DocumentTypeUtils.isPres(docEntry.getMimeType()) ? PresConfig.getMaxSize() : ((DocumentTypeUtils.isText(docEntry
        .getMimeType()) ? (DocumentTypeUtils.RTF_MIMETYPE.equals(docEntry.getMimeType()) ? TextConfig.getMaxSizeByExtension(docEntry
        .getExtension()) : TextConfig.getMaxSize()) : HTMLViewConfig.getMaxSize()));
    request.setAttribute("viewer_config", getConvertionLimits());

    String type = DocumentTypeUtils.getStellentType(docEntry.getMimeType());
    request.setAttribute("doc_type", type);
    /**
     * for max_size of rtf
     */
    if (DocumentTypeUtils.isText(docEntry.getMimeType()))
    {
      String extension = docEntry.getExtension();
      request.setAttribute("doc_extension", extension);
    }

    if (docEntry.getMediaSize() == -1)
    {
      ICacheDescriptor sourceCacheDesc = new HTMLCacheDescriptor(user, new SimpleLocalEntry(docEntry.getDocUri(), docEntry.getMimeType(),
          RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
      // CacheStorageManager.getCacheStorageManager().getLCFilesCacheDescriptor(user.getCustomerId(),
      // docEntry.getDocUri(), TempStorageRepository.VERSION_LABEL, isHTMLView());

      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);
      ICacheStorageAdapter tempFile = CacheStorageAdapterFactory.newCacheAdapter(sourceCacheDesc.getInternalURI(), "tempstorage",
          storageAdapter);
      exceedHtmlLimit = LimitsUtil.exceedLimits(tempFile.getSize(), maxSize);
    }
    else if (docEntry.getMediaSize() != -1)
    {
      exceedHtmlLimit = LimitsUtil.exceedLimits(docEntry.getMediaSize(), maxSize);
    }

    if (exceedHtmlLimit)
    {
      throw new FileSizeException();
    }
  }

  private JSONObject getConvertionLimits()
  {
    JSONObject limits = new JSONObject();
    limits.put("text", TextConfig.getLimits());
    limits.put("sheet", HTMLViewConfig.getLimits());
    limits.put("pres", PresConfig.getLimits());
    return limits;
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
  protected void initCacheDescriptor()
  {
    cacheDesc = new HTMLCacheDescriptor(user, docEntry);
  }
}
