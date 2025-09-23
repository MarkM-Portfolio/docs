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
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

public class DocumentPartsHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentPartsHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String partId = pathMatcher.group(3);
    
    IDocumentEntry docEntry = getDocumentFromRequest(request, response);
    if (docEntry == null)
    {
      return;
    }
    
    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, docEntry.getRepository(), docEntry.getDocUri(), false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    DocumentSession docSess = SessionManager.getInstance().getSession(docEntry);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document has been closed while getting document parts: " + docEntry.getDocUri());
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    
    JSONObject criteria = new JSONObject();
    criteria.put(partId, new JSONObject());
    JSONObject whoState = docSess.getCurrentState(criteria);
    JSONArtifact partState = (JSONArtifact)whoState.get(partId);
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    partState.serialize(response.getWriter());

  }
  
  private IDocumentEntry getDocumentFromRequest(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
 
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting document parts.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return null;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting document parts.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting document parts.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return null;
    }
    
    
    return docEntry;
  }
  
}
