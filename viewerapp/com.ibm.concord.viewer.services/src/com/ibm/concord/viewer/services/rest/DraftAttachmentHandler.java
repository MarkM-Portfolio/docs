/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import java.io.BufferedInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.concord.viewer.document.services.AttachmentsUtil;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.services.rest.DeleteHandler;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;

public class DraftAttachmentHandler implements GetHandler
{
  private static final Logger LOG = Logger.getLogger(DraftAttachmentHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    response.setCharacterEncoding("UTF-8");
    
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    String modified =request.getParameter("version");
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = RepositoryServiceUtil.getEntry(user, repoId, uri, modified, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting attachment.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.WARNING, "Access exception happens while getting the entry of document {0} in getting attachment.", uri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while getting the entry of document {0} in getting attachment.", uri);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    String attName = pathMatcher.group(3);
    MediaDescriptor media = AttachmentsUtil.getHtmlDraftAttachment(user, docEntry, attName);
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

}
