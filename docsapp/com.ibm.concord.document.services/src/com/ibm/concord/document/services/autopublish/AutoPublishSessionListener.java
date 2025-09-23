/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.document.services.autopublish;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.listener.ISessionListener;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryConstants;

public class AutoPublishSessionListener implements ISessionListener
{
  private static final Logger LOG = Logger.getLogger(AutoPublishSessionListener.class.getName());

  public AutoPublishSessionListener()
  {

  }

  public void sessionOpened(IDocumentEntry docEntry, DraftDescriptor draftDescriptor)
  {
  }

  public void sessionClosed(IDocumentEntry docEntry, DraftDescriptor draftDescriptor, UserBean user, boolean inWork, boolean discard)
  {
    if (discard)
    {
      LOG.log(Level.INFO, "Dont auto publish document {0} because its discard operation!!!", new Object[] { docEntry.getDocUri() });
      return;
    }

    boolean autopublish = AutoPublishUtil.isFeatureEnabled() && AutoPublishUtil.isAutoPublish(docEntry);

    if (autopublish)
    {
      if (inWork)
      {
        AutoPublishAction action = new AutoPublishAction(docEntry, user, draftDescriptor);
        action.action();
      }
      else
      {
        try
        {
          LOG.log(Level.INFO, "Do auto publish document {0} in a separate work because SessionClose is not in a work!!",
              new Object[] { docEntry.getDocUri() });

          AutoPublishWork work = new AutoPublishWork(docEntry, user, draftDescriptor);
          Platform.getAutoPublishWorkManager().startWork(work);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Exception happens while starting autopublish work for document " + docEntry.getDocUri(), e);
        }
      }
    }
    else
    {
      LOG.log(Level.INFO, "Dont auto publish document {0} because its disabled!", new Object[] { docEntry.getDocUri() });
    }
  }

  public void messageReceived(DraftDescriptor draftDescriptor, UserBean user)
  {

  }

  public void userJoined(IDocumentEntry docEntry, UserBean user)
  {
    // TODO Auto-generated method stub

  }

  public void userLeave(IDocumentEntry docEntry, UserBean user)
  {

  }
}
