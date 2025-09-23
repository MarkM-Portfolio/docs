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

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
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
import com.ibm.json.java.JSONObject;

public class DecryptAction extends EditAction
{
  private static final Logger LOG = Logger.getLogger(DecryptAction.class.getName());

  private static final String CLASS_NAME = DecryptAction.class.getName();

  private static final String STATUS = "status";

  private static final String STATUS_ERROR = "error";

  private static final String STATUS_SUCCESS = "success";

  private static final String STATUS_CONVERTING = "converting";

  private static final String JOB_ID = "jobid";

  private static final String DESCRIPTION = "description";

  private String password;

  public DecryptAction(UserBean user, IDocumentEntry docEntry, String contentPath)
  {
    super(user, docEntry, contentPath);
  }

  public DecryptAction(UserBean user, IDocumentEntry docEntry, String contentPath, String password)
  {
    super(user, docEntry, contentPath);
    this.password = password;
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    JSONObject retJson = new JSONObject();

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID()," have no permission " ).toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    DocumentSession docSession = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());

    boolean shouldEditFromRepository = false;
    try
    {
      shouldEditFromRepository = !shouldEditFromDraft(docSession);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.WARNING, "Access error happens when check view from draft or repo, status code {0}.",
          HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      retJson.put(STATUS, STATUS_ERROR);
      retJson.put(DESCRIPTION, "Access error happens when check view from draft or repo");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retJson.serialize(response.getWriter());
      return;
    }

    if (shouldEditFromRepository)
    {
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
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
        if (!everAccess && LimitsUtil.exceedLimits(docEntry.getMediaSize(), (JSONObject) docSrv.getConfig().get("limits")))
        {
          // File exceed limits
          LOG.log(Level.WARNING, "document is too large");
          retJson.put(STATUS, STATUS_SUCCESS);
          retJson.put(DESCRIPTION, "Data access error happens when check view from draft or repo");
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          retJson.serialize(response.getWriter());
          return;
        }
      }

      jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.forceSave = forceSave;

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.draftDescriptor = draftDesc;
      jContext.password = password;

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

      if (Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId()) && draftExisted)
      {
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

        // request.setAttribute("jobId", jobId);
        retJson.put(STATUS, STATUS_CONVERTING);
        retJson.put(JOB_ID, jobId);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        retJson.serialize(response.getWriter());
      }
      /*
       * Remove DecrypAction Journal, will be journaled as IMPORT action in future // Edit success for new uploaded documents
       * IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(JournalComponentImpl.COMPONENT_ID).getService(
       * IJournalAdapter.class); JournalHelper.Actor a = new JournalHelper.Actor(this.user.getEmail(), this.user.getId(),
       * this.user.getCustomerId()); JournalHelper.Entity jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE,
       * docEntry.getTitle(), docEntry.getDocId(),user.getCustomerId()); journalAdapter.publish(new
       * JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a, JournalHelper.Action.CREATE, jnl_obj,
       * JournalHelper.Outcome.SUCCESS).build());
       */
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
