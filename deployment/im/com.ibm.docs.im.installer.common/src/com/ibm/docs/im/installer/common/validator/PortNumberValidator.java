package com.ibm.docs.im.installer.common.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.internal.Messages;

public class PortNumberValidator extends UserDataValidator
{
  public PortNumberValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    String dmgrSoapPort = map.get(Constants.SERVER_SOAP_PORT).toString();

    if (dmgrSoapPort == null || dmgrSoapPort.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_SOAPPortNull$uuid, Messages.Message_SOAPPortNull$explanation,
          Messages.Message_SOAPPortNull$useraction, 0, Messages.Message_SOAPPortNull$message);
    }

    try
    {
      Integer.parseInt(dmgrSoapPort.trim());
    }
    catch (NumberFormatException ex)
    {
      return IMStatuses.ERROR.get(Messages.Message_InvalidSOAPPort$uuid, Messages.Message_InvalidSOAPPort$explanation,
          Messages.Message_InvalidSOAPPort$useraction, 0, ex, Messages.Message_InvalidSOAPPort$message, dmgrSoapPort);
    }

    return Status.OK_STATUS;
  }
}
