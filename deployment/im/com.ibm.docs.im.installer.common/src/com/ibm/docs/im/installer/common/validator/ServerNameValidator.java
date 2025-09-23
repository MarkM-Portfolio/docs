package com.ibm.docs.im.installer.common.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.internal.Messages;
import com.ibm.docs.im.installer.common.util.Constants;

public class ServerNameValidator extends UserDataValidator
{
  public ServerNameValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    String serverName = map.get(Constants.SERVER_INSTANCE_NAME).toString();

    if (serverName == null || serverName.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_ServerNameNull$uuid, Messages.getString("Message_ServerNameNull$explanation"),
          Messages.Message_ServerNameNull$useraction, 0, Messages.getString("Message_ServerNameNull$message"));
    }

    return Status.OK_STATUS;
  }
}
