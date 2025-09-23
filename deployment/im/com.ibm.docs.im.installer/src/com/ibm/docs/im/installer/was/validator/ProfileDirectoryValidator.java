/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.was.validator;

import java.io.File;
import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Platform;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;


public class ProfileDirectoryValidator extends UserDataValidator
{
  public ProfileDirectoryValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    IAdaptable adaptable = getAdaptable();
    ICustomPanelData data = (ICustomPanelData)adaptable.getAdapter(ICustomPanelData.class);    
    IProfile iProfile  = data!=null?data.getProfile():null;
    if (iProfile!=null)
    {
      String status = iProfile.getOfferingUserData(Constants.COLLECT_WAS_INFORMATION_PANEL, Constants.OFFERING_ID);      
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        return Status.OK_STATUS;
    }
    
    String proxyProfileDir = map.get(Constants.LOCAL_WAS_INSTALL_ROOT).toString();

    if (proxyProfileDir == null || proxyProfileDir.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_ProfileDirectoryNull$uuid, Messages.Message_ProfileDirectoryNull$explanation,
          Messages.Message_ProfileDirectoryNull$useraction, 0, Messages.Message_ProfileDirectoryNull$message);
    }

    File profileDirectory = new File(proxyProfileDir);
    if (!profileDirectory.exists())
    {
      return IMStatuses.ERROR.get(Messages.Message_ProfileDirectoryNotExist$uuid, Messages.Message_ProfileDirectoryNotExist$explanation,
          Messages.Message_ProfileDirectoryNotExist$useraction, 0, Messages.Message_ProfileDirectoryNotExist$message,
          profileDirectory.getPath());
    }

    String wsadminExecPath = Util.getExecPath(proxyProfileDir, 0);
    if (wsadminExecPath == null || !new File(wsadminExecPath).exists())
    {
      return IMStatuses.ERROR.get(Messages.Message_WsadminExecNotFound$uuid, Messages.Message_WsadminExecNotFound$explanation,
          Messages.Message_WsadminExecNotFound$useraction, 0, Messages.Message_WsadminExecNotFound$message, new Object[] {
              Platform.getOS(), Platform.getOSArch(), profileDirectory.getPath() });
    }

    if (!new File(wsadminExecPath).canExecute())
    {
      return IMStatuses.ERROR.get(Messages.Message_NoExecPermission4Wsadmin$uuid, Messages.Message_NoExecPermission4Wsadmin$explanation,
          Messages.Message_NoExecPermission4Wsadmin$useraction, 0, Messages.Message_NoExecPermission4Wsadmin$message, wsadminExecPath);
    }

    return Status.OK_STATUS;
  }

}
