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


import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentURLBuilder;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class DocumentEditOrViewHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentEditOrViewHandler.class.getName());

  private String getRedirectUriForLCFiles(UserBean user, String repoId, String uri) throws Exception
  {
    IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    if (docEntry == null)
    {
      // Did not find the document entry, the document may have been removed.
      LOG.log(Level.WARNING, "Can not get the document entry of {0} in repository {1}.", new Object[]{uri, repoId});
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC);      
    }
    
    if (Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.INFO, "{0} have edit permission on document {1}.",  new Object[]{user.getId(), uri});
      return DocumentURLBuilder.getEditDocumentURI(docEntry);      
    }
    else if (Permission.VIEW.hasPermission(docEntry.getPermission())) 
    {
      LOG.log(Level.INFO, "{0} have view permission on document {1}.",  new Object[]{user.getId(), uri});
      return DocumentURLBuilder.getLCViewDocumentURI(docEntry);
    } 
    else
    {
      LOG.log(Level.INFO, "{0} have no edit or view permission on document {1}.",  new Object[]{user.getId(), uri});
      return DocumentURLBuilder.getLCFileDetailURI(docEntry);
    } 
  }  
  
  /**
   * Package the exception happens when getting the document entry into a JSON object.
   * 
   * @param exception specifies the exception happens when getting the document entry
   * @return the packaged JSON object
   */
  private JSONObject packageGetDocEntryError(Exception exception)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    if (exception instanceof RepositoryAccessException)
    {
      int nErrorCode = ((RepositoryAccessException) exception).getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      json.put("error_code", nErrorCode);
      json.put("error_msg", exception.getMessage());
    }
    return json;
  }
 
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);


    String redirectURI = null;
    try
    {
      redirectURI = getRedirectUriForLCFiles(user, repoId, uri);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, e.getMessage(), e);
      JSONObject json = packageGetDocEntryError(e);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }
    
    if (null == redirectURI)
    {
      return;
    }
    else
    {
      response.sendRedirect(response.encodeRedirectURL(redirectURI));
      return;
    }
  }
}
