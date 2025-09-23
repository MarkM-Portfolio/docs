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

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.common.FragmentManager;
import com.ibm.concord.document.common.util.XHTMLDomUtil;
import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.platform.util.JTidyUtil;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class FragmentCreateHandler implements PostHandler, DeleteHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentCreateHandler.class.getName());

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String type = request.getParameter("type");
    String repo = request.getParameter("repository");
    String folderUri = request.getParameter("community");
    String srcRepoId = pathMatcher.group(1);
    String srcUri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, srcRepoId, srcUri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    if (repo != null && !RepositoryServiceUtil.supportedRepository(repo))
    {
      LOG.log(Level.WARNING, "Do not support this repository type: {0}", repo);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    if (type == null || !DocumentServiceUtil.supportedDocumentService(type))
    {
      LOG.log(Level.WARNING, "Do not support this document type: {0}", type);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    String sectionId = request.getParameter("section");

    JSONObject jBody = null;

    JSONObject section = null;

    IDocumentEntry masterDoc = null;
    try
    {
      masterDoc = DocumentEntryUtil.getEntry(user, srcRepoId, srcUri, true);
      if (masterDoc == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while creating fragment.", srcUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + srcUri + " in creating fragment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + srcUri + " in creating fragment.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    String newTitle = request.getParameter("newTitle");
    if (newTitle == null)
      newTitle = masterDoc.getTitle();

    SessionManager mgr = SessionManager.getInstance();

    DocumentSession docSess = mgr.getSession(masterDoc);
    if (docSess == null)
    {
      try
      {
        docSess = mgr.openSession(user, masterDoc);
      }
      catch (UnsupportedMimeTypeException e)
      {
        LOG.log(Level.WARNING, "Unsupported mime type error.");
        response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        return;
      }
      catch (AccessException e)
      {
        LOG.log(Level.WARNING, "Access exception happens while open document session {0}.", masterDoc.getDocUri());
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return;
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Exception happens while open document session " + masterDoc.getDocUri(), e);
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }

    try
    {
      section = docSess.getSection(sectionId);
    }
    catch (ConcordException e1)
    {
      LOG.log(Level.SEVERE, "error creating fragment : " + sectionId, e1);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
    jBody = new JSONObject();

    // the max length of file title in Files in 252, 
    // the new title will be extended with the extenstion, like .odt/.odf/.ods
    // so the max length of the title is 248
    if (newTitle.length() > 248) 
      newTitle = newTitle.substring(0, 247);
    if (type.equalsIgnoreCase("text"))
    {
      jBody.put("newTitle", newTitle);
      jBody.put("content", section.get("html"));
    }
    else if (type.equalsIgnoreCase("sheet"))
    {
      jBody.put("newTitle", newTitle);
      jBody.put("content", section);
    }

    try
    {
      IDocumentEntry childDoc = this.checkFragmentState(user, section, type);
      if (childDoc == null)
      {
        if (type.equalsIgnoreCase("text"))
        {
          JSONArray list = AttachmentsUtil.getDraftAttachmentList(user, masterDoc);
          jBody.put("attachments", list);
        }

        childDoc = DocumentServiceUtil.createDocument(user, type, repo, folderUri, jBody);
        if (childDoc == null)
        {
          LOG.log(Level.WARNING, "Failed to create the child document, document type: {0}, document repository: {1}.", new Object[]{type, repo});
          response.sendError(HttpServletResponse.SC_BAD_REQUEST);
          return;
        }
        // client will send message to set fragment status to working

        // update fragment manager
        FragmentManager fm = FragmentManager.getInstance();
        fm.addDocReference(user, masterDoc.getRepository(), masterDoc.getDocUri(), childDoc.getRepository(), childDoc.getDocUri(), sectionId);
      }

      //set document id to response
      JSONObject jo = DocumentEntryHelper.toJSON(childDoc);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter());     
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Repository access error happens while creating fragment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "error creating fragment type: " + type, e);
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }
  }

  private IDocumentEntry checkFragmentState(UserBean caller, JSONObject section, String type) throws Exception, RepositoryAccessException
  {
    String fragId = null;
    if (type.equalsIgnoreCase("text"))
    {
      String content = (String) section.get("html");
      fragId = XHTMLDomUtil.getAttribute(XHTMLDomUtil.parseString(JTidyUtil.getTidy(), content, false), "frag_id");
    }
    else if (type.equalsIgnoreCase("sheet"))
    {
      JSONObject content = (JSONObject)section.get("content");
      fragId = (String)content.get("fragid");
    }
    
    if ((fragId == null) || (fragId.length()==0))
      return null;

    String[] a = fragId.split("/", 2);
    IDocumentEntry docEntry = DocumentEntryUtil.getEntry(caller, a[0], a[1], true);
    return docEntry;
  }
  
  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String fragRepoId = request.getParameter("frag_repo");
    String fragUri = request.getParameter("frag_uri");
    String masterRepoId = pathMatcher.group(1);
    String masterUri = pathMatcher.group(2);
    
    // update fragment manager
    FragmentManager fm = FragmentManager.getInstance();
    
    fm.removeDocReference(user, masterRepoId, masterUri, fragRepoId, fragUri);
  }
}
