package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.docs.viewer.automation.util.ViewType;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author wangyixin
 * 
 */
public class INotesApiTest
{
  private static ViewerClient vClient = null;

  private static String sampleDir;

  private static String repositoryId = "tempstorage";

  private static Logger logger = Logger.getLogger(ConversionTest.class.getName());

  private static boolean htmlTest;;

  @BeforeClass
  public static void setup()
  {
    vClient = ViewerClient.getInstance();
    try
    {
      vClient.login();
      htmlTest = ServerConfigHelper.getInstance().isHTMLView();
      sampleDir = ViewerAutomationConfig.getConfig().getSampleBase();
      // repositoryId = ViewerClient.getRepositoryId();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
    }
  }

  private String postAttachment(String fileName, String uuid)
  {
    try
    {
      File f = new File(sampleDir + "/" + fileName);
      if (f.exists())
      {
        JSONObject attachmentUrl = vClient.postAttachment(sampleDir + "/" + fileName, uuid);
        String url = (String) attachmentUrl.get("url");
        if (url != null && !url.equals(""))
        {
          logger.info("Post File successfully and File url is : " + url);
          return url;
        }
        else
        {
          logger.warning("error message: " + (String) attachmentUrl.get("error_msg"));
          fail();
          return null;
        }
      }
      else
      {
        logger.warning("Can't find file: " + f.getAbsolutePath());
        fail();
        return null;
      }
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
      return null;
    }
  }

  private void viewAttachment(String url)
  {
    viewAttachment(url, true);
  }

  private void viewAttachment(String url, boolean htmlType)
  {
    try
    {
      if (url != null && url != "")
      {
        String id = url.substring(url.indexOf(repositoryId) + repositoryId.length() + 1, url.lastIndexOf("/"));

        logger.info(htmlTest && htmlType ? "Using Html view client." : "Using image view client.");

        Map<String, String> r = vClient.openViewPage(id, repositoryId, (htmlTest && htmlType) ? ViewType.HTML : ViewType.IMAGE);
        boolean b = vClient.queryStatus(id, r.get("jobId"), r.get("version"), repositoryId, htmlTest && htmlType, null);
        assertEquals("", b, true);
      }
      else
      {
        fail();
      }
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  private String queryAttachment(String fileName, String uuid)
  {
    try
    {
      JSONObject res = vClient.attachmentExists(uuid);
      if (res.get("responseCode") != null && res.get("responseCode").equals("404"))
      {
        logger.info("responseCode is " + res.get("responseCode") + "." + fileName + " doesn't exist. We need upload it");
        return null;
      }
      else if (res.get("url") != null)
      {
        logger.info("Find the file and file url is : " + res.get("url"));
        return (String) res.get("url");
      }
      else
      {
        fail();
        return null;
      }
    }
    catch (Exception e)
    {
      fail();
      return null;
    }
  }

  @Test
  public void testSupportFileFormats()
  {

    JSONObject types = new JSONObject();
    types.put("application/vnd.oasis.opendocument.text", "odt");
    types.put("application/vnd.ms-excel", "xls");
    types.put("application/vnd.oasis.opendocument.spreadsheet", "ods");
    types.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
    types.put("application/msword", "doc");
    types.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx");
    types.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");
    types.put("application/vnd.oasis.opendocument.presentation", "odp");
    types.put("application/pdf", "pdf");
    types.put("application/vnd.ms-powerpoint", "ppt");

    try
    {
      JSONObject supportedTypes = vClient.getSupportedFileFormats();
      boolean equals = supportedTypes.equals(types);
      assertEquals("", equals, true);
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Can not get supported file formats", e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentDOC()
  {
    try
    {
      String url = postAttachment("sample.doc", UUID.randomUUID().toString());
      viewAttachment(url, false);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentPPT()
  {
    try
    {
      String url = postAttachment("sample.ppt", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentXLS()
  {
    try
    {
      String url = postAttachment("sample.xls", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentDOCX()
  {
    try
    {
      String url = postAttachment("sample.docx", UUID.randomUUID().toString());
      viewAttachment(url, false);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentPPTX()
  {
    try
    {
      String url = postAttachment("sample.pptx", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentXLSX()
  {
    try
    {
      String url = postAttachment("sample.xlsx", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentODT()
  {
    try
    {
      String url = postAttachment("sample.odt", UUID.randomUUID().toString());
      viewAttachment(url, false);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentODS()
  {
    try
    {
      String url = postAttachment("sample.ods", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentODP()
  {
    try
    {
      String url = postAttachment("sample.odp", UUID.randomUUID().toString());
      viewAttachment(url);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewAttchmentPDF()
  {
    try
    {
      String url = postAttachment("sample.pdf", UUID.randomUUID().toString());
      viewAttachment(url, false);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testQueryAttachment()
  {
    try
    {
      String fileName = "sample.pdf";
      String uuid = UUID.randomUUID().toString();
      String url = queryAttachment(fileName, uuid);
      if (url == null || url.equals("")) // attachment doesn't exists
      {
        url = postAttachment(fileName, uuid);
        viewAttachment(url, false);
        url = queryAttachment(fileName, uuid);
        if (url == null || url.equals(""))
          fail();
      }
      else
      {
        fail();
      }

      url = url.substring(0, url.lastIndexOf("/")) + "/pictures/image.png";
      boolean exists;

      exists = vClient.openPdfPictures(url);
      if (!exists)
        fail();
      logger.info("Get PDF image sucessfully,url:  " + url);
    }
    catch (Exception e)
    {
      logger.warning("Get PDF image failure. Exception: " + e);
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
