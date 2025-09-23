/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.servlets;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.docs.viewer.external.util.ExternalParasHelper;

/**
 * Servlet implementation class DriverEndpointCallback
 */
public class DriverEndpointCallback extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final Logger LOG = Logger.getLogger(DriverEndpointCallback.class.getName());
  
  public static final String REPOSITORY = "repository";  

  private final String OBJECT_STORE = "objectStore";


  /**
   * @see HttpServlet#HttpServlet()
   */
  public DriverEndpointCallback()
  {
    super();
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String files[] = ExternalParasHelper.getRepoAndFile(request);   
    String repo = files[0];
    String fileId = files[1];
    String repoType = null;
    if(repo != null)
      repoType = RepositoryServiceUtil.getRepoTypeFromId(repo);
    
    if (RepositoryServiceUtil.EXTERNAL_CMIS_REPO_TYPE.equalsIgnoreCase(repoType))
    {
      handleCMIS(request, response, fileId, repo);
    }
    else if (RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE.equalsIgnoreCase(repoType))
    {
      handleREST(request, response, fileId, repo);
    }
    else
    {
      LOG.log(Level.WARNING, "Can not get right repoType " + repoType + " from repo id " + repo + " for file " + fileId
          + "\nThe repoType is suppose to be external.rest or external.cmis, redirect to external.rest anyway");
      handleREST(request, response, fileId, repo);
    }

  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    // TODO Auto-generated method stub
  }

  private void handleCMIS(HttpServletRequest request, HttpServletResponse response, String fileId, String repoId) throws ServletException, IOException
  {
    String context = request.getContextPath();

    if (fileId == null)
    {
      LOG.severe("Did not get document ID from callback URL from repository!!!");
    }
    String objectStore = request.getParameter(OBJECT_STORE);

    String cmisUri = objectStore == null ? fileId : fileId + "@" + objectStore;
    String redirectUrl = context + "/app/" + repoId + "/" + cmisUri + "/content?mode=compact"; 
    response.sendRedirect(redirectUrl);
  }

  private void handleREST(HttpServletRequest request, HttpServletResponse response, String fileId, String repoId) throws ServletException, IOException
  {
    String context = request.getContextPath();
    String redirectUrl = context + "/app/" + repoId + "/" + fileId + "/content?mode=compact";
    response.sendRedirect(redirectUrl);
  }
}
