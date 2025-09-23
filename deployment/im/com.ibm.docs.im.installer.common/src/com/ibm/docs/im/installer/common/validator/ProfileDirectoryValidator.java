package com.ibm.docs.im.installer.common.validator;

import java.io.File;
import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Platform;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.internal.Messages;
import com.ibm.docs.im.installer.common.util.Util;

public class ProfileDirectoryValidator extends UserDataValidator
{
  public ProfileDirectoryValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    String proxyProfileDir = map.get(Constants.SERVER_PROFILE_PATH).toString();

    if (proxyProfileDir == null || proxyProfileDir.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_ProfileDirectoryNull$uuid, Messages.Message_ProfileDirectoryNull$explanation,
          Messages.Message_ProfileDirectoryNull$useraction, 0, Messages.Message_ProfileDirectoryNull$message);
    }

    File profileDirectory = new File(proxyProfileDir);
    if (!profileDirectory.exists())
    {
      return IMStatuses.ERROR.get(Messages.Message_ProfileDirectoryNotExist$uuid, Messages.Message_ProfileDirectoryNotExist$explanation,
          Messages.Message_ProfileDirectoryNotExist$useraction, 0, Messages.Message_ProfileDirectoryNotExist$message, profileDirectory.getPath());
    }

    String wsadminExecPath = Util.getExecPath(proxyProfileDir, 0);
    if (wsadminExecPath == null || !new File(wsadminExecPath).exists())
    {
      return IMStatuses.ERROR.get(Messages.Message_WsadminExecNotFound$uuid, Messages.getString("Message_WsadminExecNotFound$explanation"),
          Messages.Message_WsadminExecNotFound$useraction, 0, Messages.Message_WsadminExecNotFound$message, new Object[] {
              Platform.getOS(), Platform.getOSArch(), profileDirectory.getPath() });
    }

    if (!new File(wsadminExecPath).canExecute())
    {
      return IMStatuses.ERROR.get(Messages.Message_NoExecPermission4Wsadmin$uuid, Messages.getString("Message_NoExecPermission4Wsadmin$explanation"),
          Messages.Message_NoExecPermission4Wsadmin$useraction, 0, Messages.Message_NoExecPermission4Wsadmin$message, wsadminExecPath);
    }

    return Status.OK_STATUS;
  }
}
