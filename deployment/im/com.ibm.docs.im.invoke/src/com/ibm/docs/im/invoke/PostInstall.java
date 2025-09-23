package com.ibm.docs.im.invoke;

import java.io.PrintWriter;

import org.eclipse.core.runtime.IProgressMonitor;

import com.ibm.cic.agent.core.api.IInvokeContext;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.docs.im.installer.common.util.Constants;

public class PostInstall
{
  ILogger logger = IMLogger.getLogger(getClass().getCanonicalName());  
 
  public void run(IInvokeContext context, String[] args, PrintWriter writer, IProgressMonitor monitor) throws Exception
  {
    IProfile profile = context.getProfile();
    profile.setOfferingUserData(Constants.DEPLOY_TYPE, Constants.IM_DEPLOYMENT_TYPE_UNINSTALL, Constants.OFFERING_ID);
  }
}
