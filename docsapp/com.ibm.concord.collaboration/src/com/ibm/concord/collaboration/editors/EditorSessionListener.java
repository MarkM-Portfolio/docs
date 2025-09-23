/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.collaboration.editors;

import java.sql.Timestamp;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.listener.ISessionListener;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public class EditorSessionListener implements ISessionListener
{
  private static final Logger LOG = Logger.getLogger(EditorSessionListener.class.getName());

  @Override
  public void sessionOpened(IDocumentEntry docEntry, DraftDescriptor draftDescriptor)
  {

  }

  @Override
  public void sessionClosed(IDocumentEntry docEntry, DraftDescriptor draftDescriptor, UserBean user, boolean inWork, boolean discard)
  {
    if (discard)
    {
      LOG.log(Level.INFO, "Dont record session leave time {0} because its discard operation!!!", new Object[] { docEntry.getDocUri() });
      return;
    }

  }

  @Override
  public void messageReceived(DraftDescriptor draftDescriptor, UserBean user)
  {

  }

  @Override
  public void userJoined(IDocumentEntry docEntry, UserBean user)
  {

  }

  @Override
  public void userLeave(IDocumentEntry docEntry, UserBean user)
  {
	  	IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
	        IDocumentEditorsDAO.class);
	    DocumentEditorBean editor = docEditorsDAO.getDocumentEditor(docEntry, user.getId());
	    if (editor != null)
	    {
	      Timestamp leaveSession = new Timestamp((new Date()).getTime());
	      editor.setLeaveSession(leaveSession);
	      boolean success = docEditorsDAO.updateEditorLeaveSession(editor);
	      if (success)
	      {
	        LOG.log(Level.INFO, "Succeed in updating leave session timestamp for user {0} in document {1}@{2}", new Object[] { user.getId(),
	            docEntry.getDocUri(), docEntry.getRepository() });
	        // To update the leave session time-stamp in memory
	        EditorsList editorList = EditorsListUtil.getEditorsList(user, docEntry);
	        if (editorList != null)
	        {
	          DocumentEditorBean bean = editorList.getEditorById(editor.getUserId());
	          if (bean != null)
	          {
	            bean.setLeaveSession(editor.getLeaveSession());
	          }
	        }
	      }
	      else
	      {
	        LOG.log(Level.WARNING, "Failed to update leave session timestamp for user {0} in document {1}@{2}", new Object[] { user.getId(),
	            docEntry.getDocUri(), docEntry.getRepository() });
	      }
	    }
  }
}
