/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.lc3.repository.LCFilesEJBRepository;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.journal.JournalHelper;
import com.ibm.concord.viewer.platform.journal.JournalWriter;
import com.ibm.concord.viewer.platform.repository.DocumentEntryHelper;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.adapter.DocumentServiceAdapter;
import com.ibm.concord.viewer.spi.action.IViewAction;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.IReviewable;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.FileSizeException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.exception.SnapshotException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;
import com.ibm.docs.viewer.ecm.util.CommunityMemberParser;
import com.ibm.json.java.JSONObject;
import com.ibm.lconn.files.spi.remote.DocumentService;
import com.ibm.misc.BASE64Decoder;

/**
 * @author niebomin
 *
 */
public abstract class AbstractViewAction implements IViewAction
{
  private static final Logger logger = Logger.getLogger(AbstractViewAction.class.getName());

  private static final String CLASS_NAME = AbstractViewAction.class.getName();

  public static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  public static final String ATTR_ERROR_CODE = "error_code";

  public static final String FAST_DOWNLOAD_CONFIG = "IHS_fast_download";

  protected UserBean user;

  protected IDocumentEntry docEntry = null;

  protected ICacheDescriptor cacheDesc;

  protected boolean isAttachment = false;

  protected String contentPath;

  protected boolean forceSave;

  protected HashMap<String, Boolean> parameters;

  private String modified;

  private static boolean initialized = false;

  protected static boolean IHSDownload = false;

  protected static String cacheRootAlias;

  private static final String IBM_DOCS_IS_ENABLED = "attr_is_docs_enabled";

  private static final String ENTITILEMENT_COOKIE_NAME = "entitlements";

  private static final String IBM_DOCS_URI_PATTEN = "attr_docs_uri";

  private static final String IBM_DOCS_IS_DOCTYPE_SUPPORTED = "attr_is_doctype_supported_by_docs";

  private static final String IBM_DOCS_IS_EDITOR = "attr_is_docs_editor";

  private static boolean editorEnabled = false;

  private static String editorURIPattern = "";

  private static String editorExceptionType = "";

  protected ViewContext viewCxt;

  protected IConversionHelper conHelper = null;

  protected boolean convertIgnored = false;

  protected String jobId = "Invalid job id";

  protected abstract boolean allowViewEditorDraft();

  protected abstract void postServeViewerPage(HttpServletRequest request) throws InterruptedException, IOException;

  protected abstract void setViewContext();

  protected abstract void initConversionHelper();

  protected abstract void conversionDone(final HttpServletRequest request, final HttpServletResponse response,
      ImportDraftFromRepositoryContext jContext) throws InterruptedException, IOException;

  protected abstract void doFileSizeCheck(HttpServletRequest request) throws FileSizeException;

  protected abstract void initMore();

  public void init()
  {
    initOnce();

    if (!contentPath.equalsIgnoreCase("content"))
    {
      // Here DocumentEntry need to be handled, if docEntry is newer than docVersion, then old version DocumentEntry will be returned
      docEntry = DocumentEntryHelper.getDocumentEntry(docEntry, modified);
      isAttachment = true;
    }

    setViewContext();

    initCacheDescriptor();

    initConversionHelper();

    initMore();
  }

  private void initOnce()
  {
    if (!initialized)
    {
      try
      {
        JSONObject config = Platform.getViewerConfig().getSubConfig(ViewerConfig.FAST_DOWNLOAD_CONFIG);
        IHSDownload = Boolean.valueOf((String) config.get("enabled"));
        cacheRootAlias = (String) config.get(ViewerConfig.CACHE_ROOT_ALIAS);

        logger.info("IHS Download Enabled: " + IHSDownload + ", Cache Root Alias: " + cacheRootAlias);

        JSONObject conf = Platform.getViewerConfig().getSubConfig(ViewerConfig.EDITOR_INTEGRATION);
        editorEnabled = Boolean.valueOf((String) conf.get(ViewerConfig.EDITOR_ENABLED));
        editorExceptionType = (String) conf.get(ViewerConfig.EDITOR_EXCEPTION_TYPE);
        editorURIPattern = (String) conf.get(ViewerConfig.EDITOR_URI);
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "Fail to read IHS download setting. IHS Download Enabled: {0}, Cache Root Alias: {1}", new Object[] {
            IHSDownload, cacheRootAlias });
      }
      initialized = true;
    }
  }

  public AbstractViewAction(UserBean user, IDocumentEntry entry, String contentPath, String modified, HashMap<String, Boolean> parameters)
  {
    this.user = user;
    this.docEntry = entry;
    this.contentPath = contentPath;
    this.parameters = parameters;
    this.modified = modified;
  }

  public boolean isHTMLView()
  {
    return this.viewCxt == ViewContext.VIEW_HTML_SS || this.viewCxt == ViewContext.VIEW_HTML_NON_SS;
  }

  /**
   * Need to be overridden by SnapshotViewAction
   *
   * @return
   */
  protected abstract void initCacheDescriptor();

  protected boolean requireConvert() throws CacheStorageAccessException, CacheDataAccessException, SnapshotException, Exception
  {
    return !cacheDesc.isValid() || cacheDesc.isPasswordHashExist();
  }

  public void exec(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException
  {
    logger.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    StringBuffer msg = new StringBuffer();

    // View a document no published
    if (!allowViewEditorDraft() && contentPath.equalsIgnoreCase("content") && docEntry.getMediaSize() == 0)
    {
      logger.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "View a document not published : %s .", docEntry.getDocUri()).toString()).toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_UNPUBLISHED_FILE);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    if (isAttachment)
    {
      try
      {
        serveAttachment(request, response);
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "serveAttachment throws exception: " + e.getMessage(), e);
      }
      return;
    }

    try
    {
      try
      {
        doFileSizeCheck(request);
      }
      catch (Exception e)
      {
        msg = new StringBuffer();
        msg.append(ServiceCode.S_SEVERE_MEDIA_SIZE_EXCEEDS);
        msg.append(" Doc id is ").append(docEntry.getDocUri());
        msg.append(" Mime type is ").append(docEntry.getMimeType());
        msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
        logger.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
            ServiceCode.SEVERE_MEDIA_SIZE_EXCEEDS, msg.toString())).toString());
        request.setAttribute(ATTR_ERROR_CODE, ConversionException.EC_CONV_DOC_TOOLARGE);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      if (requireConvert())
      {
        logger.info("require convert...");
        ImportDraftFromRepositoryContext jContext = null;
        try
        {
          jContext = conHelper.prepare(this);
         if(cacheDesc.isPasswordHashExist() ) {
           jContext.isPromptPassword = true;
         }
          conHelper.setUserAgent(jContext, request.getHeader("User-Agent"));
          conHelper.setCompactMode(jContext, request.getParameter("mode"));
        }
        catch (IllegalArgumentException e)
        {
          logger.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format("IllegalArgumentException : %s .",
              new Object[] { e })).toString());
          response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          request.setAttribute(ATTR_ERROR_CODE, CacheStorageAccessException.EC_CACHESTORAGE_ACCESS_ERROR);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }

        if (Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId()) && cacheDesc.exists() && !jContext.isPromptPassword)
        {
          conversionDone(request, response, jContext);
        }
        else
        {
          jobId = conHelper.schedule(jContext);

          logger.log(Level.FINEST, "Job is mapping to doc and workingDir: " + jobId + "->" + docEntry.getDocUri() + "->"
              + jContext.getWorkingDir().getAbsolutePath());
        }
      }
      else
      {
        convertIgnored = true;
        updateAccessTimeForHK();
      }

      preServeViewerPage(request, response);

      serveViewerPage(request, response);

      postServeViewerPage(request);

    }
    catch (CacheStorageAccessException e)
    {
      logger.severe(new LogEntry(docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " CacheStorageAccessException error throws : %s . ", new Object[] { e })).toString());
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      request.setAttribute(ATTR_ERROR_CODE, CacheStorageAccessException.EC_CACHESTORAGE_ACCESS_ERROR);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
    }
    catch (CacheDataAccessException e)
    {
      logger.severe(new LogEntry(docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " CacheDataAccessException error throws : %s . ", new Object[] { e })).toString());
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      request.setAttribute(ATTR_ERROR_CODE, CacheDataAccessException.EC_CACHEDATA_ACCESS_ERROR);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
    }
    catch (IllegalStateException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_WORK_UNABLE_START);
      msg.append("This occurred when upload files.");
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.warning(new LogEntry(docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), LoggerUtil.getLogMessage(
          ServiceCode.ERROR_WORK_UNABLE_START, msg.toString())).toString());
      request.setAttribute(ATTR_ERROR_CODE, ConversionException.EC_CONV_UNEXPECIFIED_ERROR);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
    }
    catch (SnapshotException e)
    {
      request.setAttribute(ATTR_ERROR_CODE, e.getErrorCode());
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
    }
    catch (Exception e)
    {
      logger.logp(Level.WARNING, "AbstractViewAction", "exec", e.getMessage(), e);
      logger.warning(new LogEntry(docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " The outer try catch in viewaction.exec exception: %s . ", new Object[] { e })).toString());
      // logger.log(Level.WARNING, "serveViewerPage throws exception " + docEntry.getDocId() + e.getMessage(), e);
      request.setAttribute(ATTR_ERROR_CODE, ConversionException.EC_CONV_UNEXPECIFIED_ERROR);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
    }

    logger.exiting(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());
  }

  protected void updateAccessTimeForHK()
  {
    try
    {
      ImportDraftFromRepositoryContext jContext = null;
      jContext = conHelper.prepare(this);
      Job.hitCache(jContext.getWorkingDir(), jContext.getJobId());
    }
    catch (Exception e)
    {
      logger.warning("failed to update cache access time.");
    }
  }

  @SuppressWarnings("serial")
  protected void preServeViewerPage(HttpServletRequest request, HttpServletResponse response) throws InterruptedException, IOException
  {
    enableEdit(request);

    request.setAttribute("parameters", parameters);

    if (this.docEntry instanceof IReviewable)
    {
      final IReviewable reviewable = (IReviewable) this.docEntry;

      IRepositoryAdapter adapter = RepositoryServiceUtil.getRepositoryAdapter(docEntry.getRepository());

      final JSONObject role = ((ECMRepository) adapter).getCommunityMemberType(user, reviewable);

      JSONObject reviewData = new JSONObject()
      {
        {
          put(IReviewable.GLOBAL_APPROVAL_PROP, reviewable.getGlobalApprovalProperties());
          put(IReviewable.APPROVERS, reviewable.getApprovers());
          put(IReviewable.LOCK_OWNER, reviewable.getLockOwner());
          put(IReviewable.COMMUNITY_INFO, reviewable.getCommunityInfo());
          put(IReviewable.LIBRARY_INFO, reviewable.getLibraryInfo());
          if (role != null)
          {
            put(IReviewable.COMMUNITY_OWNER, role.get(CommunityMemberParser.ROLE));
          }
          else
          {
            logger.log(Level.WARNING, "Failed to get role. docId={0}, userId={1}", new String[] { docEntry.getDocUri(), user.getId() });
          }
        }
      };

      request.setAttribute("review", reviewData);
    }
  }

  private void logDownload()
  {
    StringBuffer msg = new StringBuffer("View Request - ");
    msg.append("user: ").append(user.getId());
    msg.append(", repoId: ").append(docEntry.getRepository());
    msg.append(", docId: ").append(docEntry.getDocId());
    msg.append(", mime type: ").append(docEntry.getMimeType());
    msg.append(", lastModified: ").append(docEntry.getModified().getTimeInMillis());
    msg.append(", size: ").append(docEntry.getMediaSize());
    logger.info(msg.toString());

    // Set EJB journal, this journal mechanism only works for EJB on Smart Cloud
    try
    {
      String repoId = docEntry.getRepository();
      if (repoId.equalsIgnoreCase("lcfiles"))
      {
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
            .getService(repoId);
        IRepositoryAdapter adaptor = service.getRepository(repoId);
        if (adaptor instanceof LCFilesEJBRepository)
        {
          LCFilesEJBRepository ejbAdapter = (LCFilesEJBRepository) adaptor;
          DocumentService docService = ejbAdapter.getDocumentService(user.getOrgId());
          if (docService != null)
          {
            DocumentServiceAdapter srv = new DocumentServiceAdapter(docService);
            srv.addJournalLog(UUID.fromString(docEntry.getDocId()));
          }
        }
      }
    }
    catch (Exception e)
    {
      logger.logp(Level.WARNING, CLASS_NAME, "logDownload", "Invoking log download error: " + e.getMessage());
    }
  }

  public void logViewRequest()
  {
    updateViewCounts();
    logDownload();

    if (!Platform.getViewerConfig().isSmartCloud())
    {
      try
      {
        JournalWriter.setJournal(System.currentTimeMillis(), user, docEntry, JournalHelper.Outcome.SUCCESS);
      }
      catch (Exception e)
      {
        logger.log(Level.WARNING, "ViewAction JournalWriter.setJournal throws exception: " + e.getMessage(), e);
      }
    }
  }

  private void updateViewCounts()
  {
    if (this.viewCxt == ViewContext.VIEW_HTML_SS && !this.convertIgnored)
    {
      // When snapshot conversion is required, view will be counted through download by Editor.
      // So skip count at viewer side.
    }
    else
    {
      try
      {
        IRepositoryAdapter adapter = RepositoryServiceUtil.getRepositoryAdapter(docEntry.getRepository());
        adapter.logEvent(user, docEntry.getDocUri(), "view", null);
      }
      catch (UnsupportedOperationException e)
      {
        logger.log(Level.INFO, "Log view event failed. The logEvent call is not supported.");
      }
      catch (RepositoryAccessException e)
      {
        logger.log(Level.SEVERE, "Log view event failed.", e);
      }
    }
  }

  private boolean isDocsEntitlted(HttpServletRequest request)
  {
    Cookie[] cookies = request.getCookies();
    if (cookies != null)
    {
      for (Cookie cookie : cookies)
      {
        String name = cookie.getName();
        if (name.equals(ENTITILEMENT_COOKIE_NAME))
        {
          String value = cookie.getValue();
          String[] values = value.split("-");
          String entiltedApps = values[1];
          BASE64Decoder decoder = new BASE64Decoder();
          try
          {
            entiltedApps = new String(decoder.decodeBuffer(entiltedApps));
          }
          catch (IOException e)
          {
            logger.warning("Failed to decode cookie. " + e.getMessage());
            return false;
          }
          return entiltedApps.indexOf("bh_docs") >= 0;
        }
      }
    }
    // no cookie found, on premise deployment
    return true;
  }

  public void enableEdit(HttpServletRequest request)
  {

    String isDocSupported = editorExceptionType.toLowerCase().indexOf(docEntry.getExtension().toLowerCase()) < 0 ? "YES" : "NO";
    boolean docsEntitled = isDocsEntitlted(request);
    if (editorEnabled && docsEntitled)
    {
      String docURI = editorURIPattern.replace("{docid}", docEntry.getDocId());
      request.setAttribute(IBM_DOCS_IS_ENABLED, "YES");
      request.setAttribute(IBM_DOCS_URI_PATTEN, docURI);
      request.setAttribute(IBM_DOCS_IS_DOCTYPE_SUPPORTED, isDocSupported);
      logger.log(Level.FINE, "HCL Docs Integration is enabled");
    }
    else
    {
      request.setAttribute(IBM_DOCS_IS_ENABLED, "NO");
      request.setAttribute(IBM_DOCS_IS_DOCTYPE_SUPPORTED, isDocSupported);
      logger.log(Level.FINE, "HCL Docs Integration is disabled");
    }
    if (Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      // If the creator length is 4 then it is used by EJB, otherwise it is used by Rest API
      if (docEntry.getCreator() != null && docEntry.getCreator().length == 4)
      {
        if (user.getId().equals(docEntry.getCreator()[0]))
        {
          request.setAttribute(IBM_DOCS_IS_EDITOR, "YES");
        }
        else
        //
        {
          if (docEntry.isIBMDocs())
          {
            request.setAttribute(IBM_DOCS_IS_EDITOR, "YES");
          }
          else
          {
            request.setAttribute(IBM_DOCS_IS_EDITOR, "NO");
            logger.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_EDIT_AUTHORIZATION, ServiceCode.S_INFO_EDIT_AUTHORIZATION));
          }
        }
      }
      else
      {
        request.setAttribute(IBM_DOCS_IS_EDITOR, "YES");
      }
    }
    else
    {
      request.setAttribute(IBM_DOCS_IS_EDITOR, "NO");
      logger.log(Level.FINEST, LoggerUtil.getLogMessage(ServiceCode.INFO_EDIT_AUTHORIZATION, ServiceCode.S_INFO_EDIT_AUTHORIZATION));
    }
  }

  public IDocumentEntry getDocEntry()
  {
    return docEntry;
  }

  public UserBean getUser()
  {
    return user;
  }

  public ICacheDescriptor getCacheDescriptor()
  {
    return cacheDesc;
  }

  public ViewContext getViewContext()
  {
    return this.viewCxt;
  }
}
