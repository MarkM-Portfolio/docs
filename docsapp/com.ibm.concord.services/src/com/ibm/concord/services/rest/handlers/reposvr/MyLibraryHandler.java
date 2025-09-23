/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.reposvr;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.PostHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class MyLibraryHandler implements PostHandler
{
  private static final Pattern pathPattern = Pattern.compile("/reposvr/([^/]+)/(.+)");
  
  private static final String ASYNC = "async";

  private static final long serialVersionUID = -4360992698170848300L;

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    // Use HttpServletRequest.getPathInfo to get a decoded path.
    Matcher matcher = pathPattern.matcher(request.getPathInfo());
    Matcher result = matcher.matches() ? matcher : null;
    String action = "";
    if(result != null)
    {
       action = result.group(1);
    }
    if(action.equals(""))
    {
      JSONObject retValue = new JSONObject();
      retValue.put("status", "error");
      retValue.put("statusCode", HttpServletResponse.SC_SERVICE_UNAVAILABLE);
      retValue.put("error_msg", "unsupported action type, plese use edit or view");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retValue.serialize(response.getOutputStream());
      return;
    }
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    boolean async = false;
    if (request.getParameter(ASYNC) != null)
      async = request.getParameter(ASYNC).compareToIgnoreCase("true") == 0;
    else
      async = false;
    Map<String, Object> options = extractViewOptions(request);
    UploadAction upload = new UploadAction(user, action, async, options);
    upload.exec(request,response);
  }
  
  private Map<String, Object> extractViewOptions(HttpServletRequest request)
  {
    Map<String, Object> options = new HashMap<String, Object>();
    Map<?, ?> rawOptions = request.getParameterMap();
    rawOptions.remove("dojo.preventCache");
    Iterator<?> iter = rawOptions.keySet().iterator();
    while (iter.hasNext())
    {
      String key = (String) iter.next();
      options.put(key, rawOptions.get(key));
    }
    return options;
  }
}
