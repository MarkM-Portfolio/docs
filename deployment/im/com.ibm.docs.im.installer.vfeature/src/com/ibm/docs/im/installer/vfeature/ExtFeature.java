/**
 * 
 */
package com.ibm.docs.im.installer.vfeature;

import java.io.File;


import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IAgent;
import com.ibm.cic.agent.core.api.IAgentJob;
import com.ibm.cic.agent.core.api.IMStatuses;

import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.ISelectionExpression;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.vfeature.internal.Messages;


/**
 * @author chengjh
 *
 */
public class ExtFeature implements ISelectionExpression
{
  @Override
  public IStatus evaluate(EvaluationContext arg0)
  {
    // TODO Auto-generated method stub
    if (arg0!=null && arg0 instanceof IAdaptable)
    {
      IAdaptable iAdaptable = (IAdaptable)arg0;
      IAgentJob[] jobs = (IAgentJob[])iAdaptable.getAdapter(IAgentJob[].class);
      IAgent iAgent = (IAgent)iAdaptable.getAdapter(IAgent.class);
      IProfile iProfile = (IProfile)iAdaptable.getAdapter(IProfile.class);
      if (jobs!=null && jobs[0].isUpdate()
          && (IMUtil.isUpgradeFromVersion(jobs, iAgent, iProfile, Constants.VERSION_105) || IMUtil
              .isUpgradeFromVersion(jobs, iAgent, iProfile, Constants.VERSION_106)))
      {        
        String installationRoot = iProfile.getInstallLocation();
        
        //Docs Ext
        String cfgFileDir = installationRoot + File.separator + Constants.DOCS_EXT_LOCAL_DIR + File.separator + Constants.CONFIG_PROPERTIES_FILE;
        File cfgfile = new File(cfgFileDir);
        if (cfgfile!=null && cfgfile.isFile())
        {
          return Status.OK_STATUS;
        }        
        else
        {
          return IMStatuses.ERROR.get(Messages.getString("Message_ExtFeature$uuid"), Messages.getString("Message_ExtFeature$explanation"),
              Messages.getString("Message_Feature$useraction"), 0, Messages.getString("Message_ExtFeature$message"));
        }
      }
    }
    
    return Status.OK_STATUS;
  }

}
