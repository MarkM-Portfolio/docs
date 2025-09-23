/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.database.validator;

import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelUtil;

public class DBValidator extends UserDataValidator
{
  private static final int MAX_PORT = 100000;

  public DBValidator()
  {
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    // If database panel is not loaded, don't validate the user data
    if (map.get(Constants.DB_SERVER_HOST_URL) == null || map.get(Constants.DB_USER_NAME) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    IAdaptable adaptable = getAdaptable();
    ICustomPanelData data = (ICustomPanelData) adaptable.getAdapter(ICustomPanelData.class);
    IProfile iProfile = data != null ? data.getProfile() : null;
    if (iProfile != null)
    {
      String status = iProfile.getOfferingUserData(Constants.DB_PANEL, Constants.OFFERING_ID);
      if (status != null && status.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        return Status.OK_STATUS;
    }

    boolean isUpdated = map.get(Constants.DB_IS_DOCS_UPGRADED) != null
        && Boolean.parseBoolean(map.get(Constants.DB_IS_DOCS_UPGRADED).toString()) == true;

    if (!isUpdated)
    {
      String hostUrl = map.get(Constants.DB_SERVER_HOST_URL).toString();
      if (hostUrl == null || hostUrl.trim().length() == 0)
      {
        return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_HostUrlNull$uuid"), "",
            Messages.getString("DatabasePanel_HostUrlNull$explanation"), 0, Messages.getString("DatabasePanel_HostUrlNull$message"));
      }
    }

    String userName = map.get(Constants.DB_USER_NAME).toString();
    if (userName == null || userName.trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_UserNameNull$uuid"), "",
          Messages.getString("DatabasePanel_UserNameNull$explanation"), 0, Messages.getString("DatabasePanel_UserNameNull$message"));
    }
    String password = map.get(Constants.DB_PASSWORD).toString();
    if (password == null || EncryptionUtils.decrypt(password).trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_PasswordNull$uuid"), "",
          Messages.getString("DatabasePanel_PasswordNull$explanation"), 0, Messages.getString("DatabasePanel_PasswordNull$message"));
    }

    if (!isUpdated)
    {
      String docsDb = map.get(Constants.DB_DOCS_DATABASE).toString();
      if (docsDb == null || docsDb.trim().length() == 0)
      {
        String dbType = map.get(Constants.DB_PRODUCT_NAME).toString();
        if (dbType!=null && dbType.equalsIgnoreCase(Constants.DB_PRODUCT_NAME_ORACLE))
        {
          return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_DocsDBNull$uuid"), "",
              Messages.getString("DatabasePanel_DocsDBNull$explanation"), 0, Messages.getString("DatabasePanel_DocsDBNull$messageOracle"));
        }else
        {
          return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_DocsDBNull$uuid"), "",
              Messages.getString("DatabasePanel_DocsDBNull$explanation"), 0, Messages.getString("DatabasePanel_DocsDBNull$message"));
        }
      }
      String jdbcPath = map.get(Constants.DB_JDBC_PATH).toString();
      if (jdbcPath == null || jdbcPath.trim().length() == 0)
      {
        // TODO
        return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_JdbcPathNull$uuid"), "",
            Messages.getString("DatabasePanel_JdbcPathNull$explanation"), 0, Messages.getString("DatabasePanel_JdbcPathNull$message"));
      }

      String dbPort = map.get(Constants.DB_SERVER_PORT).toString();
      int portValue = PanelUtil.parseInt(dbPort);

      if (dbPort == null || dbPort.trim().length() == 0 || portValue < 0 || portValue > MAX_PORT)
      {
        return IMStatuses.ERROR.get(Messages.getString("DatabasePanel_ServerPortInvalid$uuid"), "",
            Messages.getString("DatabasePanel_ServerPortInvalid$explanation"), 0,
            Messages.getString("DatabasePanel_ServerPortInvalid$message"));
      }
    }
    return Status.OK_STATUS;
  }

}
