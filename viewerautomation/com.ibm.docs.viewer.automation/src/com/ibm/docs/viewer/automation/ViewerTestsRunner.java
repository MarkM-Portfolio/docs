package com.ibm.docs.viewer.automation;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.LinkedList;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.runner.JUnitCore;

import com.ibm.docs.viewer.automation.cases.ConversionTest;
import com.ibm.docs.viewer.automation.cases.HTMLSnapshotTest;
import com.ibm.docs.viewer.automation.cases.HTMLThumbnailServiceTest;
import com.ibm.docs.viewer.automation.cases.INotesApiTest;
import com.ibm.docs.viewer.automation.cases.ImageThumbnailServiceTest;
import com.ibm.docs.viewer.automation.cases.MailApiTest;
import com.ibm.docs.viewer.automation.cases.MailApiTestMA;
import com.ibm.docs.viewer.automation.cases.UploadFileMA;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.docs.viewer.automation.util.LoggerUtil;
import com.ibm.json.java.JSONObject;

public class ViewerTestsRunner
{
  private static Logger logger = Logger.getLogger(ViewerTestsRunner.class.getName());

  /**
   * @param args
   */
  public static void main(String[] args)
  {
    Logger rootLogger = Logger.getLogger("");
    LoggerUtil.setLogingProperties(rootLogger);

    if (args.length < 3)
    {
      usage();
      System.exit(0);
    }

    // init configuration
    try
    {
      if (".".equals(args[0]))
      {
        logger.info("Using default configuration...");
        ViewerAutomationConfig.createDefault();
      }
      else
      {
        logger.info("Using custmoized configuration...");
        ViewerAutomationConfig.create(args[0]);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to init configuration!");
      System.exit(0);
    }
    String dir = args[1];
    File reportDir = new File(args[1]);
    if (reportDir.exists() && !reportDir.isDirectory())
    {
      logger.warning("Report directory is not a valid directory.");
      usage();
      System.exit(0);
    }
    else if (!reportDir.exists() && !reportDir.mkdirs())
    {
      logger.warning("Failed to create the directory for report.");
      System.exit(0);
    }
    
    String flag = args[2];
	if (flag.equals("''"))
		logger.warning("run test without MA config.");
	else {
		logger.warning(String.format("run test with MA config and flag value: %s", flag));
		UploadFileMA.setJsonDir(dir);
		MailApiTestMA.setJsonDir(dir);
		
	}


    // set log
    JUnitCore junitCore = new JUnitCore();
    ViewerTestsListener listener = new ViewerTestsListener(reportDir.getAbsolutePath());
    junitCore.addListener(listener);

    String version = "";
    try
    {
      if (!ViewerAutomationConfig.getConfig().getProxyEnabled())
      {
        LinkedList<User> users = ViewerAutomationConfig.getConfig().getUsers();
        for (User user : users)
        {
          try
          {
            if (flag.equals("''")){
            	ViewerClient.getInstance().login(user);
                version = ViewerClient.getInstance().getVersionInfo();
                logger.log(Level.INFO, "Tests is running on {0}", version);
                junitCore.run(MailApiTest.class);
                //junitCore.run(UploadConvert.class);
                ViewerClient.getInstance().logout();
            }
             else if(flag.equals("upload")){
            	ViewerClient.getInstance().login(user);
                version = ViewerClient.getInstance().getVersionInfo();
                logger.log(Level.INFO, "Tests is running on {0}", version);
                junitCore.run(UploadFileMA.class);
                ViewerClient.getInstance().logout();
            }
            else if(flag.equals("test")){
            	ViewerClient.getInstance().loginNoUserId(user);
                version = ViewerClient.getInstance().getVersionInfo();
                logger.log(Level.INFO, "Tests is running on {0}", version);
                junitCore.run(MailApiTestMA.class);
                ViewerClient.getInstance().logout();
            }
            else
            	logger.log(Level.SEVERE, "The input value is invalid. flag=" + flag);            
          }
          catch (Exception e)
          {
            logger.log(Level.INFO, "Exception ocurred due to {0}", e.getMessage());
          }
        }
      }
      else
      {
        ServerConfigHelper.getInstance().enableHTMLView(false, false);
        // junitCore.run(HousekeepingTest.class);
        junitCore.run(ConversionTest.class);
        junitCore.run(INotesApiTest.class);
        junitCore.run(ImageThumbnailServiceTest.class);

        ServerConfigHelper.getInstance().enableHTMLView(true, true);
        junitCore.run(ConversionTest.class);
        junitCore.run(INotesApiTest.class);
        junitCore.run(HTMLSnapshotTest.class);

        ServerConfigHelper.getInstance().enableHTMLView(true, false);
        junitCore.run(ConversionTest.class);
        junitCore.run(INotesApiTest.class);
        junitCore.run(HTMLThumbnailServiceTest.class);
      }

      logger.info("All tests done");

    }
    catch (Exception e)
    {
      logger.log(Level.INFO, "Exception ocurred due to {0}", e.getMessage());
    }
    finally
    {
      generateReport(version, reportDir.getAbsolutePath(), listener.getRunCount(), listener.getFailureCount(),
          listener.getRunTime());
    }

  }

  private static void generateReport(String version, String reportDir, int total, int fails, long time)
  {
    JSONObject summary = new JSONObject();
    summary.put("version", version);
    SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    summary.put("timestamp", sf.format(System.currentTimeMillis()));
    summary.put("total", total);

    summary.put("failure", fails);
    summary.put("time", String.valueOf(time / 1000) + " seconds");
    summary.put("succrate", 1.0 - (float) fails / (float) total);

    JSONObject json = new JSONObject();
    json.put("Summary", summary);

    File reportFile = new File(reportDir, "summary.json");
    
    try
    {
      FileOutputStream stream = new FileOutputStream(reportFile);
      json.serialize(stream);
    }
    catch (Exception exp)
    {
      exp.printStackTrace();
    }
  }

  private static void usage()
  {
    StringBuffer usage = new StringBuffer("Invalid inputs.  Usage: \n")
        .append("java -jar com.ibm.docs.viewer.automation.jar c:/automaton_config.json c:/automation_report_dir uploadORtestOR'' ");
    logger.warning(usage.toString());
    logger.warning("More: the last two args can be blank. ");
  }

}
