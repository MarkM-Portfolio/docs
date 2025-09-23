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
import com.ibm.docs.im.installer.internal.Messages;

public class ServerNameValidator extends UserDataValidator
{

  public ServerNameValidator()
  {
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    // If conversion panel is not loaded, don't validate the user data
    if (map.get(Constants.CONV_INSTALL_LOCATION) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    String connLoc = map.get(Constants.CONV_INSTALL_LOCATION).toString();
    if (connLoc == null || connLoc.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("ConnPanel_installLocNull$uuid"), "",
          Messages.getString("ConnPanel_installLocNull$explanation"), 0, Messages.getString("ConnPanel_installLocNull$message"));
    }
    return Status.OK_STATUS;
  }

}
