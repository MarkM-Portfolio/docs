/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.DocumentPageSettingsUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ConvertDraftMediaContext;
import com.ibm.concord.job.context.ConvertRepositoryMediaContext;
import com.ibm.concord.job.object.ConvertDraftMediaJob;
import com.ibm.concord.job.object.ConvertRepositoryMediaJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.MimeTypeUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ViewAction
{
  private static final Logger LOG = Logger.getLogger(ViewAction.class.getName());

  private static final String CLASS_NAME = ViewAction.class.getName();

  private static final String CHECK_JSP = "/WEB-INF/pages/appcheck.jsp";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private static final String ATTR_ERROR_CODE = "error_code";

  private UserBean user;

  private IDocumentEntry docEntry;

  private boolean isDraft;

  private DraftDescriptor draftDesc;

  private String contentPath;

  private String deepDetectKey;

  private JSONObject deepDetectJson;

  public ViewAction(UserBean user, IDocumentEntry docEntry, boolean isDraft, String contentPath)
  {
    this.user = user;
    this.docEntry = docEntry;
    this.isDraft = isDraft;
    this.contentPath = contentPath;
  }

  private boolean shouldViewFromDraft(DocumentSession docSess, boolean draftFlag) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    /*
     * Operation A: [R&W] [discard draft] from house keeping. system initiated. Operation B: [R&W] [discard draft and import latest publish
     * version] from edit button. user initiated, within single user request. Operation C: [R&W] [discard draft -> import latest publish
     * version] from discard draft menu. user initiated, across two user requests. Operation D: [R&W] [edit draft] from edit button. user
     * initiated, within single user request. Operation E: [R&W] [view draft] from view button or menu.
     * 
     * 5 (Readers) * 5 (Writers) + 5 = 30
     */
    if (docSess == null)
    {
      String orgId = ConcordUtil.retrieveFileOwnerOrgIdFromDB(docEntry);
      if (orgId == null)
      {
        orgId = ConcordUtil.retrieveFileOwnerOrgId(docEntry, user);
      }
      draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(orgId, docEntry.getRepository(), docEntry.getDocUri());

      if (DraftStorageManager.getDraftStorageManager().isDraftExisted(draftDesc))
      {
        return draftFlag; // view from draft by default.
      }
      else
      {
        return false; // always view from repository when there is no draft at all.
      }
    }
    else
    {
      draftDesc = docSess.getDraftDescriptor();
      return true; // always view from draft when there is an editing draft.
    }
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    String asFormat = request.getParameter("asFormat");

    String asFormatMime = null;
    if (asFormat == null)
    {
      asFormat = "html";
    }

    asFormatMime = Platform.getMimeType("." + asFormat.toLowerCase());

    if (!Permission.VIEW.hasPermission(docEntry.getPermission()))
    {
      LOG.warning(new LogEntry(docEntry.getDocUri(), URLConfig.getRequestID(), URLConfig.getResponseID(), "  have no permission  ")
          .toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    DocumentSession docSession = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());

    boolean viewFromRepository = false;
    try
    {
      viewFromRepository = !shouldViewFromDraft(null, isDraft); // Ignore session existence intentionally.
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "Storage access error happens when check view from draft or repo.", e);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    LOG.info(new ActionLogEntry(user, Action.DOWNLOADAS, docEntry.getDocUri(), "asFormat: " + asFormatMime).toString());

    deepDetectKey = "export_deepdetect_" + docEntry.getDocUri() + "_" + asFormat;
    deepDetectKey = URLEncoder.encode(deepDetectKey, "UTF-8");
    deepDetectJson = ServiceUtil.getJSONDataFromCookie(request.getCookies(), deepDetectKey);
    
    Map<String, Object> options = extractViewOptions(request);
    if (!isMobile(request) && asFormat != null && asFormat.equalsIgnoreCase("pdf"))
    {
      JSONObject json = getPageSettings(user, docEntry);
      if(json != null)
      {
        Map<String, Object> tempOptions = new HashMap<String, Object>(options);
        options = DocumentPageSettingsUtil.mergeJsonToOptions(json, tempOptions); // use merged options to export pdf
        JSONObject newJson = DocumentPageSettingsUtil.mergeOptionsToJson(tempOptions, json); // persistent options to json file
        setPageSettings(user, docEntry, newJson);
      }      
    }

    if (viewFromRepository)
    {
      ConvertRepositoryMediaContext jContext = new ConvertRepositoryMediaContext();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.sourceMime = docEntry.getMimeType();
      jContext.targetMime = asFormatMime;
      jContext.targetExtension = asFormat;
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.options = options;

      jContext.requester = user;
      jContext.docEntry = docEntry;

      if (deepDetectJson != null)
      {
        String sourceFormat = (String) deepDetectJson.get("correctFormat");
        if (sourceFormat != null && !sourceFormat.equals(""))
        {
          String sourceMime = Platform.getMimeType("." + sourceFormat);
          jContext.sourceMime = sourceMime;
          docEntry.setMimeType(sourceMime);
          if (asFormat != null && !asFormat.equalsIgnoreCase("pdf"))
          {
            String ext = FormatUtil.ODF2MS.get((sourceFormat));
            if (ext != null)
            {
              jContext.targetMime = Platform.getMimeType("." + ext); // ???? why
            }
            else
            {
              DocumentServiceUtil.forwardError(docEntry, request, response);
            }
          }
        }
      }

      /*
       * Ensure the limits check based on the corrected MIME type.
       */
      {
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
        boolean everAccess = docHistoryBean != null && docHistoryBean.getLastModified() == docEntry.getModified().getTimeInMillis();
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
        if (!everAccess && LimitsUtil.exceedLimits(docEntry.getMediaSize(), (JSONObject) docSrv.getConfig().get("limits")))
        {
          // File exceed limits
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              " is too large to process when exporting document with size: %s . ", new Object[] { docEntry.getMediaSize() })).toString());
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
      }

      File workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId()));
      jContext.setWorkingDir(workingDir);

      if (Job.isFinishedSuccess(workingDir, jContext.getJobId()))
      {
        LOG.finer("Export from Repository");

        Job.hitCache(workingDir, jContext.getJobId());
        serveExport(request, response, Job.getResultFile(workingDir), asFormat);
        /**
         *  57896 : increase every time when download pdf from repository 
         */
        {
          RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
              .getService(RepositoryProviderRegistry.class);
          IRepositoryAdapter adapter = service.getRepository(docEntry.getRepository());
          try
          {
            adapter.logEvent(user, docEntry.getDocUri(), "view", null);
          }
          catch (UnsupportedOperationException e)
          {
            LOG.log(Level.INFO, "Log view event failed. The logEvent call is not supported.");
          }
          catch (RepositoryAccessException e)
          {
            LOG.log(Level.SEVERE, "Log view event failed.", e);
          }
        }
      }
      else
      {
        if (contentPath.equalsIgnoreCase("content"))
        {
          URLConfig config = URLConfig.toInstance();

          Job convertRepoMediaJob = new ConvertRepositoryMediaJob(jContext);
          convertRepoMediaJob.config = config;
          String jobId = convertRepoMediaJob.schedule();

          request.setAttribute("jobId", jobId);
          request.setAttribute("repoId", docEntry.getRepository());
          request.setAttribute("docUri", docEntry.getDocUri());
          request.setAttribute("mode", "view");
          request.setAttribute("draft", isDraft);
          if (asFormat != null)
          {
            request.setAttribute("asFormat", asFormat);
          }
          request.getRequestDispatcher(CHECK_JSP).forward(request, response);
        }
        else
        {
          /*
           * This ELSE logic is very important in that when a document in deep detect mode, it will be converted into correct format. And
           * when attachment request is received, Job.isFinish() will return false, MD5 changed due to the format is changed to wrong mime
           * type under deep detect mode. But we still need to avoid schedule new Job in those cases.
           */
          /*
           * if(json != null) { JSONObject document = (JSONObject)json.get(docEntry.getDocUri()); if(document != null) { String jobId =
           * (String)document.get("jobId"); if(jobId != null) workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(),
           * docEntry.getDocUri(),jobId)); } }
           */
          serveAttachment(request, response, workingDir.getPath());
        }
      }
    }
    else
    {
      JSONObject draftMeta;
      try
      {
        if (docSession != null)
        {
          // autosave to update last modified date
          docSession.autoSave();
        }

        draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
      }
      catch (DraftDataAccessException e)
      {
        LOG.log(Level.SEVERE, "Data access error happens when getting draft meta information.", e);
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }

      ConvertDraftMediaContext jContext = new ConvertDraftMediaContext();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.options = options;
      jContext.docEntry = docEntry;
      jContext.draftModified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey())).getTime();
      jContext.requester = user;
      jContext.draftDesp = draftDesc;
      jContext.sourceMime = docEntry.getMimeType();
      jContext.targetMime = asFormatMime;
      jContext.targetExtension = asFormat;

      File workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId()));
      jContext.setWorkingDir(workingDir);

      if (Job.isFinishedSuccess(workingDir, jContext.getJobId()))
      {
        LOG.finer("Export from Draft");

        File result = Job.getResultFile(workingDir);
        Job.hitCache(workingDir, jContext.getJobId());
        serveExport(request, response, result, asFormat);
      }
      else
      {
        URLConfig config = URLConfig.toInstance();

        Job convertDraftMediaJob = new ConvertDraftMediaJob(jContext);
        convertDraftMediaJob.config = config;
        String jobId = convertDraftMediaJob.schedule();

        request.setAttribute("jobId", jobId);
        request.setAttribute("repoId", docEntry.getRepository());
        request.setAttribute("docUri", docEntry.getDocUri());
        request.setAttribute("mode", "view");
        request.setAttribute("draft", isDraft);
        if (asFormat != null)
        {
          request.setAttribute("asFormat", asFormat);
        }

        request.getRequestDispatcher(CHECK_JSP).forward(request, response);
        return;
      }
    }

    LOG.exiting(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());
  }
  
  private boolean isMobile(HttpServletRequest request)
  {
    Object oMobile = request.getParameter("bMobile");
    boolean bMobile = false;
    if (oMobile != null)
    {
      if (oMobile.toString().equalsIgnoreCase("true"))
        bMobile = true;
    }
    else
    {
      // check if the request from mobile client
      String ua = request.getHeader("User-Agent");
      if (ua != null && ua.toLowerCase().contains("mobile"))
      {
        bMobile = true;
      }
    }
    return bMobile;
  }

  private Map<String, Object> extractViewOptions(HttpServletRequest request)
  {
    Map<String, Object> options = new HashMap<String, Object>();
    Map<?, ?> rawOptions = request.getParameterMap();
    rawOptions.remove("dojo.preventCache");   
    boolean bMobile = isMobile(request);
    Iterator<?> iter = rawOptions.keySet().iterator();
    while (iter.hasNext())
    {
      String key = (String) iter.next();
      options.put(key, rawOptions.get(key));
    }

    if (bMobile)
      options.put("bMobile", "true");
    else
      options.remove("bMobile");

    return options;
  }

  /**
   * Forward to the Viewer Page.
   * 
   * @throws ServletException
   * @throws IOException
   */
  @SuppressWarnings("unused")
  private void serveViewerPage(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    try
    {
//      HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      DocumentServiceUtil.forwardView(user, docEntry, request, response);
    }
    catch (Exception e)
    {
      //      String problemId = ConcordUtil.generateProblemId();
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " problem id %s and Exception : %s . ", new Object[] { URLConfig.getRequestID(), e })).toString());
      //      request.setAttribute("problem_id", problemId);
//      HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }

  private void serveExport(HttpServletRequest request, HttpServletResponse response, File exportedFile, String asFormat) throws IOException
  {
    InputStream is = null;
    OutputStream os = null;
    File readingTag = null;
    try
    {
      readingTag = new File(exportedFile.getParent(), UUID.randomUUID().toString() + ".reading");
      if (!readingTag.exists())
      {
        FileUtil.nfs_createNewFile(readingTag, FileUtil.NFS_RETRY_SECONDS);
      }

      if (deepDetectJson != null)
      {
        String sourceFormat = (String) deepDetectJson.get("correctFormat");
        if (sourceFormat != null && !sourceFormat.equals(""))
        {
          if (!asFormat.equals("pdf"))
          {
            asFormat = FormatUtil.ODF2MS.get((sourceFormat));
          }
        }
        Cookie cookie = new Cookie(deepDetectKey, "");
        cookie.setMaxAge(-1);
        cookie.setPath(request.getContextPath());
        response.addCookie(cookie);
      }
      response.setContentType(Platform.getMimeType("." + asFormat));
      response.setHeader("Content-Length", Long.valueOf(exportedFile.length()).toString());
      response.setHeader("Content-Disposition", ServiceUtil.getDocumentContentDispositionValue(request, docEntry, asFormat));
      response.setHeader("X-Content-Type-Options", "nosniff");
//      HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      response.setStatus(HttpServletResponse.SC_OK);
      is = new BufferedInputStream(new FileInputStream(exportedFile));
      os = response.getOutputStream();
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = is.read(data)) > 0)
      {
        os.write(data, 0, numRead);
      }
      /*
       * Remove the Action journal, will be handled in JOB as EXPORT IJournalAdapter journalAdapter = (IJournalAdapter)
       * Platform.getComponent( JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class); JournalHelper.Actor a = new
       * JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId()); JournalHelper.Entity jnl_obj = new
       * JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitle(), docEntry.getDocId(),user.getCustomerId());
       * journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a, JournalHelper.Action.EXPORT, jnl_obj,
       * JournalHelper.Outcome.SUCCESS).build());
       */
      
    }
    finally
    {
      try
      {
        if (is != null)
        {
          is.close();
          is = null;
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when closing input stream" + e);
      }

      try
      {
        if (os != null)
        {
          os.close();
          os = null;
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "io error when closing output stream" + e);
      }

      if (readingTag != null && readingTag.exists())
      {
        FileUtil.nfs_delete(readingTag, FileUtil.NFS_RETRY_SECONDS);
      }
    }
  }

  private void serveAttachment(HttpServletRequest request, HttpServletResponse response, String cacheDir) throws ServletException
  {
    BufferedInputStream attachMediaStream = null;
    ServletOutputStream out = null;
    try
    {
      String mimeType = MimeTypeUtil.MIME_TYPE_MAP.getContentType(contentPath);
      response.setContentType(mimeType);
      response.setCharacterEncoding("UTF-8");
      response.setHeader("Cache-Control", "Max-Age=" + 3600);
      response.setHeader("Content-disposition", "filename=" + docEntry.getTitle());
      response.setStatus(HttpServletResponse.SC_OK);

      attachMediaStream = new BufferedInputStream(new FileInputStream(new File(cacheDir, contentPath)));
      out = response.getOutputStream();
      int numRead = -1;
      byte[] data = new byte[8192];
      while ((numRead = attachMediaStream.read(data)) > 0)
      {
        out.write(data, 0, numRead);
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Status code " + HttpServletResponse.SC_NOT_FOUND + ", io error when writing to outputstream", e);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
    finally
    {
      try
      {
        if (out != null)
        {
          out.close();
        }
        if (attachMediaStream != null)
        {
          attachMediaStream.close();
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "View Attachment OutputStream close failed.", e);
      }
    }
  }
  
  private JSONObject getPageSettings(UserBean caller, IDocumentEntry docEntry)
  {
    JSONObject json = null;
    try
    {
      json = DocumentPageSettingsUtil.getPageSettingsAsJson(caller, docEntry);
    }
    catch (DraftDataAccessException e)
    {
      LOG.log(Level.WARNING, "Error to get page settings when export: " + e);
    }
    catch (DraftStorageAccessException e)
    {
      LOG.log(Level.WARNING, "Error to get page settings when export: " + e);
    }
    
    return json;
  }
  
  private boolean setPageSettings(UserBean caller, IDocumentEntry docEntry, JSONObject json)
  {
    boolean ret = false;
    try
    {
      DocumentPageSettingsUtil.setPageSettingsAsJson(caller, docEntry, json);
      ret = true;
    }
    catch (DraftDataAccessException e)
    {
      LOG.log(Level.WARNING, "Error to set page settings when export: " + e);
    }
    catch (DraftStorageAccessException e)
    {
      LOG.log(Level.WARNING, "Error to set page settings when export: " + e);
    }
    return ret;
  }  
}
