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

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.ILogLevel;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.common.util.Util;
import com.ibm.docs.im.installer.internal.Messages;

public class AdminPasswordValidator extends UserDataValidator
{
  private static final ILogger logger = IMLogger.getLogger(AdminPasswordValidator.class.getCanonicalName());

  private static final String PROCESS_TYPE = "DeploymentManager"; // NON-NLS-1

  private static final String UNMANAGED_TYPE = "UnManagedProcess"; // NON-NLS-1

  private static final String MINIMUM_CONVERSION_WAS_VERSION = "7.0.0.0"; // NON-NLS-1

  private static final String MINIMUM_CONVERSION_WAS_VERSION_PATTERN = ".*'?(\\d+){1}\\.(\\d+){1}\\.(\\d+){1}\\.(\\d+){1}'?.*"; // NON-NLS-1

  private static final String STOPPED = "Error creating \"SOAP\" connection"; // NON-NLS-1

  private static final String SERVER_NOT_FOUND = "ADMU0522E"; // NON-NLS-1

  //private static final String AUTH_FAILED = "ADMU0002E"; // NON-NLS-1
  private static final String AUTH_FAILED = "Access is denied"; // NON-NLS-1

  private static final String NODE_NOT_FOUND = "WASX7015E"; // NON-NLS-1

  private static final String BAD_SOAP_PORT = "WASX7023E"; // NON-NLS-1

  public AdminPasswordValidator()
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
    
    String adminPwd = map.get(Constants.PASSWORD_OF_WASADMIN).toString();

    if (adminPwd == null || EncryptionUtils.decrypt(adminPwd).trim().length() == 0)
    {
      return IMStatuses.ERROR.get(Messages.Message_AdminPwdNull$uuid, Messages.Message_AdminPwdNull$explanation,
          Messages.Message_AdminPwdNull$useraction, 0, Messages.Message_AdminPwdNull$message);
    }
    else
    {
      adminPwd = EncryptionUtils.decrypt(adminPwd);
    }

    boolean isValidateConnection = false;
    if (map.get(Constants.COLLECT_WAS_INFORMATION_PANEL) != null
        && Boolean.parseBoolean(map.get(Constants.COLLECT_WAS_INFORMATION_PANEL).toString()) == true)
    {
      isValidateConnection = true;
    }

    if (isValidateConnection)
    {
      
      String profilePath = map.get(Constants.LOCAL_WAS_INSTALL_ROOT).toString();
      //String applicationScope = map.get(ConversionWASConfigPanel.APPLICATION_SCOPE).toString();
      //boolean managedByCluster = applicationScope.equals(ConversionWASConfigPanel.CLUSTER_SCOPE);
      //String serverName = map.get(ConversionWASConfigPanel.APPLICATION_SCOPE_NAME).toString();
      String adminName = map.get(Constants.WASADMIN).toString();
      //String dmgrSoapPort = map.get(ConversionWASConfigPanel.WAS_SOAP_PORT).toString();
      

      //if (!managedByCluster)
      {
        // First, check that we can communicate with the server (verifying authentication and access to the WAS Soap port, etc)
        Map<String, String> exitResult = new HashMap<String, String>();
        try
        {
          String scriptPath = IMUtil.getScriptsPath(data.getProfile());
          exitResult = Util.verifyWASAdminPassword(adminName, adminPwd,profilePath,scriptPath);
        }
        catch (IOException e)
        {
          logger.log(ILogLevel.ERROR, "Validate installation node server running status failed. {0}", e); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.Message_AdminPwdValFailed$uuid, Messages.getString("Message_AdminPwdValFailed$explanation"),
              Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message"), e.getLocalizedMessage());
        }
        catch (InterruptedException e)
        {
          logger.log(ILogLevel.ERROR, "Validate installation node server running status failed. {0}", e); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.Message_AdminPwdValFailed$uuid, Messages.getString("Message_AdminPwdValFailed$explanation"),
              Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message"), e.getLocalizedMessage());
        }

        String output = exitResult.get(Util.PROCESS_STD_OUT);
        if (output.contains(STOPPED))
        {
          logger.log(ILogLevel.ERROR, "The installation node server is stopped. {0}", new Object[] { exitResult.values() }); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.getString("Message_AdminPwdValFailed$uuid"), Messages.getString("Message_AdminPwdValFailed$explanation"),
              Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message6"), new Object[] { "" });
        }
        else if (output.contains(SERVER_NOT_FOUND))
        {
          logger.log(ILogLevel.ERROR, "Can not find the installation node server {0}", new Object[] { exitResult.values() }); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.getString("Message_AdminPwdValFailed$uuid"), Messages.getString("Message_AdminPwdValFailed$explanation"),
              Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message7"), "");
        }
        else if (output.contains(AUTH_FAILED))
        {
          logger.log(ILogLevel.ERROR, "Authentication failed to check the conversion server status. {0}",
              new Object[] { exitResult.values() }); // NON-NLS-1
          return IMStatuses.ERROR.get(Messages.getString("Message_AdminPwdValFailed$uuid"), Messages.getString("Message_AdminPwdValFailed$explanation"),
              Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message8"));
        }
        else
        {
          if (exitResult.get(Util.PROCESS_EXIT_CODE) != null && Integer.valueOf(exitResult.get(Util.PROCESS_EXIT_CODE)) != 0)
          {
            logger.log(ILogLevel.ERROR, "Can not detect the status of the installation node server {0}", new Object[] { 
                exitResult.values() }); // NON-NLS-1
            return IMStatuses.ERROR.get(Messages.getString("Message_AdminPwdValFailed$uuid"), Messages.getString("Message_AdminPwdValFailed$explanation"),
                Messages.getString("Message_AdminPwdValFailed$useraction"), 0, Messages.getString("Message_AdminPwdValFailed$message9"), "");
          }
          else
          {
            ;
          }
        }       
      }      
    }

    return Status.OK_STATUS;
  }  
}
