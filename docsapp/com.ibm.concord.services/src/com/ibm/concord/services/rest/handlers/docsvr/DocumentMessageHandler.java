/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSessionException;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionConfig;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
//import com.ibm.concord.collaboration.notification.NotificationProxy;
//import com.ibm.concord.document.services.DocumentServiceUtil;
//import com.ibm.concord.platform.repository.RepositoryServiceUtil;
//import com.ibm.concord.spi.auth.IAuthenticationAdapter;
//import com.ibm.concord.spi.beans.DocumentBean;
//import com.ibm.concord.spi.beans.IDocumentEntry;
//import com.ibm.concord.spi.beans.UserBean;
//import com.ibm.concord.spi.exception.RepositoryAccessException;

public class DocumentMessageHandler implements PostHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentMessageHandler.class.getName());
  
  /**
   * If the participant is kicked out, then return the error data to client, so that can show error message in browser.
   * 
   * @param response specifies the HTTP Servlet response instance
   * @param session The document session that the client working on
   * @param clientId The id of client that sending the message
   * @return true if the participant has been kicked out and return the error data to client, false otherwise
   * @throws Exception
   */
  private boolean processKickOutError(HttpServletResponse response, DocumentSession session, String clientId) throws Exception
  {
    Participant kickedPt = session.getKickedParticipant(clientId);
    if (kickedPt != null)
    {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", DocumentSessionException.ERR_PT_KICKOUT_DUP);
      json.put("error_msg", "You has been kicked out from the document session in this client.");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getOutputStream());
      LOG.log(Level.WARNING, "The participant has been kicked out while posting messaging: " + clientId);
      return true;
    }
    return false;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    String clientId = request.getSession().getId();
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String method = request.getParameter("method");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    
    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    // for session module separation, the code changes here
    // to check session manager existence, if not exist, message send to draft directly
    
    SessionManager mgr = SessionManager.getInstance();
    
    DocumentSession docSess = mgr.getSession(repoId, uri);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document has been closed while posting messaging: " + uri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    
    // If the participant is kicked out, then return the error data to client, so that can show error message in browser.
    if (processKickOutError(response, docSess, clientId))
    {
      return;
    }
    Participant p = docSess.getParticipant(clientId);
    if (p == null)
    {
      LOG.log(Level.WARNING, "The participant does not exist while posting messaging: " + clientId);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    if (method == null)
    {
      doMessage(docSess, p, request, response);
    }
    //else if (method.equalsIgnoreCase("notification"))
    //{
    //  doNotifyMessage(docSess, p, request, response);
    //}
  }
 
  private void doMessage(DocumentSession docSess, Participant p, HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject jBody = null;
    JSONArray msgList = null;
    try
    {
      jBody = JSONObject.parse(request.getReader());
      msgList  = (JSONArray) jBody.get(MessageConstants.MSG_LIST);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error parsing request body: ", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    if (msgList == null)
    {
      LOG.log(Level.WARNING, "No message list in the request body; clientId:" + p.getClientId() + ";userId:" + p.getUserBean().getId());
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (SessionConfig.getReloadLog())
      LOG.log(Level.INFO, "{\"reloadLog\": \"Recved message of " + user.getId() + "\"}, " + msgList.toString() + ",");
    docSess.receiveMessage(msgList, p);
    
    // echo count
    JSONObject ret = new JSONObject();
    ret.put("count", msgList.size());
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    ret.serialize(response.getWriter());    
  }

//  private void doNotifyMessage(DocumentSession docSess, Participant p, HttpServletRequest request, HttpServletResponse response) throws Exception
//  {
//	UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
//    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
//    String repoId = pathMatcher.group(1);
//    String uri = pathMatcher.group(2);
//    
//    // get document bean
//    DocumentBean docBean = null;
//    try
//    {
//      IDocumentEntry docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri);
//      if (docEntry == null)
//      {
//        response.sendError(HttpServletResponse.SC_NOT_FOUND);
//        return;
//      }
//      
//      docBean = DocumentServiceUtil.getDocument(user, docEntry);
//      if (docBean == null)
//      {
//        response.sendError(HttpServletResponse.SC_NOT_FOUND);
//        return;
//      }
//    }
//    catch (RepositoryAccessException e)
//    {
//      response.sendError(HttpServletResponse.SC_FORBIDDEN);
//      return;
//    }
//    catch (Exception e)
//    {
//      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
//      return;
//    }
//    
//    JSONObject jBody = null;
//    try {
//      jBody = JSONObject.parse(request.getReader());
//    }
//    catch (Exception e)
//    {
//      LOG.log(Level.WARNING, "Error parsing request body: ", e);
//      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
//      return;
//    }
//    jBody.put("id", p.getUserBean().getId());
//    
//    NotificationProxy np = new NotificationProxy(docBean, user);
//    np.receiveNotificationMessage(docSess.getDraftDescriptor(), jBody);
//    docSess.publishNotificationMessage(jBody);
//    
//    // echo count
//    JSONObject ret = new JSONObject();
//    ret.put("count", 1);
//    response.setContentType("application/json");
//    response.setCharacterEncoding("UTF-8");
//    response.setStatus(HttpServletResponse.SC_OK);
//
//    ret.serialize(response.getWriter());    
//  }
}
