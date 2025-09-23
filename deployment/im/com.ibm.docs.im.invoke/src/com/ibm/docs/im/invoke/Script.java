/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.invoke;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
import org.eclipse.core.runtime.Platform;

import com.ibm.cic.agent.core.api.IInvokeContext;
import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.cic.agent.core.api.IMStatuses;
import com.ibm.cic.agent.core.api.IProfile;
import com.ibm.cic.common.core.api.utils.EncryptionUtils;
import com.ibm.docs.im.installer.common.util.Constants;
import com.ibm.docs.im.invoke.internal.Messages;

public class Script
{
  ILogger logger = IMLogger.getLogger(getClass().getCanonicalName());

  public void run(IInvokeContext context, String[] args, PrintWriter writer, IProgressMonitor monitor) throws Exception
  {
    logger.info("Start to monitor log file, call from: " + args[1] + " component: " + args[0]);
    IProfile profile = context.getProfile();

    String component = args[0];
    String shortComponent = component.substring(3);
    String callFrom = args[1];

    String installLocation = profile.getInstallLocation();
    String wasUser = profile.getOfferingUserData(Constants.WASADMIN, Constants.OFFERING_ID);
    String wasPassword = profile.getOfferingUserData(Constants.PASSWORD_OF_WASADMIN, Constants.OFFERING_ID);

    String deployType = profile.getOfferingUserData(Constants.DEPLOY_TYPE, Constants.OFFERING_ID);
    String offeringVersion = profile.getOfferingUserData(Constants.OFFERING_VERSION, Constants.OFFERING_ID);
    String upgradeRecordFilePath = installLocation + Constants.UPGRADE_RECORDS_NAME + offeringVersion;

    String scriptLocation = installLocation + "/" + shortComponent + "Installer/installer";
    String binLocation = installLocation + "/" + shortComponent;

    // create the time stamp parameter
    DateFormat df = new SimpleDateFormat("yyyyMMdd_HHmmss");
    String timestamp = df.format(new Date(System.currentTimeMillis()));
    logger.info("Install location: " + installLocation);
    logger.info("Script location: " + scriptLocation);


    profile.setUserData(Constants.CALL_FROM, callFrom);
    String commandLine = null;
    // upgrade
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

      commandLine = Utils.nameMap.get(component).get("upgradeCommand");
    }
    // uninstall
    else if (deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UNINSTALL))
    {
      commandLine = Utils.nameMap.get(component).get("uninstallCommand");
    }
    // install and uninstall
    else
    {
      if (callFrom.equalsIgnoreCase("uninstall"))
      {
        String failedComponent = profile.getUserData(Constants.FAILED_COMPONENT);
        if( failedComponent != null && failedComponent.equalsIgnoreCase(shortComponent) )
        {
          return;
        }
        commandLine = Utils.nameMap.get(component).get("uninstallCommand");
      }
      else
      {
        commandLine = Utils.nameMap.get(component).get("installCommand");
      }
    }
    List<String> params = new ArrayList<String>(Arrays.asList(commandLine.split("\\s+")));
    // add -installRoot for upgrade
    if (deployType.equalsIgnoreCase(Constants.IM_DEPLOYMENT_TYPE_UPDATE))
    {
      if (component.equalsIgnoreCase("IBMViewer") || component.equalsIgnoreCase("IBMViewerExt"))
      {
        params.add(binLocation + "/cfg.properties");
        params.add("../"); // build path
      }
      else
      {
        params.add("-installRoot");
        params.add(binLocation);
      }
    }

    // add was password and timestamp
    if (component.equalsIgnoreCase("IBMViewer") || component.equalsIgnoreCase("IBMViewerExt"))
    {
      params.add(wasUser);
      params.add(EncryptionUtils.decrypt(wasPassword));
      if (params.get(1).equalsIgnoreCase("viewer/install.py") || params.get(1).equalsIgnoreCase("viewer/upgrade.py") )
      {
        params.add("true");
        params.add("true");
      }
      else if(params.get(1).equalsIgnoreCase("icext/install.py") || params.get(1).equalsIgnoreCase("icext/upgrade.py") )
      {
        params.add("true");
      }

      params.add(timestamp);
    }
    else
    {
      params.add("-wasadminID");
      params.add(wasUser);

      params.add("-wasadminPW");
      params.add(EncryptionUtils.decrypt(wasPassword) );

      params.add("-time");
      params.add(timestamp);

      params.add("-im");
      params.add("true");

    }

    // db password for docs
    if (component.equalsIgnoreCase("IBMDocs") && (
		  params.get(1).equalsIgnoreCase("docs/install.py") ||
		  params.get(1).equalsIgnoreCase("docs/upgrade.py")
         )
	   )
    {
      String dbUser = profile.getOfferingUserData(Constants.DB_USER_NAME, Constants.OFFERING_ID);
      String dbPassword = profile.getOfferingUserData(Constants.DB_PASSWORD, Constants.OFFERING_ID);

      params.add("-dbadminID");
      params.add(dbUser);

      params.add("-dbadminPW");
      params.add(EncryptionUtils.decrypt(dbPassword) );
    }

    ProcessBuilder pb = new ProcessBuilder(params);

    // add installer directory into PYTHONPATH
    Map<String, String> env = pb.environment();
    if (Platform.OS_WIN32.equals(Platform.getOS()))
    {
      env.put("PYTHONPATH", String.format("%s;%s", env.get("PYTHONPATH"), scriptLocation));
    }
    else if (Platform.OS_LINUX.equals(Platform.getOS()))
    {
      env.put("PYTHONPATH", String.format("%s:%s", env.get("PYTHONPATH"), scriptLocation));
    }
    pythonversion();
    logger.info("Params: " + params);
    pb.directory(new File(scriptLocation));
    Process p = pb.start();

    //

    final StringBuffer stdErr = new StringBuffer();
    final BufferedReader brError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
    Thread errorReaderThread = startReaderThread(brError, stdErr);

    final StringBuffer stdOut = new StringBuffer();
    final BufferedReader brInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
    Thread outReaderThread = startReaderThread(brInput, stdOut);

    File python_process_info_marker = null;
    if (component.equalsIgnoreCase("IBMDocsProxy"))
    {
      python_process_info_marker = new File(String.format(binLocation + "/proxy/logs/python_process_info_%s_marker", timestamp));
    }
    else
    {
      python_process_info_marker = new File(String.format(binLocation + "/logs/python_process_info_%s_marker", timestamp));
    }
    // wait the marker, set timeout to 5 min
    int timeout = 300;
    while (!python_process_info_marker.exists())
    {
      if(timeout-- <= 0) break;
      Thread.sleep(1000);
      try
      {
        int exitValue = p.exitValue();
        logger.info("Exit value from python:"+exitValue);
        logger.info("Standard error from python:"+stdErr.toString());
        logger.info("Standard out from python:"+stdOut.toString());
        break;
      }
      catch (IllegalThreadStateException e)
      {

      }
    }

    // read python process info
    Properties info_props = new Properties();
    InputStream input = null;
    File checkExist = null;
    try
    {
      if (component.equalsIgnoreCase("IBMDocsProxy"))
      {

        checkExist = new File(String.format(binLocation + "/proxy/logs/python_process_info_%s", timestamp));
        if (checkExist==null || !checkExist.exists())
        {
          IStatus status = IMStatuses.ERROR.get(Messages.getString("Message_PythonProcessFailedAtStart$uuid"),
              Messages.getString("Message_PythonProcessFailedAtStart$explanation"), Messages.getString("Message_PythonProcessFailed$useraction"),
              1, Messages.getString("Message_PythonProcessFailedAtStart$msg"),new Object[] { shortComponent });
          throw new CoreException(status);
        }

        input = new FileInputStream(String.format(binLocation + "/proxy/logs/python_process_info_%s", timestamp));
        info_props.load(input);
        String logToMoniter = binLocation + "/proxy/logs/" + info_props.getProperty("log_file");
        profile.setUserData(Constants.LOG_FILE_TO_MONITOR, logToMoniter);
        logger.info("Start to monitor log file: " + logToMoniter);
      }
      else
      {
        checkExist = new File(String.format(binLocation + "/logs/python_process_info_%s", timestamp));
        if (checkExist==null || !checkExist.exists())
        {
          IStatus status = IMStatuses.ERROR.get(
              Messages.getString("Message_PythonProcessFailedAtStart$uuid"),
              Messages.getString("Message_PythonProcessFailedAtStart$explanation"),
              Messages.getString("Message_PythonProcessFailed$useraction"),
              1,
              Messages.getString("Message_PythonProcessFailedAtStart$msg"),new Object[] { shortComponent });
          throw new CoreException(status);
        }

        input = new FileInputStream(String.format(binLocation + "/logs/python_process_info_%s", timestamp));
        info_props.load(input);
        String logToMoniter = binLocation + "/logs/" + info_props.getProperty("log_file");
        profile.setUserData(Constants.LOG_FILE_TO_MONITOR, logToMoniter);
        logger.info("Start to monitor log file: " + logToMoniter);
      }

    }
    finally
    {
      Utils.closeResource(input, null);
      if( checkExist != null && checkExist.exists() )
      {
        checkExist.delete();
      }
      if( python_process_info_marker.exists() )
      {
        python_process_info_marker.delete();
      }
    }
    profile.setUserData(Constants.WARNING_STRINGS, "");
    monitor.worked(200);
  }

  /**
   * Starts a reader thread for reading the results from a process
   *
   * @param br
   *          BufferedReader to read from
   * @param buffer
   *          Buffer to read results into
   *
   * @return Thread Started reader thread
   */
  private static Thread startReaderThread(final BufferedReader br, final StringBuffer buffer)
  {
    Thread thread = new Thread()
    {
      @Override
      public void run()
      {
        String line;
        try
        {
          while ((line = br.readLine()) != null)
          {
            buffer.append(line).append("\n");
          }
        }
        catch (IOException e)
        {
          throw new Error(e);
        }
        finally
        {
        }
      }
    };

    thread.start();
    return thread;
  }
  public void pythonversion() {

      String s = null;

      try {

    // run the Unix "ps -ef" command
          // using the Runtime exec method:
          Process p = Runtime.getRuntime().exec("python --version");

          BufferedReader stdInput = new BufferedReader(new
               InputStreamReader(p.getInputStream()));

          BufferedReader stdError = new BufferedReader(new
               InputStreamReader(p.getErrorStream()));

          // read the output from the command
          logger.info("Here is the standard output of the command:\n");
          while ((s = stdInput.readLine()) != null) {
              logger.info(s);
          }

          // read any errors from the attempted command
          logger.info("Here is the standard error of the command (if any):\n");
          while ((s = stdError.readLine()) != null) {
              logger.info(s);
          }
        }
      catch (IOException e) {
          logger.info("exception happened - here's what I know: ");
          e.printStackTrace();
      }
  }
}
