/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.notification;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocMessageDAO;

public abstract class AbstactMessage
{
  public abstract boolean createMessage(Object msgSource);
  
  public abstract boolean deleteMessage(Object msgSource);
  
  protected IDocMessageDAO getDocMessageDAO()
  {
    return (IDocMessageDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocMessageDAO.class);
  }
}
