/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.conversion.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;

public class StartingPortValidator extends UserDataValidator
{

  public StartingPortValidator()
  {
    // TODO Auto-generated constructor stub
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    // If conversion panel is not loaded, don't validate the user data
    if (map.get(Constants.CONV_START_PORT) == null || map.get(Constants.CONV_CPU_NUMBER) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    String portRangeStart = map.get(Constants.CONV_START_PORT).toString();
    String numberOfPorts = map.get(Constants.CONV_CPU_NUMBER).toString();

    if (portRangeStart == null || portRangeStart.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_SymphonyPortStartNull$uuid"),
          Messages.getString("Message_SymphonyPortStartNull$explanation"), Messages.getString("Message_SymphonyPortStartNull$useraction"),
          0, Messages.getString("Message_SymphonyPortStartNull$message"));
    }

    int startingPort = 0;
    int endingPort = 0;
    int maxValue = Util.VALID_PORT_NUMBER_HIGHEST;
    try
    {
      int dNumberOfPorts = Integer.parseInt(numberOfPorts.trim()) * 2;
      startingPort = Integer.parseInt(portRangeStart.trim());
      endingPort = startingPort + dNumberOfPorts - 1;
      maxValue = maxValue - dNumberOfPorts + 1;
      if (!Util.isPortValid(startingPort))
      {
        return IMStatuses.ERROR.get(Messages.getString("Message_InvalidSymphonyPortStart$uuid"),
            Messages.getString("Message_InvalidSymphonyPortStart$explanation"),
            Messages.getString("Message_InvalidSymphonyPortStart$useraction"), 0,
            Messages.getString("Message_InvalidSymphonyPortStart$message"), startingPort, maxValue);
      }
      if (!Util.isPortValid(endingPort))
      {

        return IMStatuses.ERROR.get(Messages.getString("Message_InvalidSymphonyPortStart$uuid"),
            Messages.getString("Message_InvalidSymphonyPortStart$explanation"),
            Messages.getString("Message_InvalidSymphonyPortStart$useraction"), 0,
            Messages.getString("Message_InvalidSymphonyPortStart$message"), startingPort, maxValue);
      }
    }
    catch (NumberFormatException ex)
    {
      return IMStatuses.ERROR.get(Messages.getString("Message_InvalidSymphonyPortStart$uuid"),
          Messages.getString("Message_InvalidSymphonyPortStart$explanation"),
          Messages.getString("Message_InvalidSymphonyPortStart$useraction"), 0, ex,
          Messages.getString("Message_InvalidSymphonyPortStart$message"), startingPort, maxValue);
    }

    for (int port = startingPort; port <= endingPort; port++)
    {
      if (Util.isLoopbackPortInUse(port))
      {
        return IMStatuses.ERROR.get(Messages.getString("Message_SymphonyPortInUse$uuid"),
            Messages.getString("Message_SymphonyPortInUse$explanation"), Messages.getString("Message_SymphonyPortInUse$useraction"), 0,
            Messages.getString("Message_SymphonyPortInUse$message"), port);
      }
    }
    return Status.OK_STATUS;
  }

}
