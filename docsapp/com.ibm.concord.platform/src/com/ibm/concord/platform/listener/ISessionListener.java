/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.listener;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

public interface ISessionListener
{
  public void sessionOpened(IDocumentEntry docEntry, DraftDescriptor draftDescriptor);
  public void sessionClosed(IDocumentEntry docEntry, DraftDescriptor draftDescriptor, UserBean user, boolean inWork, boolean discard);
  public void messageReceived(DraftDescriptor draftDescriptor, UserBean user);
  public void userJoined(IDocumentEntry docEntry, UserBean user);
  public void userLeave(IDocumentEntry docEntry, UserBean user);
}
