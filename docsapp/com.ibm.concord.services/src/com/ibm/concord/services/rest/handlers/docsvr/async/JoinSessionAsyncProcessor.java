/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr.async;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.AsyncContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.handlers.tasksvr.TaskService;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSessionException;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import javax.servlet.http.Cookie;

/**
 * 
 */
public class JoinSessionAsyncProcessor implements Runnable
{

  private static final Logger LOG = Logger.getLogger(GetPartialProcessor.class.getName());

  private static final String ATTR_ERROR_CODE = "error_code";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private AsyncContext asyncContext;

  private IDocumentEntry docEntry;

  private UserBean caller;
  
  /**
   * @param asyncContext
   * @param docEntry
   * @param caller
   */
  public JoinSessionAsyncProcessor(AsyncContext asyncContext, IDocumentEntry docEntry, UserBean caller)
  {
    super();
    this.asyncContext = asyncContext;
    this.docEntry = docEntry;
    this.caller = caller;
  }

  /*
   * Implement getPartial by async thread
   * 
   * @see java.lang.Runnable#run()
   */
  @Override
  public void run()
  {
    LOG.entering(this.getClass().getName(), "run");
    HttpServletRequest request = (HttpServletRequest) asyncContext.getRequest();
    HttpServletResponse response = (HttpServletResponse) asyncContext.getResponse();
    
    Cookie[] cookies = request.getCookies();
    URLConfig.setRequestCookies(cookies);    
    
    // check file content limit on mobile
    String ua = request.getHeader("User-Agent");
    DraftDescriptor draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
        ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller), docEntry.getRepository(), docEntry.getDocUri());
    if (ua != null && ua.toLowerCase().contains("mobile"))
    {
      IDocumentService ds = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      JSONObject resultJson = LimitsUtil.exceedContentLimit(ds, draftDesc);
      if (resultJson != null && resultJson.get("result").equals("true"))
      {
        LOG.log(Level.WARNING, "Document exceeds content limitation on Mobile");
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error_code", resultJson.get("error_code"));
        json.put("error_mode", "mobile_error");
        json.put("error_message", resultJson.get("error_message"));
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        try
        {
          json.serialize(response.getWriter(), true);
        }
        catch (IOException ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex }))
              .toString());
          request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          asyncContext.dispatch(ERROR_JSP);
        }
        catch (Exception ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex }))
              .toString());
          request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          asyncContext.dispatch(ERROR_JSP);
        }
        finally
        {
          asyncContext.complete();
        }
        return;
      }
    }

    String clientId = request.getSession().getId();
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSessionWhenJoin(docEntry);
    if (docSess == null)
    {
      // force client to do a reload if the jobId is inconsistent with current document entry or the draft base version.
      {
        try
        {
          /**
           * compatible with both of these two parameters : jobId & nonce
           */
          String jobIdStr = request.getParameter("jobId");
          if (request.getParameter("nonce") != null && !"".equals(request.getParameter("nonce")))
          {
            jobIdStr = request.getParameter("nonce");
          }
          if (!ImportDraftFromRepositoryContext.equals(jobIdStr, docEntry, draftDesc, caller))
          {
            LOG.log(Level.WARNING, "Detected import conflict error during join session.");
            // clear conflict lock.
            try
            {
              if ("true".equalsIgnoreCase(request.getParameter("lock")))
              {
                LOG.log(Level.INFO, "Need unlock document " + docEntry.getDocId() + " after user " + caller.getId()
                    + "decided to edit the uploaded new version in this session.");
                DocumentEntryUtil.unlock(caller, docEntry);
              }
            }
            catch (RepositoryAccessException e)
            {
              // no influence for editing even unlock failed.
              LOG.log(
                  Level.WARNING,
                  "Document " + docEntry.getDocId() + " accessed repository got exception during unlock, error status : "
                      + e.getStatusCode() + ", error message: " + e.getErrMsg() + ".");
            }
            LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(),
                "Detected import conflict error during join session.").toString());
            JSONObject json = new JSONObject();
            json.put("status", "error");
            json.put("error_code", DocumentServiceException.EC_DOCUMENT_IMPORT_CONFLICT_ERROR);
            json.put("error_msg", "Detected import conflict error during join session.");
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            json.serialize(response.getWriter(), true);
            asyncContext.complete();
            return;
          }
        }
        catch (DraftDataAccessException ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , DraftDataAccessException error : %s", new Object[] { docEntry.getDocUri(), ex }))
              .toString());
          JSONObject json = new JSONObject();
          json.put("status", "error");
          json.put("error_code", DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          json.put("error_msg", "Draft Data Access Exception during join session.");
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          try
          {
            json.serialize(response.getWriter(), true);
          }
          catch (IOException e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          catch (Exception e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          finally
          {
            asyncContext.complete();
          }
          return;
        }
        catch (IOException ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex }))
              .toString());
          JSONObject json = new JSONObject();
          json.put("status", "error");
          json.put("error_code", DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          json.put("error_msg", "Draft Data Access IOException during join session.");
          response.setContentType("text/x-json");
          response.setCharacterEncoding("UTF-8");
          try
          {
            json.serialize(response.getWriter(), true);
          }
          catch (IOException e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          catch (Exception e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          finally
          {
            asyncContext.complete();
          }
          return;
        }
        catch (Exception ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex }))
              .toString());
          JSONObject json = new JSONObject();
          json.put("status", "error");
          json.put("error_code", DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          json.put("error_msg", "Draft Data Access IOException during join session.");
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          try
          {
            json.serialize(response.getWriter(), true);
          }
          catch (IOException e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          catch (Exception e)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
            request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
            asyncContext.dispatch(ERROR_JSP);
          }
          finally
          {
            asyncContext.complete();
          }
          return;
        }
      }

      try
      {
        docSess = mgr.openSession(caller, docEntry, draftDesc);
      }
      catch (Exception e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "Can not open document: %s  session when joining session , Exception error : %s", new Object[] { docEntry.getDocUri(), e }))
            .toString());
        try
        {
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        catch (IOException ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
          request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          asyncContext.dispatch(ERROR_JSP);
        }
        catch (Exception ex)
        {
          LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
              "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
          request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
          asyncContext.dispatch(ERROR_JSP);
        }
        finally
        {
          asyncContext.complete();
        }
        return;
      }
      finally
      {
        // clear conflict lock.
        try
        {
          if ("true".equalsIgnoreCase(request.getParameter("lock")))
          {
            LOG.log(Level.INFO, "Need unlock document " + docEntry.getDocId() + " after user " + caller.getId()
                + " decided to edit the exist draft in this session.");
            DocumentEntryUtil.unlock(caller, docEntry);
          }
        }
        catch (RepositoryAccessException e)
        {
          // no influence for editing even unlock failed.
          LOG.log(Level.WARNING, "Document " + docEntry.getDocId() + " accessed repository got exception during unlock, error status : "
              + e.getStatusCode() + ", error message: " + e.getErrMsg() + ".");
        }
      }
    }

    Participant participant = null;
    try
    {
      if (docSess.getPublishing() && RepositoryServiceUtil.supportCheckin(docEntry.getRepository()))
      {
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The ECM/CCM Document: %s is publishing by another user. ", new Object[] { docEntry.getDocUri() })).toString());
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error_code", DocumentServiceException.EC_DOCUMENT_LOCKED_EDIT_ERROR);
        json.put("error_msg", "ECM/CCM Document is publishing and locked when join session.");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        asyncContext.complete();
        return;
      }

      boolean checkEntitlement = "true".equalsIgnoreCase(request.getParameter("checkEntitlement"));
      participant = docSess.join(caller, clientId, checkEntitlement);
    }
    catch (DocumentSessionException ex)
    {
      // If co-edit entitlement related exception happens when join the session, then should return the error to browser.
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , DocumentSessionException error : %s", new Object[] { docEntry.getDocUri(), ex }))
          .toString());
      JSONObject json = packageEntitlementError(docSess, ex);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      try
      {
        json.serialize(response.getWriter(), true);
      }
      catch (IOException e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
        request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
        asyncContext.dispatch(ERROR_JSP);
      }
      finally
      {
        asyncContext.complete();
      }
      return;
    }
    catch (DocumentServiceException ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , DocumentServiceException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", ex.getErrCode());
      json.put("error_msg", ex.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      try
      {
        json.serialize(response.getWriter(), true);
      }
      catch (IOException e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
        request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
        asyncContext.dispatch(ERROR_JSP);
      }
      catch (Exception e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
        request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
        asyncContext.dispatch(ERROR_JSP);
      }
      finally
      {
        asyncContext.complete();
      }
      return;
    }
    catch (IOException ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex }))
          .toString());
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_msg", ex.getMessage());
      response.setContentType("text/x-json");
      response.setCharacterEncoding("UTF-8");
      try
      {
        json.serialize(response.getWriter(), true);
      }
      catch (IOException e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
        request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
        asyncContext.dispatch(ERROR_JSP);
      }
      finally
      {
        asyncContext.complete();
      }
      return;
    }
    catch (Exception ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex }))
          .toString());
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_msg", ex.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      try
      {
        json.serialize(response.getWriter(), true);
      }
      catch (IOException e)
      {
        LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
        request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
        asyncContext.dispatch(ERROR_JSP);
      }
      finally
      {
        asyncContext.complete();
      }
      return;
    }
    JSONObject retJson = null;
    try
    {
      retJson = packageStateResponse(request, response, docSess, docEntry, participant);
    }
    catch (Exception ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
      request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
      asyncContext.dispatch(ERROR_JSP);
    }
    if (retJson == null)
    {
      asyncContext.complete();
      return;
    }
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    try
    {
      retJson.serialize(response.getWriter());
    }
    catch (IOException ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , IOException error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
      request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
      asyncContext.dispatch(ERROR_JSP);
    }
    catch (Exception ex)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), ex })).toString());
      request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
      asyncContext.dispatch(ERROR_JSP);
    }
    finally
    {
      asyncContext.complete();
    }
    LOG.exiting(this.getClass().getName(), "run");
  }

  /**
   * @param request
   * @param response
   * @param docSess
   * @param docEntry
   * @param participant
   * @return
   * @throws Exception
   */
  private JSONObject packageStateResponse(HttpServletRequest request, HttpServletResponse response, DocumentSession docSess,
      IDocumentEntry docEntry, Participant participant) throws Exception
  {
    LOG.entering(this.getClass().getName(), "packageStateResponse");
    // try to open draft, get latest document content
    JSONObject state = new JSONObject();
    try
    {
      // Get the parameter "criteria" from the request for fetching partial content of document model.
      JSONObject criteria = new JSONObject();
      JSONObject contentCriteria = getCriteria(request);
      criteria.put(MessageConstants.CONTENT_STATE_KEY, contentCriteria);
      // add user id
      criteria.put(MessageConstants.USER_ID, participant.getUserBean().getId());

      state = docSess.getCurrentState(criteria);
    }
    catch (ConcordException e)
    {
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", e.getErrCode());
      json.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      LOG.log(Level.SEVERE, " can not access or open draft storage of " + docSess.getDocUri(), e);
      return null;
    }

    // Get linked activity information
    TaskService taskService = new TaskService();
    String activityId = taskService.getActivityId(participant.getUserBean(), docSess.getRepository(), docSess.getDocUri());
    String activityName = null;
    if (activityId != null)
    {
      try
      {
        String role = taskService.getPersonRole(activityId, participant.getUserBean().getId());
        if ((role == null) || (!role.equalsIgnoreCase("owner")))
          taskService.addMember(participant.getUserBean(), activityId, participant.getUserBean().getId(), null);
        activityName = taskService.getActivityTitle(participant.getUserBean(), activityId);
      }
      catch (AccessException ex)
      {
        LOG.info("AccessException retrieved get activity role, this may be an invalid activityId " + activityId);
        activityId = null;
      }
    }

    JSONObject activityJson = null;
    if (activityId != null)
    {
      activityJson = new JSONObject();
      activityJson.put("activityId", activityId);
      activityJson.put("activityName", activityName);
    }

    JSONObject retJson = new JSONObject();

    retJson.put(MessageConstants.CLIENT_ID, participant.getClientId());
    retJson.put(MessageConstants.STATE, state);
    retJson.put(MessageConstants.BEAN, DocumentEntryHelper.toJSON(docEntry));
    retJson.put(MessageConstants.ACTIVITY, activityJson);
    retJson.put(MessageConstants.CLIENT_SEQ, participant.getClientSeq());
    retJson.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
    retJson.put(MessageConstants.STATE_SEQ_KEY, String.valueOf(state.get(MessageConstants.STATE_SEQ_KEY)));
    retJson.put(MessageConstants.SECURE_TOKEN, docSess.getSecureToken());

    LOG.exiting(this.getClass().getName(), "packageStateResponse");
    return retJson;
  }

  /**
   * Package the entitlement related error into a JSON object.
   * 
   * @param session
   *          specifies the document session that error happens on
   * @param ex
   *          presents the no entitlement exception
   * @return
   */
  private JSONObject packageEntitlementError(DocumentSession session, DocumentSessionException ex)
  {
    LOG.entering(this.getClass().getName(), "packageEntitlementError");
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", ex.getErrorCode());
    json.put("error_msg", ex.getMessage());
    if (ex.getData() instanceof Participant[])
    {
      json.put(MessageConstants.PARTICIPANTS, convertParticipantsToJSON((Participant[]) ex.getData()));
    }
    LOG.exiting(this.getClass().getName(), "packageEntitlementError");
    return json;
  }

  /**
   * Get the parameter "criteria" from the request for fetching partial content of document model.
   * 
   * @param request
   * @return
   */
  private JSONObject getCriteria(HttpServletRequest request)
  {
    LOG.entering(this.getClass().getName(), "getCriteria");
    JSONObject criteria = null;
    try
    {
      String criteriaStr = request.getParameter("criteria");
      if (criteriaStr != null)
      {
        criteria = JSONObject.parse(criteriaStr);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Can not parse the parameter 'criteria' in the request to a json object", e);
    }
    LOG.exiting(this.getClass().getName(), "getCriteria");
    return criteria;
  }

  /**
   * Convert the participants to a JSON array.
   * 
   * @param participants
   * @return
   */
  private JSONArray convertParticipantsToJSON(Participant participants[])
  {
    LOG.entering(this.getClass().getName(), "convertParticipantsToJSON");
    int length = participants != null ? participants.length : 0;
    JSONArray array = new JSONArray(length);
    for (int index = 0; index < length; index++)
    {
      Participant participant = participants[index];
      UserBean bean = participant.getUserBean();
      array.add(bean.toJSON());
    }
    LOG.exiting(this.getClass().getName(), "convertParticipantsToJSON");
    return array;
  }
}
