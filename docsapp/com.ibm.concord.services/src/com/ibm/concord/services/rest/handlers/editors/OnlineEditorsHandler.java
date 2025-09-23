/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.editors;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class OnlineEditorsHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(OnlineEditorsHandler.class.getName());
  private static final String ONLINE_EDITORS = "editors";

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    //UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    // get document session
    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(repoId, uri);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "Document {0} has been closed while getting online editors.", uri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    JSONArray editors = new JSONArray();

    Participant pList[] = docSess.getParticipants();
    for (Participant p : pList)
    {
      JSONObject editor = new JSONObject();
      editor.put("displayName", p.getUserBean().getDisplayName());
      editor.put("userId", p.getUserBean().getId());
      editors.add(editor);
      //current login user will also be shown here, won't filter out
    }

    // Assemble response into a JSON
    JSONObject json = new JSONObject();
    json.put(OnlineEditorsHandler.ONLINE_EDITORS, editors);

    // Response
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    json.serialize(response.getWriter());

  }

}