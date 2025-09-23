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

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;

public class RepositoryDocumentsHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(RepositoryDocumentsHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String docId = pathMatcher.group(2);

    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryProviderRegistry.class);
    IRepositoryAdapter repoAdapter = service.getRepository(repoId);

    try
    {
      JSONObject document = DocumentEntryHelper.toJSON(repoAdapter.getDocument(user, docId));

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      document.serialize(response.getOutputStream());

      return;
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
      JSONObject json = new JSONObject();
      json.put("status", "error");
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      json.put("error_code", nErrorCode);
      json.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getOutputStream());
      return;
    }
  }
}
