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

import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

/**
 * 
 */
public class GetPartialProcessor implements Runnable
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
  public GetPartialProcessor(AsyncContext asyncContext, IDocumentEntry docEntry, UserBean caller)
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
    SessionManager mgr = SessionManager.getInstance();
    String clientId = request.getSession().getId();

    DocumentSession docSess = mgr.getSession(docEntry);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document has been closed while getting partial content of document: {0}", docEntry.getDocUri());
      try
      {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
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
    Participant participant = null;
    participant = docSess.getParticipant(clientId);

    JSONObject retJson = new JSONObject();
    JSONObject state = new JSONObject();
    try
    {
      // Get the parameter "criteria" from the request for fetching partial content of document model.
      JSONObject criteria = new JSONObject();
      JSONObject contentCriteria = getCriteria(request);
      criteria.put(MessageConstants.CONTENT_STATE_KEY, contentCriteria);
      // add user id
      criteria.put(MessageConstants.USER_ID, caller.getId());

      state = docSess.getCurrentState(criteria);

      retJson.put(MessageConstants.STATE, state);
      retJson.put(MessageConstants.CLIENT_ID, clientId);
      retJson.put(MessageConstants.BEAN, DocumentEntryHelper.toJSON(docEntry));
      retJson.put(MessageConstants.CLIENT_SEQ, participant.getClientSeq());
      retJson.put(MessageConstants.SECURE_TOKEN, docSess.getSecureToken());
    }
    catch (ConcordException e)
    {
      // Draft is possible not in active status or draft storage error.
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The draft of document: %s is possible not in active status or draft storage error , ConcordException error : %s", new Object[] {
              docEntry.getDocUri(), e })).toString());
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
      LOG.log(Level.SEVERE, "can not access or open draft storage of " + docEntry.getDocUri(), e);
      return;
    }
    catch (Exception e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "The server of document: %s is not available , Exception error : %s", new Object[] { docEntry.getDocUri(), e })).toString());
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
      finally
      {
        asyncContext.complete();
      }
      LOG.log(Level.SEVERE, "can not get current state of " + docEntry.getDocUri(), e);
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
}
