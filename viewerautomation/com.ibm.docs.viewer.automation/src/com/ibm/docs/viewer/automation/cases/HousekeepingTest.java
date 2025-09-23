package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.json.java.JSONObject;

public class HousekeepingTest
{
  private static ViewerClient vClient = null;
  
  private static String sampleDir;

  private static String repositoryId;

  private static Logger logger = Logger.getLogger(ConversionTest.class.getName());

  @BeforeClass
  public static void setup()
  {
    vClient = ViewerClient.getInstance();
    try
    {
      vClient.login();
      sampleDir = ViewerAutomationConfig.getConfig().getSampleBase();
      repositoryId = ViewerClient.getRepositoryId();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
    }
  }
  
  @Test
  public void doTest()
  {
    try
    {
      File f = new File(sampleDir, "sample.pptx");
      String id = vClient.uploadDocument(f.getAbsolutePath());
      JSONObject status = vClient.getCacheStatus(id, repositoryId);
      assertEquals(status.get("uploadConverting"), "true");
      
      vClient.uploadNewVersion(id, f);
      // make sure the earlier version is cleaner
      // add the file detection part to proxy
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      fail();
    }
  }

}
