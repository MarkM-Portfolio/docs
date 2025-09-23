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

import java.io.BufferedReader;
import java.util.Calendar;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSessionException;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.Message;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentHeartBeatHandler implements PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentHeartBeatHandler.class.getName());
  
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
      session.removeKickedParitcipant(clientId);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", DocumentSessionException.ERR_PT_KICKOUT_DUP);
      json.put("error_msg", "You has been kicked out from the document session in this client.");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getOutputStream());
      LOG.log(Level.WARNING, "The participant has been kicked out while doing heart beat: " + clientId);
      return true;
    }
    return false;
  }
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String clientId = request.getSession().getId();
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String leaving = request.getParameter("leave");
    String saving = request.getParameter("save");

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    SessionManager mgr = SessionManager.getInstance();
    
    DocumentSession docSess = mgr.getSession(repoId, uri);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document has been closed while doing heart beat: " + uri);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    
    Participant p = docSess.getParticipant(clientId);
    if (p == null)
    {
      // Find the participant from kicked out clients map. If it exists in kicked out clients map, should continue to process its messages in this heart 
      // beat request, because these messages are generated before it's kicked out, these are valid messages and should not be lost after it's kicked out.
      p = docSess.getKickedParticipant(clientId);
    }
    if (p == null)
    {
      LOG.log(Level.WARNING, "The participant does not exist while doing heart beat: " + clientId);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    JSONObject jBody = null;
    
    StringBuilder sb = new StringBuilder();
    BufferedReader r = request.getReader();
    String line = r.readLine();
    while (line != null)
    {
      sb.append(line);
      line = r.readLine();
    }
    String sBody = sb.toString();
    
    try
    {
      jBody = JSONObject.parse(sBody);
    }
    catch (Exception e)
    {
      if (!processKickOutError(response, docSess, clientId))
      {
        LOG.log(Level.WARNING, "Error parsing request body from client " + clientId + " of document " + uri, e);
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        if (leaving != null && leaving.equalsIgnoreCase("true"))
        {
          // Client request to leave the session.
          docSess.leave(clientId,null);
        }
      }
      return;
    }
    
    JSONArray msgList = (JSONArray)jBody.get(MessageConstants.MSG_LIST);
    String seq = jBody.get(MessageConstants.STATE_SEQ_KEY).toString();
    
    // update status of the client
    long currentClientSeq = Long.parseLong(seq);
    long currentServerSeq = docSess.getServerSeq();
    p.updateReportTime(Calendar.getInstance().getTime());
    p.updateCurrentSeq(currentClientSeq);
    
    // any messages?
    if (msgList != null)
    {
      docSess.receiveMessage(msgList, p);
    }
    
    // Check whether should do auto saving or not, if yes, then trigger auto saving request.
    docSess.checkAutoSave();
    
    // If the participant is kicked out, then return the error data to client, so that can show error message in browser.
    if (processKickOutError(response, docSess, clientId))
    {
      return;
    }
    
    // echo current document session's status
    long serverSeq = docSess.getServerSeq();
    JSONObject retJson = new JSONObject();
    retJson.put(MessageConstants.CHANGE_TIME, docSess.getLastChangedDate().toString());
    retJson.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
    retJson.put(MessageConstants.STATE_SEQ_KEY, serverSeq);
    if (docSess.isCoEditing())
    {
      retJson.put(MessageConstants.MODE, MessageConstants.COEDIT_MODE);
    }
    else
    {
      retJson.put(MessageConstants.MODE, MessageConstants.SINGLE_MODE);
      // return server generated message
      // those messages will be returned to each client by sync state operation
      // because those messages are also in transformed (applied) message list
      List<Message> hbMsgList = docSess.readHBPendingList();
      // Check if the client missing any messages or not, if yes, then send the missed messages to clients.
      if (currentClientSeq < currentServerSeq)
      {
        List<Message> missedMsgList = docSess.getState(currentClientSeq + 1, serverSeq);
        if (missedMsgList != null && missedMsgList.size() > 0)
        {
          if (hbMsgList.size() == 0)
          {
            hbMsgList = missedMsgList;
          }
          else
          {
            hbMsgList.addAll(missedMsgList);
          }
        }
      }
      retJson.put(MessageConstants.MSG_LIST, Message.toJSONArray(hbMsgList));
    }
    retJson.put(MessageConstants.PARTICIPANTS, docSess.participantsToJSON());
    
    int cannotJoinErrorCode = docSess.getCannotJoinErrorCode();
    if (cannotJoinErrorCode != 0)
    {
      retJson.put(MessageConstants.CANNOTJOINUSERS_KEY, convertCannotJoinUsersToJSON(cannotJoinErrorCode, docSess.getCannotJoinUsers(clientId)));
    }

    if (saving != null && saving.equalsIgnoreCase("true"))
    {
      if(docSess.saveMessages())
      {
          JSONObject draftMeta = new JSONObject();
          // update editor id
          draftMeta.put(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey(), user.getId());
          DraftDescriptor draftDescriptor = docSess.getDraftDescriptor();
          DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDescriptor, draftMeta);
          response.setStatus(HttpServletResponse.SC_OK);
      }
      else
      {
          response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
      }

      LOG.info(new ActionLogEntry(user, Action.SAVEDOC, uri, null).toString());
    }

    if (leaving != null && leaving.equalsIgnoreCase("true"))
    {
      JSONObject leavedata = (JSONObject)jBody.get("leavedata");
      // Client request to leave the session.
      docSess.leave(clientId,leavedata);
    }
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    retJson.serialize(response.getWriter());
  }

  
  
  /**
   * Put the users who cannot join the editing session into the response of heart beat request, so that the users who are 
   * editing the file know which users want to join the session but cannot join because of no entitlement for co-editing.
   * 
   * @param errorCode specifies the error code that why the users cannot join the session
   * @param users presents which users cannot join the session
   * @return
   */
  private JSONObject convertCannotJoinUsersToJSON(int errorCode, String[] users)
  {
    JSONObject object = new JSONObject();
    
    int length = users != null ? users.length : 0;
    JSONArray array = new JSONArray(length);
    for (int index = 0; index < length; index++)
    {
      array.add(users[index]);
    }
    
    object.put("errorCode", errorCode);
    object.put("users", array);
    
    return object;
  }

  //private void addTaskJournal(UserBean caller, JournalHelper.Component comp, JournalHelper.Action action, JournalHelper.Outcome outcome){
  //}

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }
}
