/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2012.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.register.validator;

import java.util.Iterator;
import java.util.Map;

import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.ICustomPanelData;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.UserDataValidator;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.internal.Messages;

public class AdminPWDValidator extends UserDataValidator
{
  public AdminPWDValidator()
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
    //IAgentJob[] jobs = (IAgentJob[]) adaptable.getAdapter(IAgentJob[].class);
    //IAgent iAgent = (IAgent) adaptable.getAdapter(IAgent.class);    
    ICustomPanelData data = (ICustomPanelData)adaptable.getAdapter(ICustomPanelData.class);
    IAgentJob[] jobs = data!=null?data.getAllJobs():null;
    IAgent iAgent = data!=null?data.getAgent():null;
    IProfile iProfile  = data!=null?data.getProfile():null;    
    if (iProfile!=null)
    {
      String sts = iProfile.getOfferingUserData(Constants.ENROLL_HOST_PANEL, Constants.OFFERING_ID);      
      if (sts != null && sts.equalsIgnoreCase(Constants.PANEL_STATUS_OK))
        return Status.OK_STATUS;
    }
    if (IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_UPDATE)
        ||(IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_UPDATE)
            && (IMUtil.isUpgradeFromVersion(jobs,iAgent,iProfile, Constants.VERSION_105) 
                || IMUtil.isUpgradeFromVersion(jobs,iAgent,iProfile,Constants.VERSION_106)))
        ||(IMUtil.isDeployType(jobs, Constants.IM_DEPLOYMENT_TYPE_MODIFY)
            && (IMUtil.isFeatureAdded(jobs,iAgent,iProfile,Constants.IBMCONVERSION) 
                || IMUtil.isFeatureAdded(jobs,iAgent,iProfile,Constants.IBMDOCS))))
    {
      for(Iterator ite = map.entrySet().iterator(); ite.hasNext();)
      {
        Map.Entry entry = (Map.Entry) ite.next();
        String hostname = entry.getKey().toString();
        Object values = entry.getValue();          
        if (values!=null && values instanceof String[] )
        {
          String user = ((String[])values)[0];            
          String pwd = ((String[])values)[1];
          if (user==null)
          {
            return IMStatuses.ERROR.get(Messages.getString("Message_EnrollHostsPanel_UserEmpty$uuid"), Messages.getString("Message_EnrollHostsPanel_UserEmpty$explanation"),
                Messages.getString("Message_EnrollHostsPanel_UserEmpty$useraction"), 0, Messages.getString("Message_EnrollHostsPanel_UserEmpty$message"));
          }
          if (pwd==null)
          {
            return IMStatuses.ERROR.get(Messages.getString("Message_EnrollHostsPanel_PwdEmpty$uuid"), Messages.getString("Message_EnrollHostsPanel_PwdEmpty$explanation"),
                Messages.getString("Message_EnrollHostsPanel_PwdEmpty$useraction"), 0, Messages.getString("Message_EnrollHostsPanel_PwdEmpty$message"));
          }
        }
      }
    }
    
    return Status.OK_STATUS;
  }
}
