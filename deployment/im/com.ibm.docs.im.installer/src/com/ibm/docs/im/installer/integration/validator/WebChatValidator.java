/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.integration.validator;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;
import com.ibm.docs.im.installer.util.PanelUtil;

public class WebChatValidator extends UserDataValidator
{
  private static final int MAX_ATTEMPTS = 500; // 500 times

  private static final int MAX_ATTEMPTS_TIME = 10000;// 10 seconds

  public WebChatValidator()
  {
  }

  @Override
  public boolean shouldSkipValidation(@SuppressWarnings("rawtypes") Map map)
  {
    IAdaptable adaptable = getAdaptable();
    ICustomPanelData data = (ICustomPanelData)adaptable.getAdapter(ICustomPanelData.class);
    String envType = IMUtil.getDeployType(data.getAllJobs());
    if(Constants.IM_DEPLOYMENT_TYPE_UNINSTALL.equalsIgnoreCase(envType) || Constants.IM_DEPLOYMENT_TYPE_ROLLBACK.equalsIgnoreCase(envType))
    {
      return true;
    }
    // If webchat panel is not loaded, don't validate the user data
    if (map.get(Constants.WC_INSTALL_CHOICE) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    String installChoice = map.get(Constants.WC_INSTALL_CHOICE).toString();
    if (installChoice!=null && Constants.COMBO_OPTION_FALSE.equals(installChoice))
    {
      return Status.OK_STATUS;
    }
    else
    {
      String installType = map.get(Constants.WC_INSTALL_TYPE).toString();
      if (installType!=null && Constants.ST_CONNECTIONS_CM.equals(installType))
      {
        //String connConifgLoc = map.get(Constants.WC_CONN_CONFIG_LOCATION).toString();
        //if (connConifgLoc == null || connConifgLoc.trim().length() == 0)
        //{
        //  return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_connConfigLocNull$uuid"), "",
        //      Messages.getString("WebChatPanel_connConfigLocNull$explanation"), 0,
        //      Messages.getString("WebChatPanel_connConfigLocNull$message"));
        //}
      }
      else
      {
        IAdaptable adaptable = getAdaptable();
        ICustomPanelData data = (ICustomPanelData)adaptable.getAdapter(ICustomPanelData.class);
        boolean bConnInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.INTEGRATION_WITH_CONNECTIONS_ID)
            || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.INTEGRATION_WITH_CCM_ID)
            || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.INTEGRATION_WITH_IC_ECM_ID)
            || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.INTEGRATION_WITH_IC_CCM_ECM_ID);
        boolean stInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.INTEGRATION_WITH_STANDALONE_ST_ID);
        boolean docsInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.DOCS_ID);
        
        if (bConnInstalled && docsInstalled)
        {
          // clean STSD, enable LCST
          String connAttempts = map.get(Constants.WC_CONN_ATTEMPTS).toString();
          int attemptsValue = PanelUtil.parseInt(connAttempts);
          if (connAttempts == null || connAttempts.trim().length() == 0 || attemptsValue < 0 || attemptsValue > MAX_ATTEMPTS)
          {
            return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_attemptsInvalid$uuid"), "",
                Messages.getString("WebChatPanel_attemptsInvalid$explanation"), 0, Messages.getString("WebChatPanel_attemptsInvalid$message"));
          }
          String connAttemptsTime = map.get(Constants.WC_CONN_ATTEMPTS_TIME).toString();
          int attemptsTimeValue = PanelUtil.parseInt(connAttemptsTime);
          if (connAttemptsTime == null || connAttemptsTime.trim().length() == 0 || attemptsTimeValue < 0
              || attemptsTimeValue > MAX_ATTEMPTS_TIME)
          {
            return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_attemptsTimeInvalid$uuid"), "",
                Messages.getString("WebChatPanel_attemptsTimeInvalid$explanation"), 0,
                Messages.getString("WebChatPanel_attemptsTimeInvalid$message"));
          }
        }
        else if (stInstalled && docsInstalled)
        {
        String stServerUrl = map.get(Constants.WC_ST_SERVER_URL).toString();
        if (stServerUrl == null || stServerUrl.trim().length() == 0)
        {
          return IMStatuses.ERROR
              .get(Messages.getString("WebChatPanel_stServerUrlNull$uuid"), "",
                  Messages.getString("WebChatPanel_stServerUrlNull$explanation"), 0,
                  Messages.getString("WebChatPanel_stServerUrlNull$message"));
        }
        String sslServerUrl = map.get(Constants.WC_SSL_SERVER_URL).toString();
        if (sslServerUrl == null || sslServerUrl.trim().length() == 0)
        {
          return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_sslServerUrlNull$uuid"), "",
              Messages.getString("WebChatPanel_sslServerUrlNull$explanation"), 0,
              Messages.getString("WebChatPanel_sslServerUrlNull$message"));
        }
        try
        {
          new URL(stServerUrl);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_stServerUrlInvalid$uuid"), "",
              Messages.getString("WebChatPanel_stServerUrlInvalid$explanation"), 0,
              Messages.getString("WebChatPanel_stServerUrlInvalid$message"));
        }
        try
        {
          new URL(sslServerUrl);
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("WebChatPanel_sslServerUrlInvalid$uuid"), "",
              Messages.getString("WebChatPanel_sslServerUrlInvalid$explanation"), 0,
              Messages.getString("WebChatPanel_sslServerUrlInvalid$message"));
        }

      }
      }
    }

    return Status.OK_STATUS;
  }

}
