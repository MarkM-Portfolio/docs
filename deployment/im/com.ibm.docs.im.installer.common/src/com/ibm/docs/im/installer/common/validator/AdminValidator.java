package com.ibm.docs.im.installer.common.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.internal.Messages;

public class AdminValidator extends UserDataValidator
{
  public AdminValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    String admin = map.get(Constants.SERVER_ADMIN).toString();

    if (admin == null || admin.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_AdminNull$uuid, Messages.Message_AdminNull$explanation,
          Messages.Message_AdminNull$useraction, 0, Messages.Message_AdminNull$message);
    }

    return Status.OK_STATUS;
  }
}
