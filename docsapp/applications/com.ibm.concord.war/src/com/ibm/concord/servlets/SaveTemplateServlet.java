/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.servlets;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.security.ACFUtil;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.trl.acf.api.ActiveContentProcessorException;


public class SaveTemplateServlet extends HttpServlet
{
  private static final long serialVersionUID = -5211142652754303828L;

  public static final Logger LOGGER = Logger.getLogger(SaveTemplateServlet.class.getName());

  public SaveTemplateServlet()
  {
    super();
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    String docUri = request.getParameter("docUri");
    String repoId = request.getParameter("repoId");
    String ownerId = request.getParameter("ownerId");

    try
    {
      SessionManager sessMgr = SessionManager.getInstance();
      DocumentSession docSess = sessMgr.getSession(repoId, docUri);
      DraftStorageManager draftMgr = DraftStorageManager.getDraftStorageManager();
      DraftDescriptor dd = null;
      if (docSess == null)
      {
        IDirectoryAdapter directoryAdapter = (IDirectoryAdapter)((DirectoryComponent)Platform.getComponent(DirectoryComponent.COMPONENT_ID)).getService(IDirectoryAdapter.class, repoId);
        String ownerOrgId = directoryAdapter.getById(null, ownerId).getOrgId();
        dd = draftMgr.getDraftDescriptor(ownerOrgId, repoId, docUri);
      }
      else
      {
        dd = docSess.getDraftDescriptor();
      }
      SectionDescriptor sd = draftMgr.getSectionDescriptor(dd, DraftSection.TEMPLATE);
      OutputStream os = new ByteArrayOutputStream();      
      ACFUtil.process(request.getInputStream(), os);
      InputStream is = new ByteArrayInputStream(os.toString().getBytes());
      draftMgr.storeSection(sd, is);      
      //draftMgr.storeSection(sd, request.getInputStream());
    }
    catch (ConcordException e)
    {
      LOGGER.log(Level.SEVERE, "Save Doc Template Failed.", e);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
    catch(ActiveContentProcessorException e)
    {
  	  LOGGER.log(Level.WARNING, "Save Doc Template Failed.", e);
  	  response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
    catch(IOException e)
    {
  	  LOGGER.log(Level.WARNING, "Save Doc Template Failed.", e);
  	  response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }         

    return;
  }
}
