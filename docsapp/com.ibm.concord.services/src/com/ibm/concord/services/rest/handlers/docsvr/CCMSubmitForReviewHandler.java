/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class CCMSubmitForReviewHandler implements PostHandler
{
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {    
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);    
    
    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, uri);
    if(docSess!= null)
    {
      JSONObject message = new JSONObject();
      message.put("type", "ccmSubmitForReview");
      message.put("user", user.getId());      
      docSess.publishServerMessage(message);
    }
    
    response.setStatus(HttpServletResponse.SC_OK);
  }

}
