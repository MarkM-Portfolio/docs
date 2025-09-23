package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.fail;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;

public class LocalThumbnailGen
{
  private static ViewerClient vClient = null;
  private static Logger logger = Logger.getLogger(LocalThumbnailGen.class.getName());
  private static String sampleDir;
  
  @BeforeClass
  public static void setup()
  {
    vClient = ViewerClient.getInstance();
    try
    {
      vClient.login();
      sampleDir = ViewerAutomationConfig.getConfig().getSampleBase();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
    }
  }
  
  @Test
  public void doTest()
  {
    File f = new File(sampleDir + "/" + "sample.ppt");
    try
    {
      vClient.uploadDocument(f.getAbsolutePath());
    }
    catch (Exception e)
    {
      fail();
    }
  }
}
