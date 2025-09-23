package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.docs.viewer.automation.util.ViewType;

public class ConversionTest
{
  private static ViewerClient vClient = null;

  private static String sampleDir;

  private static String repositoryId;

  private static Logger logger = Logger.getLogger(ConversionTest.class.getName());

  private static boolean htmlTest;

  @BeforeClass
  public static void setup()
  {
    vClient = ViewerClient.getInstance();
    try
    {
      vClient.login();
      htmlTest = ServerConfigHelper.getInstance().isHTMLView();
      sampleDir = ViewerAutomationConfig.getConfig().getSampleBase();
      repositoryId = ViewerClient.getRepositoryId();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
    }
  }

  private void doTest(String fileName)
  {
    try
    {
      File f = new File(sampleDir + "/" + fileName);
      if (f.exists())
      {
        String ext = f.getName().substring(f.getName().lastIndexOf(".") + 1);

        boolean useHTMLClient = htmlTest && !ext.equalsIgnoreCase("pdf");

        logger.info(useHTMLClient ? "Using Html view client." : "Using image view client.");

        String id = vClient.uploadDocument(sampleDir + "/" + fileName);

        Map<String, String> r = vClient.openViewPage(id, repositoryId, useHTMLClient ? ViewType.HTML : ViewType.IMAGE);
        boolean b = vClient.queryStatus(id, r.get("jobId"), r.get("version"), repositoryId, useHTMLClient, null);
        assertEquals("", b, true);
      }
      else
      {
        logger.warning("Can't find file: " + f.getAbsolutePath());
        fail();
      }
    }
    catch (Exception e)
    {
      fail();
    }
  }

  @Test
  public void testDOC()
  {
    try
    {
      doTest("sample.doc");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testPPT()
  {
    try
    {
      doTest("sample.ppt");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testXLS()
  {
    try
    {
      doTest("sample.xls");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testDOCX()
  {
    try
    {
      doTest("sample.docx");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testPPTX()
  {
    try
    {
      doTest("sample.pptx");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testXLSX()
  {
    try
    {
      doTest("sample.xlsx");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testODT()
  {
    try
    {
      doTest("sample.odt");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testODS()
  {
    try
    {
      doTest("sample.ods");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testODP()
  {
    try
    {
      doTest("sample.odp");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testPDF()
  {
    try
    {
      doTest("sample.pdf");
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @AfterClass
  public static void shutDown()
  {
    // if (vClient != null)
    // {
    // vClient.logout();
    // }
  }
}
