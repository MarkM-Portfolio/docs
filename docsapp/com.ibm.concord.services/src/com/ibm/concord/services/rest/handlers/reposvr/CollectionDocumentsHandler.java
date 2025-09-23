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
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;

public class CollectionDocumentsHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(CollectionDocumentsHandler.class.getName());

  private static final int DefaultPageSize = 100;
  private static final int DefaultPageNumber = 1;

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String pageNumber = request.getParameter("pageNumber");
    pageNumber = pageNumber == null ? String.valueOf(DefaultPageNumber) : pageNumber;
    String pageSize = request.getParameter("pageSize");
    pageSize = pageSize == null ? String.valueOf(DefaultPageSize) : pageSize;
    String repoId = pathMatcher.group(1);
    String groupName = pathMatcher.group(2);

    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryProviderRegistry.class);
    IRepositoryAdapter repoAdapter = service.getRepository(repoId);

    if ("shared".equals(groupName))
    {
      int pageS = DefaultPageSize;
      int pageN = DefaultPageNumber;
      try
      {
        pageS = Integer.valueOf(pageSize);
        pageN = Integer.valueOf(pageNumber);

        if (pageS < 50 || pageS > 500 || pageN <= 0)
        {
          LOGGER.log(Level.WARNING, "Illegal pagination arguments. {0} {1}", new Object[] { pageS, pageN });
          response.sendError(HttpServletResponse.SC_BAD_REQUEST);
          return;
        }
      }
      catch (NumberFormatException e)
      {
        LOGGER.log(Level.WARNING, "Illegal pagination arguments. {0} {1} {2}", new Object[] { pageS, pageN, e });
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }

      try
      {
        JSONArray documents = new JSONArray();

        IDocumentEntry[] sharedDocs = repoAdapter.getPermissiveDocuments(user, pageS, pageN);
        for (int i = 0; i < sharedDocs.length && sharedDocs[i] != null; i++)
        {
          documents.add(DocumentEntryHelper.toJSON(sharedDocs[i]));
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (sharedDocs[sharedDocs.length - 1] == null)
        {
        	response.setStatus(HttpServletResponse.SC_OK);
        }
        else
        {
        	response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        }
        documents.serialize(response.getOutputStream());
        return;
      }
      catch (RepositoryAccessException e)
      {
        LOGGER.log(Level.SEVERE, "Retrieve permissive documetns failed.", e);
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }
    else
    {
      response.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED);
      return;
    }
  }
}
