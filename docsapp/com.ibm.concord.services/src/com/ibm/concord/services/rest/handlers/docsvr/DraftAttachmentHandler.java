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

import java.io.BufferedInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;

public class DraftAttachmentHandler implements GetHandler, DeleteHandler
{
  private static final Logger LOG = Logger.getLogger(DraftAttachmentHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    response.setCharacterEncoding("UTF-8");
    
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting attachment.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting attachment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting attachment.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while getting attachment.", new Object[]{user.getId(), uri});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    String attName = pathMatcher.group(3);
    //attName = StringEscapeUtils.escapeHtml(attName);
    
    MediaDescriptor media = AttachmentsUtil.getDraftAttachment(user, docEntry, attName);
    if (media == null)
    {
      LOG.log(Level.WARNING, "Did not find the attachment {0} in document {1}.", new Object[]{attName, uri});
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;      
    }
    
    response.setContentType(media.getMimeType());
    response.setHeader("Content-disposition", "filename=" + media.getTitle());
    response.setStatus(HttpServletResponse.SC_OK);

    BufferedInputStream bis = new BufferedInputStream(media.getStream());
    ServletOutputStream out = response.getOutputStream();
    int numRead = -1;
    byte[] data = new byte[8192];
    while ((numRead = bis.read(data)) > 0)
    {
      out.write(data, 0, numRead);
    }
    bis.close();
    out.close();
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while deleting attachment.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in deleting attachment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in deleting attachment.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while deleting attachment.", new Object[]{user.getId(), uri});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    String attName = pathMatcher.group(3);
    attName = StringEscapeUtils.escapeHtml(attName);
    
    if (AttachmentsUtil.deleteDraftAttachment(user, docEntry, attName))
    {
      response.setStatus(HttpServletResponse.SC_OK);
    }
    else
    {
      LOG.log(Level.WARNING, "fobid to access, status code is " + HttpServletResponse.SC_NOT_FOUND);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
  }

}
