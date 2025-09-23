/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.ecm.validator;

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

public class ECMValidator extends UserDataValidator
{

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
    // If ECM panel is not loaded, don't validate the user data
    if (map.get(Constants.ECM_FNCMIS_URL) == null)
      return true;
    return false;
  }

  @Override
  public IStatus validateUserData(@SuppressWarnings("rawtypes") Map map)
  {
    IAdaptable adaptable = getAdaptable();
    ICustomPanelData data = (ICustomPanelData)adaptable.getAdapter(ICustomPanelData.class);
    boolean ecmInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMECM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMST)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICECM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICCCMECM);
    boolean ccmInstalled = IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMCCM)
        || IMUtil.isFeatureSelected(data.getAllJobs(), Constants.IBMICCCMECM);
    
    Object ecmFNCMISUrl = map.get(Constants.ECM_FNCMIS_URL);
    if (ecmFNCMISUrl == null || ecmFNCMISUrl.toString().trim().length() == 0)
    {
      return IMStatuses.ERROR.get("CLFAD3017E", Messages.getString("NULL_ERROR_ECM_FNCMIS_URL_EXPLANATION"),
          Messages.getString("NULL_ERROR_ECM_FNCMIS_URL_USERACTION"), 1, Messages.getString("NULL_ERROR_ECM_FNCMIS_URL"));
    }
    else
    {
      try
      {
        URL url = new URL(ecmFNCMISUrl.toString().trim());
        if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
        {
          throw new MalformedURLException();
        }
      }
      catch (MalformedURLException e)
      {
        return IMStatuses.ERROR.get("CLFAD3018E", Messages.getString("INVALID_ERROR_ECM_FNCMIS_URL_EXPLANATION"),
            Messages.getString("INVALID_ERROR_ECM_FNCMIS_URL_USERACTION"), 1, Messages.getString("INVALID_ERROR_ECM_FNCMIS_URL"));
      }

    }

    Object ecmFNCSUrl = map.get(Constants.ECM_FNCS_URL);
    if (ecmFNCSUrl == null || ecmFNCSUrl.toString().trim().length() == 0)
    {
      return IMStatuses.ERROR.get("CLFAD3019E", Messages.getString("NULL_ERROR_ECM_FNCS_URL_EXPLANATION"),
          Messages.getString("NULL_ERROR_ECM_FNCS_URL_USERACTION"), 1, Messages.getString("NULL_ERROR_ECM_FNCS_URL"));
    }
    else
    {
      try
      {
        URL url = new URL(ecmFNCSUrl.toString().trim());
        if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
        {
          throw new MalformedURLException();
        }
      }
      catch (MalformedURLException e)
      {
        return IMStatuses.ERROR.get("CLFAD3020E", Messages.getString("INVALID_ERROR_ECM_FNCS_URL_EXPLANATION"),
            Messages.getString("INVALID_ERROR_ECM_FNCS_URL_USERACTION"), 1, Messages.getString("INVALID_ERROR_ECM_FNCS_URL"));
      }

    }
    if(ecmInstalled)
    {      
      Object ecmNavigatorUrl = map.get(Constants.ECM_NAVIGATOR_URL);
      if (ecmNavigatorUrl == null || ecmNavigatorUrl.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3021E", Messages.getString("NULL_ERROR_ECM_NAVIGATOR_URL_EXPLANATION"),
            Messages.getString("NULL_ERROR_ECM_NAVIGATOR_URL_USERACTION"), 1, Messages.getString("NULL_ERROR_ECM_NAVIGATOR_URL"));
      }
      else
      {
        try
        {
          URL url = new URL(ecmNavigatorUrl.toString().trim());
          if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
          {
            throw new MalformedURLException();
          }
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get("CLFAD3022E", Messages.getString("INVALID_ERROR_ECM_NAVIGATOR_URL_EXPLANATION"),
              Messages.getString("INVALID_ERROR_ECM_NAVIGATOR_URL_USERACTION"), 1, Messages.getString("INVALID_ERROR_ECM_NAVIGATOR_URL"));
        }
        
      }
    }

    if (ccmInstalled)
    {
      Object ecmJ2CAlias = map.get(Constants.ECM_J2C_ALIAS);
      if (ecmJ2CAlias == null || ecmJ2CAlias.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3025E", Messages.getString("NULL_ERROR_ECM_J2CALIAS_URL_EXPLANATION"),
            Messages.getString("NULL_ERROR_ECM_J2CALIAS_URL_USERACTION"), 1, Messages.getString("NULL_ERROR_ECM_J2CALIAS_URL"));
      }

      Object ecmCommunitiesSUrl = map.get(Constants.ECM_COMMUNITIES_URL);
      if (ecmCommunitiesSUrl == null || ecmCommunitiesSUrl.toString().trim().length() == 0)
      {
        return IMStatuses.ERROR.get("CLFAD3023E", Messages.getString("NULL_ERROR_ECM_COMMUNITY_URL_EXPLANATION"),
            Messages.getString("NULL_ERROR_ECM_COMMUNITY_URL_USERACTION"), 1, Messages.getString("NULL_ERROR_ECM_COMMUNITY_URL"));
      }
      else
      {
        try
        {
          URL url = new URL(ecmCommunitiesSUrl.toString().trim());
          if (url.getProtocol().isEmpty() || url.getHost().isEmpty())
          {
            throw new MalformedURLException();
          }
        }
        catch (MalformedURLException e)
        {
          return IMStatuses.ERROR.get("CLFAD3024E", Messages.getString("INVALID_ERROR_ECM_COMMUNITY_URL_EXPLANATION"),
              Messages.getString("INVALID_ERROR_ECM_COMMUNITY_URL_USERACTION"), 1, Messages.getString("INVALID_ERROR_ECM_COMMUNITY_URL"));
        }

      }
    }

    return Status.OK_STATUS;
  }

}
