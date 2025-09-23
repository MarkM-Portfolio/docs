package com.ibm.docs.im.installer.common.validator;

import java.util.Map;

import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.internal.Messages;
import com.ibm.docs.im.installer.common.util.Constants;

public class DmgrServerNameValidator extends UserDataValidator
{
  public DmgrServerNameValidator()
  {
    ;
  }

  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes")Map map)
  {
    return false;
  }

  public IStatus validateUserData(@SuppressWarnings("rawtypes")Map map)
  {
    boolean managedByCluster = Boolean.valueOf(map.get(Constants.APPLICATION_SCOPE).toString());

    if (managedByCluster)
    {
      String filterJarsPath = map.get(Constants.DMGR_INSTANCE_NAME).toString();
      if (filterJarsPath == null || filterJarsPath.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.Message_DmgrServerInstanceNameNull$uuid,
            Messages.Message_DmgrServerInstanceNameNull$explanation, Messages.Message_DmgrServerInstanceNameNull$useraction, 0,
            Messages.Message_DmgrServerInstanceNameNull$message);
      }
    }

    return Status.OK_STATUS;
  }
}
