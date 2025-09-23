/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.servlets;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.services.servlet.ConcordDocServlet;
import com.ibm.docs.authentication.util.ExternalParasHelper;
import com.ibm.docs.repository.RepositoryConstants;

/**
 * Servlet implementation class DriverEndpointCallback
 */
public class DriverEndpointCallback extends HttpServlet
{
  private static final long serialVersionUID = 1L;

  private static final Logger LOG = Logger.getLogger(DriverEndpointCallback.class.getName());
  
  public static final String REPOSITORY = "repository";  

  public static final String REPOSITORY_CMIS = "cmis";
  public static final String REPOSITORY_REST = "rest";
  
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
    
    boolean bServing = ConcordDocServlet.checkServingSrv(request, response, repo, fileId);
    if (!bServing)
  	  return;
    
    String repoType = DocumentEntryUtil.getRepoTypeFromId(repo);
    if (RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS.equalsIgnoreCase(repoType))
    {
      handleCMIS(request, response, fileId, repo);
    }
    else if (RepositoryConstants.REPO_TYPE_EXTERNAL_REST.equals(repoType))
    {
      handleRepo(request, response, fileId, repo);
    } else
    {
      LOG.log(Level.WARNING, "Can not get right repoType " + repoType + " from repo id " + repo + " for file " + fileId
          + "\nThe repoType is suppose to be external.rest or external.cmis, redirect to external.rest anyway");
      handleRepo(request, response, fileId, repo);
    }

  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    // TODO Auto-generated method stub
  }

  private void handleCMIS(HttpServletRequest request, HttpServletResponse response, String fileId, String repo) throws ServletException, IOException
  {
    String context = request.getContextPath();

    if (fileId == null)
    {
      LOG.severe("Did not get document ID from callback URL from repository!!!");
    }
    String objectStore = request.getParameter(OBJECT_STORE);

    String cmisUri = objectStore == null ? fileId : fileId + "@" + objectStore;
    String redirectUrl = context + "/app/doc/" + repo + "/" + cmisUri + "/edit/content";    

    response.sendRedirect(redirectUrl);
  }
  
  private void handleRepo(HttpServletRequest request, HttpServletResponse response, String fileId, String repo) throws ServletException, IOException
  {
    String context = request.getContextPath();
    String redirectUrl = context + "/app/doc/" + repo + "/" + fileId + "/edit/content";

    response.sendRedirect(redirectUrl);
  }  
}
