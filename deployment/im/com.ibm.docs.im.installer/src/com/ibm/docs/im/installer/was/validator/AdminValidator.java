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

import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;

public class AdminValidator extends UserDataValidator
{
  public AdminValidator()
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
    
    String admin = map.get(Constants.WASADMIN).toString();

    if (admin == null || admin.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_AdminNull$uuid, Messages.Message_AdminNull$explanation,
          Messages.Message_AdminNull$useraction, 0, Messages.Message_AdminNull$message);
    }

    return Status.OK_STATUS;
  }
}
