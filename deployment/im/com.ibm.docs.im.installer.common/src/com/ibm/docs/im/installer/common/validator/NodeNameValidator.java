package com.ibm.docs.im.installer.common.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.internal.Messages;

public class NodeNameValidator extends UserDataValidator
{
  public NodeNameValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    String nodeName = map.get(Constants.SERVER_NODE_NAME).toString();

    if (nodeName == null || nodeName.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_NodeNameNull$uuid, Messages.Message_NodeNameNull$explanation,
          Messages.Message_NodeNameNull$useraction, 0, Messages.getString("Message_NodeNameNull$message"));
    }

    return Status.OK_STATUS;
  }
}
