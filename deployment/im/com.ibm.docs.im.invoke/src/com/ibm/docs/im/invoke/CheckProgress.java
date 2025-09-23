/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2015.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */

package com.ibm.docs.im.invoke;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.osgi.util.NLS;

import com.ibm.cic.agent.core.api.IInvokeContext;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.docs.im.installer.common.util.Constants;

public class CheckProgress
{
  ILogger logger = IMLogger.getLogger(getClass().getCanonicalName());  
  
  public String getIMMessage(String log_message)
  {
    int start = log_message.indexOf(Constants.IM_LOG_PREFIX);
    if (start == -1)
      return null;
    start += Constants.IM_LOG_PREFIX.length();
    //return MsgMap.getCMDMsg(log_message.substring(start).trim());
    return log_message.substring(start).trim();
  }
  
  public void writeScriptLogIntoIM(List<String> aLL_logs, PrintWriter writer)
  {
	  	  
  }

  public void run(IInvokeContext context, String[] args, PrintWriter writer, IProgressMonitor monitor) throws Exception
  {
    IProfile profile = context.getProfile();
    String component = args[0];
    String shortComponent = component.substring(3);
    String installLocation = profile.getInstallLocation();
    
    String deployType = profile.getOfferingUserData(Constants.DEPLOY_TYPE, Constants.OFFERING_ID);
    String callFrom = profile.getUserData(Constants.CALL_FROM);
    String offeringVersion = profile.getOfferingUserData(Constants.OFFERING_VERSION, Constants.OFFERING_ID);
    String upgradeRecordFilePath = installLocation + Constants.UPGRADE_RECORDS_NAME + offeringVersion;
    String cancelMarkerPath = installLocation + "/imcanceled";
    String logToMonitor = profile.getUserData(Constants.LOG_FILE_TO_MONITOR);
    
    if (deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE))
    {
      if (callFrom.equalsIgnoreCase("uninstall")) // skip uninstall during update phase
      {
        return;
      }
      
      if( Utils.shouldSkipUpgrade(upgradeRecordFilePath, shortComponent) )
      {
        return;
      }
    }
    int notified_log_count = 0;
    String warnings = "";    
    while (true)
    {
      FileReader fr = null;
      BufferedReader br = null;
      try
      {        
        fr = new FileReader(logToMonitor);
        br = new BufferedReader(fr);
        String s;
        List<String> IM_logs = new ArrayList<String>();
        List<String> ALL_logs = new ArrayList<String>();

        // collect im log into a list
        while ((s = br.readLine()) != null)
        {
          ALL_logs.add(s);
          if (s.contains(Constants.IM_LOG_PREFIX))
          { 
            if(s.contains(Constants.IM_WARNING_LOG_PREFIX))
            {
              warnings += s + "\n";
            }
            else
            {
              IM_logs.add(s);
            }
          }
        }
        profile.setUserData(Constants.WARNING_STRINGS, warnings);        
        int log_count = IM_logs.size();
        
        // check is the process end
        if (log_count > 0 && IM_logs.get(log_count - 1).contains(Constants.IM_LOG_PREFIX + "END"))
        {
          writeScriptLogIntoIM(ALL_logs, writer);
          if (deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE) && callFrom.equalsIgnoreCase("install"))
          {
            Utils.setUpgradeRecords(upgradeRecordFilePath, shortComponent, "true");
          }
          String allInOneWarning = profile.getUserData(Constants.WARNING_STRINGS);
          if( allInOneWarning != null  && ! allInOneWarning.isEmpty())
          {
            List<String> ws = new ArrayList<String>(Arrays.asList(allInOneWarning.split("\n")));
            for (String w : ws)
            {
              logger.warning(getIMMessage(w).substring(8));              
            }
          }
          break;
        }

        if (log_count > 0 && IM_logs.get(log_count - 1).contains(Constants.IM_LOG_PREFIX + "FAILED"))
        {
          IStatus status = ScriptReport.getErrorStatus(context, shortComponent, logToMonitor, IM_logs);  
          if(deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_INSTALL))
          {
            profile.setUserData(Constants.FAILED_COMPONENT, shortComponent);
          }
          throw new CoreException(status);
        }

        // notify new im log
        for (int i = notified_log_count; i < log_count; i++)
        {
          monitor.setTaskName(translateCMD(IM_logs.get(i), shortComponent, profile, callFrom));
        }
        notified_log_count = log_count;
       
        Thread.sleep(1000);
        
        // make sure there is something to show during waiting time.
        if (!IM_logs.isEmpty())
        {
          monitor.setTaskName(translateCMD(IM_logs.get(log_count - 1), shortComponent, profile, callFrom));
        }
        
        if( monitor.isCanceled() )
        {
        	File maker = new File(cancelMarkerPath);        	 
        	maker.createNewFile();        	
        }

        Thread.sleep(1000);
      }
      finally
      {
        Utils.closeResource(fr, null);
        Utils.closeResource(br, null);
      }
      
    }    
    monitor.worked(200);
  }
  
  public String translateCMD(String cmd, String comp, IProfile profile, String callFrom)
  {
    if (cmd==null || comp==null || profile==null)
      return null;
    
    String translatedCMD = null;
    String cmdID = getIMMessage(cmd);
    String[] cmds = cmdID.split(" ");
    if (cmds.length > 1 && cmds[0].equalsIgnoreCase("Rollback"))            
      translatedCMD = NLS.bind(MsgMap.getCMDMsg(cmds[1],Constants.IM_DEPLOYMENT_TYPE_ROLLBACK, callFrom), comp);
    else
      translatedCMD = NLS.bind(MsgMap.getCMDMsg(cmdID,profile.getOfferingUserData(Constants.DEPLOY_TYPE, Constants.OFFERING_ID), callFrom), comp);
    
    return translatedCMD;
  }
}
