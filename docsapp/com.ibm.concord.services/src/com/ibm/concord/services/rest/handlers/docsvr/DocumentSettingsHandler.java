/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentPageSettingsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class DocumentSettingsHandler implements GetHandler, PostHandler, PutHandler
{

  private static final Logger LOG = Logger.getLogger(DocumentSettingsHandler.class.getName());

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    // TODO Auto-generated method stub

  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    // TODO Auto-generated method stub

  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    response.setCharacterEncoding("UTF-8");

    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String settingsName = pathMatcher.group(3);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting document settings.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting document settings.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting document settings.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (settingsName == null || settingsName.isEmpty())
    {
      LOG.log(Level.WARNING, "Did not provide settings name when getting the settings of document {0} in getting document settings.", uri);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    JSONObject aJson = new JSONObject();
    if (settingsName.equalsIgnoreCase(DocumentPageSettingsUtil.DOC_SETTINGS_PAGE))
    {
      try
      {
        aJson = DocumentPageSettingsUtil.getPageSettingsAsJson(user, docEntry);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Exception happens when getting the settings " + DocumentPageSettingsUtil.DOC_SETTINGS_PAGE + " of document "
            + uri + " in getting document settings.", e);
      }
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    aJson.serialize(response.getWriter());
    return;
  }

}
