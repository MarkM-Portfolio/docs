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

import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.concord.platform.util.EmailValidator;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.exception.DirectoryServiceException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONObject;

public class DocumentPermissionHandler implements GetHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentPermissionHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String email = request.getParameter("email");
    String userId = request.getParameter("id");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    if (userId != null || EmailValidator.isEmail(email))
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)((DirectoryComponent)Platform.getComponent(DirectoryComponent.COMPONENT_ID)).getService(IDirectoryAdapter.class, repoId);
      UserBean userFound = null;
      if (userId == null)
      {
        userFound = directoryAdapter.getByEmail(user, email);
      }
      else
      {
        userFound = directoryAdapter.getById(user, userId);
      }

      /*
       * FIXME, it is somewhat BAD to return a FAKE user bean from IDirectoryAdapter when the user was not found through getById and
       * getByEmail. This bad implementation makes codes below have to dig into the adapter implementation to know what happened indeed and
       * the user was found or not indeed.
       */
      if (userFound == null || userFound.getId().equals(email)) /*|| userFound.getEmail() == null)*/
      {
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error_code", DirectoryServiceException.EC_DIRECTORY_USER_NOT_FOUND);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        return;
     }

      RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
          RepositoryProviderRegistry.class);
      boolean impersonationAllowed = service.getRepository(repoId).impersonationAllowed();

      Set<Permission> permissions = null;
      if (impersonationAllowed)
      {
        try
        {
          IDocumentEntry docEntry = DocumentEntryUtil.getEntry(userFound, repoId, uri, true);

          permissions = docEntry.getPermission();
        }
        catch (RepositoryAccessException e)
        {
          LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
          if (e.getErrCode() == RepositoryAccessException.EC_REPO_NOPERMISSION)
          {
            permissions = Permission.EMPTY_SET;
          }
          else if (e.getErrCode() == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
          {
            LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while getting permission.", uri);
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
          }
          else
          {
            JSONObject json = new JSONObject();
            json.put("status", "error");
            json.put("error_code", e.getStatusCode());
            json.put("error_msg", e.getMessage());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            json.serialize(response.getWriter(), true);
            return;
          }
        }
      }
      else
      {
        LOGGER.log(Level.INFO, "Current repository adapter is not allowed to do impersonation call, set the permission set to NONE.");

        permissions = Permission.EMPTY_SET;
      }

      JSONObject json = new JSONObject();
      if (Permission.EDIT.hasPermission(permissions))
      {
        json.put("permission", "EDIT");
      }
      else if (Permission.VIEW.hasPermission(permissions))
      {
        json.put("permission", "VIEW");
      }
      else
      {
        json.put("permission", "NONE");
      }
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }
    else
    {
      LOGGER.log(Level.WARNING, "Invalid email address or invalid user id " + userId + " as request paramater:");
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
  }

}
