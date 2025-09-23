/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONObject;

public class UploadNewVersionAction extends EditAction
{
  private static final Logger LOG = Logger.getLogger(UploadNewVersionAction.class.getName());

  private static final String CLASS_NAME = UploadNewVersionAction.class.getName();

  private static final String STATUS = "status";

  private static final String STATUS_ERROR = "error";

  private static final String STATUS_SUCCESS = "success";

  private static final String STATUS_CONVERTING = "converting";

  private static final String JOB_ID = "jobid";

  private static final String DESCRIPTION = "description";

  private boolean isSyncDraft;

  public UploadNewVersionAction(UserBean user, IDocumentEntry docEntry, String contentPath)
  {
    super(user, docEntry, contentPath);
  }

  public UploadNewVersionAction(UserBean user, IDocumentEntry docEntry, String contentPath, Boolean isSyncDraft)
  {
    super(user, docEntry, contentPath);
    this.isSyncDraft = isSyncDraft;
  }

  protected boolean isForceUseOldDraft()
  {
    // if upload new version enabled, user can choose to keep the out of date draft.
    if (draftDesc != null && draftDesc.isDraftOutOfDate() && !isSyncDraft && !upgradeConvert)
    {
      LOG.log(Level.INFO, "Draft is out of date, but user still chose to work on it.");
      return true;
    }
    return false;
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), "no permission").toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    DocumentSession docSession = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());

    boolean shouldEditFromRepository = false;
    JSONObject retJson = new JSONObject();
    try
    {
      shouldEditFromRepository = !shouldEditFromDraft(docSession);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "Access error happens when check view from draft or repo, status code: "
          + HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e);
      retJson.put(STATUS, STATUS_ERROR);
      retJson.put(DESCRIPTION, "Access error happens when check view from draft or repo");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retJson.serialize(response.getWriter());
      return;
    }

    if (shouldEditFromRepository)
    {
      boolean shouldRenameDoc = false;
      ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();
      String deepDetectKey = "edit_deepdetect_" + docEntry.getDocUri();
      deepDetectKey = URLEncoder.encode(deepDetectKey, "UTF-8");
      JSONObject json = ServiceUtil.getJSONDataFromCookie(request.getCookies(), deepDetectKey);
      if (json != null)
      {
        String format = (String) json.get("correctFormat");
        if (format != null && !format.equals(""))
        {
          String mime = Platform.getMimeType("." + format);
          shouldRenameDoc = (mime != null && !mime.equals(docEntry.getMimeType()));
          jContext.sourceMime = mime;
          docEntry.setMimeType(mime);
        }
      }
      else
      {
        jContext.sourceMime = docEntry.getMimeType();
      }

      /*
       * Ensure the limits check based on the corrected MIME type.
       */
      {
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
        boolean everAccess = docHistoryBean != null && docHistoryBean.getLastModified() == docEntry.getModified().getTimeInMillis();
        String mimeType = docEntry.getMimeType();
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
        long size = docEntry.getMediaSize();
        JSONObject limits = (JSONObject) docSrv.getConfig().get("limits");

        if ("text/csv".equals(mimeType) && LimitsUtil.exceedTextFileSizeLimit(size, limits))
        {
          // CSV file exceed limits
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " Document is too large ").toString());
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
        if (!everAccess && !LimitsUtil.accessByMobile(request)
            && LimitsUtil.exceedLimits(docEntry.getMediaSize(), (JSONObject) docSrv.getConfig().get("limits")))
        {
          // File exceed limits
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " Document is too large ").toString());
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
        if (!everAccess && LimitsUtil.accessByMobile(request) && LimitsUtil.exceedMobileSizeLimit(request, docEntry, docSrv))
        {
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " Document exceeds size limitation on Mobile ").toString());
          request.setAttribute(ATTR_MOBILE_ERROR_MSG, LimitsUtil.getShowSizeOfMobile(docSrv));
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY_File_Size_Mobile);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
      }

      jContext.forceSave = RepositoryServiceUtil.supportCheckin(docEntry.getRepository()) ? false : forceSave;

      jContext.upgradeConvert = (upgradeConvert && !this.isSyncDraft); // need not upgrade current draft if choose new version
      if (jContext.upgradeConvert)
      {
        try
        {
          JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
          String mime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
          jContext.modified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey())).getCalendar()
              .getTimeInMillis();
          jContext.sourceMime = mime;
          jContext.targetMime = docServiceProvider.getDocumentType(mime);
        }
        catch (DraftDataAccessException e)
        {
          LOG.log(Level.WARNING, "Failed to get draft meta when upgrade convert file: {0} and the exceptions are: {1}", new Object[] {
              jContext.mediaURI, e });
        }
      }
      else
      {
        jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
        jContext.modified = docEntry.getModified().getTimeInMillis();
      }

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.draftDescriptor = draftDesc;

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

      if (Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId()) && draftExisted && !upgradeConvert)
      {
        if (shouldRenameDoc)
        {
          try
          {
            // Change the extension name to correct one.
            docEntry = DocumentServiceUtil.correctFileName(user, docEntry);
          }
          catch (Exception ex)
          {
            LOG.log(Level.WARNING, "Failed to correct the document file name", ex);
          }
        }
        retJson.put(STATUS, STATUS_SUCCESS);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        retJson.serialize(response.getWriter());
      }
      else
      {
        URLConfig config = URLConfig.toInstance();

        Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
        importMediaJob.config = config;
        String jobId = importMediaJob.schedule();

        retJson.put(STATUS, STATUS_CONVERTING);
        retJson.put(JOB_ID, jobId);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        retJson.serialize(response.getWriter());
      }
    }
    else
    {
      retJson.put(STATUS, STATUS_SUCCESS);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retJson.serialize(response.getWriter());
    }

    LOG.exiting(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());
  }
}
