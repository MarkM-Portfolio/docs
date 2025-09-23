package com.ibm.concord.viewer.services.rest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.WASConfigHelper;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.json.java.JSONObject;

public class SnoopHandler implements GetHandler
{
  private static Logger logger = Logger.getLogger(SnoopHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    StringBuffer sanityResults = new StringBuffer();
    boolean isSanity = Boolean.valueOf((String) request.getParameter("sanity"));
    if (isSanity)
    {
      File vsResult = new File("c:\\LotusLive\\Log\\vsanityResult.txt");
      if (vsResult.exists())
      {
        sanityResults.append(readFile(vsResult));
      }

      JSONObject res = getLockStatus();
      String enterKey = System.getProperty("line.separator");
      sanityResults.append("Viewer storage NFS lock check: ").append(res.get("status")).append(enterKey).append(res.get("message"));

      File csResult = new File("c:\\LotusLive\\Log\\csanityResult.txt");
      if (csResult.exists())
      {
        sanityResults.append(readFile(csResult));
      }
      response.getOutputStream().write(sanityResults.toString().getBytes());
    }
    else
    {
      String version = ViewerUtil.getBuildVersion();
      String timestamp = ViewerUtil.getBuildNumber();
      response.setHeader("Cache-Control", "no-cache");
      JSONObject retValue = new JSONObject();
      retValue.put("version", version);
      retValue.put("build_timestamp", timestamp);

      String host = null;
      try
      {
        InetAddress ia = InetAddress.getLocalHost();
        host = ia.getHostName();
      }
      catch (UnknownHostException e)
      {
        //
      }

      retValue.put("host", host);
      retValue.put("version", version);
      retValue.put("timestamp", timestamp);

      String sharedRoot = ViewerConfig.getInstance().getDataRoot(CacheType.LOCAL);
      File fSharedRoot = new File(sharedRoot);
      if (!fSharedRoot.exists())
      {
        retValue.put("shareddatadir", "null");
      }
      else
      {
        retValue.put("shareddatadir", sharedRoot);
      }

      response.setContentType("application/json");
      retValue.serialize(response.getOutputStream());
    }

  }

  private static StringBuffer readFile(File file)
  {
    StringBuffer sbf = new StringBuffer();
    BufferedReader reader = null;
    String line = null;
    try
    {
      reader = new BufferedReader(new FileReader(file));
      while ((line = reader.readLine()) != null)
      {
        sbf.append(line).append("\n");
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to read sanity result.", e);
    }
    finally
    {
      if (reader != null)
      {
        try
        {
          reader.close();
          reader = null;
        }
        catch (IOException e)
        {
          logger.log(Level.WARNING, "Failed to close file reader.", e);
        }
      }
    }
    return sbf;
  }

  private JSONObject getLockStatus()
  {
    JSONObject retValue = new JSONObject();
    String sharedDataRoot = WASConfigHelper.getCellVariable("VIEWER_SHARED_DATA_ROOT");
    if (sharedDataRoot == null)
    {
      retValue.put("status", "fail");
      retValue.put("message", "Unable to find the shared data root in Websphere variables.");
      return retValue;
    }
    File testFolder = null;
    File testFile = null;
    try
    {
      testFolder = new File(sharedDataRoot, String.valueOf(System.currentTimeMillis()));
      testFolder.mkdirs();
      testFile = new File(testFolder, "touchme" + System.currentTimeMillis());
      testFile.createNewFile();
      boolean firstTry = Job.isLockable(testFolder, testFile.getName());
      boolean secondTry = Job.isLockable(testFolder, testFile.getName());
      if(firstTry && secondTry)
      {
        retValue.put("status", "Ok");
        retValue.put("message", "Files in VIEWER_SHARED_DATA_ROOT can be locked successfully.");
      }
      else
      {
        retValue.put("status", "Fail");
        retValue.put("message", "Files in VIEWER_SHARED_DATA_ROOT can not be locked.");
      }
    }
    catch (IOException e)
    {
      retValue.put("status", "Fail");
      retValue.put("message", "Can not create lock file in VIEWER_SHARED_DATA_ROOT");
    }
    finally
    {
      if (testFile != null && testFile.exists())
      {
        testFile.delete();
      }
      if (testFolder != null && testFolder.exists())
      {
        testFolder.delete();
      }
    }
    return retValue;
  }
}
