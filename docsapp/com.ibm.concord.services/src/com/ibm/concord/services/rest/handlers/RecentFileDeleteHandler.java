/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocRecentsDAO;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;

public class RecentFileDeleteHandler implements PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(RecentFilesHandler.class.getName());

  private static final String DOC_ID = "docId";

  private static final String REPO_ID = "repoId";

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    String method = request.getParameter("method");
    if (method != null)
    {
      if (method.equalsIgnoreCase("delete"))
      {
        String docId = request.getParameter(DOC_ID);
        String repoId = request.getParameter(REPO_ID);
        deleteRecentFile(request, response, docId, repoId);
        response.setStatus(HttpServletResponse.SC_OK);
      }
      else
      {
        LOG.log(Level.WARNING, "Gave an incorrect method when delete a recent files record");
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Method is null when delete a recent files record");
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
  }

  private void deleteRecentFile(HttpServletRequest request, HttpServletResponse response, String docId, String repoId)
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user != null)
    {
      String userId = user.getId();
      IDocRecentsDAO daoRecentFiles = (IDocRecentsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
          IDocRecentsDAO.class);
      daoRecentFiles.delete(userId, repoId, docId);
    }
  }
}
