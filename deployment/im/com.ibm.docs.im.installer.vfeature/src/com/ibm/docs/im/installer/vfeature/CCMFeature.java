/**
 * 
 */
package com.ibm.docs.im.installer.vfeature;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;


import org.eclipse.core.runtime.IAdaptable;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Status;

import com.ibm.cic.agent.core.api.IMStatuses;

import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.model.ISelectionExpression;
import com.ibm.docs.im.installer.common.util.IMUtil;
import com.ibm.docs.im.installer.vfeature.internal.Messages;


/**
 * @author chengjh
 *
 */
public class CCMFeature implements ISelectionExpression
{
  @Override
  public IStatus evaluate(EvaluationContext arg0)
  {
    // TODO Auto-generated method stub
    if (arg0!=null && arg0 instanceof IAdaptable)
    {
      IAdaptable iAdaptable = (IAdaptable)arg0;
      //IAgentJob[] jobs = (IAgentJob[])iAdaptable.getAdapter(IAgentJob[].class);
      //IAgent iAgent = (IAgent)iAdaptable.getAdapter(IAgent.class);
      IProfile iProfile = (IProfile)iAdaptable.getAdapter(IProfile.class);
      if (iProfile!=null)
      {
        try
        {
          String configFile = IMUtil.getFeatureConfig(iProfile);
          if (configFile!=null)
          {
            File config = new File(configFile);
            if (config.isFile())
            {
              boolean bShowCCM = false;
              String line = null;
              BufferedReader reader = new BufferedReader(new FileReader(config));
              while ((line = reader.readLine()) != null && line.indexOf("CCM")!=-1)
              {
                String[] item = line.split(":");
                if (item[0].equalsIgnoreCase("CCM") && Boolean.valueOf(item[1]))
                {
                  bShowCCM = true;
                  break;
                }
              }
              reader.close();
              
              if ( !bShowCCM )
              {
                return IMStatuses.ERROR.get(Messages.getString("Message_CCMFeature$uuid"), Messages.getString("Message_CCMFeature$explanation"),
                    Messages.getString("Message_Feature$useraction"), 0, Messages.getString("Message_CCMFeature$message"));
              }else
              {
                return Status.OK_STATUS;
              }
            }
          }
        }
        catch (IOException e)
        {
          return IMStatuses.ERROR.get(Messages.getString("Message_CCMFeature$uuid"), Messages.getString("Message_CCMFeature$explanation"),
              Messages.getString("Message_Feature$useraction"), 0, Messages.getString("Message_CCMFeature$message"));
          // TODO Auto-generated catch block
          //e.printStackTrace();
        }
      }
    }
    
    return Status.OK_STATUS;
  }

}
