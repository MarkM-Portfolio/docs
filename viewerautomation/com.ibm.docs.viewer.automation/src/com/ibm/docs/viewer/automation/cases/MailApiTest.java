package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Iterator;
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
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig.SC_CASES;
import com.ibm.docs.viewer.automation.util.ViewType;
import com.ibm.json.java.JSONObject;

public class MailApiTest
{
  private static ViewerClient vClient = null;

  private static String sampleDir;

  private static String mailRepoId = "mail";

  private static String fileLinkRepoId = "vsfiles";

  private static String filesRepoId = "lcfiles";

  private static Logger logger = Logger.getLogger(ConversionTest.class.getName());

  private static boolean htmlTest;

  private static HashMap<String, String> fileIds = new HashMap<String, String>();

  private static boolean isUserentitled;

  private static boolean fileViewerEnabled;

  protected static final int DEFAULT_RETRY_INTERVAL = 1000;

  protected static final int DEFAULT_RETRY = 150;

  @BeforeClass
  public static void setup()
  {
    vClient = ViewerClient.getInstance();
    try
    {
      vClient.login();
      if (ViewerAutomationConfig.getConfig().getProxyEnabled())
      {
        htmlTest = ServerConfigHelper.getInstance().isHTMLView();
      }
      else
      {
        htmlTest = ViewerAutomationConfig.getConfig().getHTMLView();
        isUserentitled = ViewerClient.getInstance().getCurrentUser().isEntitled();
        fileViewerEnabled = ViewerAutomationConfig.getConfig().getFileViewerEnabled();
      }
      sampleDir = ViewerAutomationConfig.getConfig().getSampleBase();
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
    }
  }

  private void postAttachment(String fileName, String uuid)
  {
    try
    {
      File f = new File(sampleDir + "/" + fileName);
      if (f.exists())
      {
        vClient.postMailAttachment(sampleDir + "/" + fileName, uuid);
      }
      else
      {
        logger.warning("Can't find file: " + f.getAbsolutePath());
        fail();
      }
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  private void viewAttachment(String url, String title)
  {
    try
    {
      if (url != null && url != "")
      {
        boolean forceImageView = ViewerAutomationConfig.getConfig().isExcluded(title);
        boolean htmlView = htmlTest && (!forceImageView);
        String id = url.substring(url.indexOf(mailRepoId) + mailRepoId.length() + 1, url.lastIndexOf("/content"));
        String[] params = null;
        if (url.contains("?"))
        {
          String temp = url.substring(url.indexOf("?") + 1, url.length());
          params = temp.split("&");
        }
        logger.info(htmlView ? "Using Html view client." : "Using image view client.");

        Map<String, String> r = vClient.openViewPage(id, mailRepoId, params, htmlView ? ViewType.HTML : ViewType.IMAGE);
        String jobId = r.get("jobId");
        if (jobId != null && !jobId.equals("null"))
        {
          boolean b = vClient.queryStatus(id, r.get("jobId"), r.get("version"), mailRepoId, htmlView, null);
          assertEquals("", b, true);
        }
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

  @Test
  public void testSnoop() // try to detect the available nodes, must be the first test case
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.SNOOP) || !vClient.getCurrentUser().isEnabled(SC_CASES.SNOOP))
    {
      logger.log(Level.INFO, "testSnoop is ignored.");
      return;
    }

    try
    {
      String node_list_str = "";
      // query
      int repeat = ViewerAutomationConfig.getConfig().getSnoopRepeatNum();
      for (int i = 0; i <= repeat; i++)
      {
        String uuid = UUID.randomUUID().toString();
        uuid = generateFileID(uuid);
        JSONObject res = vClient.SnoopTest(uuid);
        String host = null;
        if (res != null)
        {
          host = (String) res.get("host");
        }
        if (host != null && !fileIds.containsKey(host))
        {
          fileIds.put(host, uuid);
          if (node_list_str.length() > 0)
            node_list_str += ",\n";
          node_list_str += "  " + host + ";   build stamp:" + (String) res.get("timestamp") + "; datadir: "
              + (String) res.get("shareddatadir");
        }
        if (host == null)
        {
          logger.warning("Failed getting hostname by snoop rest api with file id " + uuid);
          fail();
        }
        try
        { // sleep for 0.1s between interval
          Thread.sleep(100);
        }
        catch (InterruptedException ie)
        {
        }
      }
      logger.info("Snooped by repeating " + repeat + " times, got " + fileIds.size() + " nodes: \n" + node_list_str);

      // check sanity results
      for (String host : fileIds.keySet())
      {
        String fileId = fileIds.get(host);
        String res = vClient.getSanityResult(fileId);
        logger.log(Level.INFO, host + "\n" + res);
      }
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  // @Test
  // public void testSupportFileFormats()
  // {
  //
  // JSONObject types = new JSONObject();
  // types.put("application/vnd.oasis.opendocument.text", "odt");
  // types.put("application/vnd.ms-excel", "xls");
  // types.put("application/vnd.oasis.opendocument.spreadsheet", "ods");
  // types.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
  // types.put("application/msword", "doc");
  // types.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx");
  // types.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");
  // types.put("application/vnd.oasis.opendocument.presentation", "odp");
  // types.put("application/pdf", "pdf");
  // types.put("application/vnd.ms-powerpoint", "ppt");
  //
  // try
  // {
  // JSONObject supportedTypes = vClient.getSupportedFileFormats();
  // boolean equals = supportedTypes.equals(types);
  // assertEquals("", equals, true);
  // }
  // catch (Exception e)
  // {
  // logger.log(Level.WARNING, "Can not get supported file formats", e);
  // fail();
  // }
  // }

  @Test
  public void testViewAttchmentDOC()
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_DOC)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_DOC))
    {
      logger.log(Level.INFO, "testViewAttchmentDOC is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.doc";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_PPT)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_PPT))
    {
      logger.log(Level.INFO, "testViewAttchmentPPT is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.ppt";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_XLS)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_XLS))
    {
      logger.log(Level.INFO, "testViewAttchmentXLS is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.xls";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_DOCX)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_DOCX))
    {
      logger.log(Level.INFO, "testViewAttchmentDOCX is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.docx";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_PPTX)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_PPTX))
    {
      logger.log(Level.INFO, "testViewAttchmentPPTX is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.pptx";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_XLSX)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_XLSX))
    {
      logger.log(Level.INFO, "testViewAttchmentXLSX is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.xlsx";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_ODT)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_ODT))
    {
      logger.log(Level.INFO, "testViewAttchmentODT is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.odt";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_ODS)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_ODS))
    {
      logger.log(Level.INFO, "testViewAttchmentODS is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.ods";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_ODP)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_ODP))
    {
      logger.log(Level.INFO, "testViewAttchmentODP is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.odp";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
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
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_ATTACH_PDF)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_ATTACH_PDF))
    {
      logger.log(Level.INFO, "testViewAttchmentPDF is ignored.");
      return;
    }

    try
    {
      // query
      String fileName = "sample.pdf";
      String uuid = UUID.randomUUID().toString();
      uuid = generateFileID(uuid);
      JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
      String statusCode = (String) res.get("responseCode");
      String url = (String) res.get("url");
      assertEquals("201", statusCode);
      logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
      // upload
      postAttachment(fileName, uuid);
      // view
      viewAttachment(url, fileName);
    }
    catch (Exception e)
    {
      logger.warning("Exception: " + e);
      fail();
    }
  }

  @Test
  public void testThumbnailsGenerationOnUpload()
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.THUMBNAILS_ON_UPLOAD)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.THUMBNAILS_ON_UPLOAD))
    {
      logger.log(Level.INFO, "testThumbnailsGenerationOnUpload is ignored.");
      return;
    }

    if (!fileViewerEnabled)
    {
      return;
    }

    File f = new File(sampleDir + "/" + "sample.docx");
    try
    {
      String fileId = vClient.uploadDocument(f.getAbsolutePath());
      logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);

      boolean res = vClient.queryThumbnailsCacheStatus(filesRepoId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
      assertEquals("Thumbnails were generated during upload conversion.", true, res);

    }
    catch (Exception e)
    {
      fail();
    }
  }

  @Test
  public void testViewFileLinkInVerse()
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_FILELINK_IN_VERSE)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_FILELINK_IN_VERSE))
    {
      logger.log(Level.INFO, "testViewFileLinkInVerse is ignored.");
      return;
    }

    File f = new File(sampleDir + "/" + "test.docx");
    try
    {
      String fileId = vClient.uploadDocument(f.getAbsolutePath());
      logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);

      String repoId = fileLinkRepoId;
      Map<String, String> r = vClient.openViewPage(fileId, repoId, htmlTest ? ViewType.HTML : ViewType.IMAGE);
      boolean b = vClient.queryStatus(fileId, r.get("jobId"), r.get("version"), repoId, htmlTest, null);
      assertEquals("View document successfully.", b, true);

      if (htmlTest)
      {
        boolean c = vClient.querySnapshotStatus(repoId, fileId, 0, DEFAULT_RETRY_INTERVAL);
        assertEquals("Check snapshot generation for vsfiles.", false, c);
      }
    }
    catch (Exception e)
    {
      fail();
    }
  }

  @Test
  public void testViewFiles()
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VIEW_FILES) || !vClient.getCurrentUser().isEnabled(SC_CASES.VIEW_FILES))
    {
      logger.log(Level.INFO, "testViewFiles is ignored.");
      return;
    }

    if (!fileViewerEnabled)
    {
      return;
    }

    File f = new File(sampleDir + "/" + "sample.docx");
    try
    {
      String fileId = vClient.uploadDocument(f.getAbsolutePath());
      logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);

      String repoId = filesRepoId;
      Map<String, String> r = vClient.openViewPage(fileId, repoId, htmlTest ? ViewType.HTML : ViewType.IMAGE);
      boolean b = vClient.queryStatus(fileId, r.get("jobId"), r.get("version"), repoId, htmlTest, null);
      assertEquals("View document successfully.", b, true);

      if (htmlTest)
      {
        boolean c = vClient.querySnapshotStatus(repoId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
        assertEquals("Check snapshot generation for lcfiles.", isUserentitled, c);
      }
    }
    catch (Exception e)
    {
      fail();
    }
  }

  @Test
  public void testVerseCallFlow()
  {
    if (!ViewerAutomationConfig.getConfig().isEnabled(SC_CASES.VERSE_CALLFLOW)
        || !vClient.getCurrentUser().isEnabled(SC_CASES.VERSE_CALLFLOW))
    {
      logger.log(Level.INFO, "testVerseCallFlow is ignored.");
      return;
    }

    try
    {
      if (fileIds.size() <= 0)
      {
        String uuid = UUID.randomUUID().toString();
        uuid = generateFileID(uuid);
        fileIds.put("NONE", uuid);
      }
      String fileName = "sample.docx";
      Iterator<Map.Entry<String, String>> iter = fileIds.entrySet().iterator();
      while (iter.hasNext())
      {
        Map.Entry<String, String> entry = (Map.Entry<String, String>) iter.next();
        String uuid = entry.getValue();
        if (!entry.getKey().equals("NONE"))
        {
          logger.info(" ## Testing call flow on node " + entry.getKey() + " with file id " + entry.getValue() + ". ##");
        }
        JSONObject res = vClient.mailAttachmentExists(fileName, uuid);
        String statusCode = (String) res.get("responseCode");
        String url = (String) res.get("url");
        if (statusCode != null && statusCode.equals("201"))
        {
          logger.info(fileName + " doesn't exist. We need upload it. View url is : " + url);
          postAttachment(fileName, uuid);
          viewAttachment(url, fileName);
          res = vClient.mailAttachmentExists(fileName, uuid);
          statusCode = (String) res.get("responseCode");
          assertEquals("409", statusCode);
        }
        else if (statusCode != null && statusCode.equals("409"))
        {
          logger.info("Find the file - " + fileName + ". View url is : " + url);
          viewAttachment(url, fileName);
        }
        else if (statusCode != null && statusCode.equals("423"))
        {
          logger.info("ACL is locked by another user. Resend request may resolve this issue.");
        }
        else
        {
          fail();
          logger.warning("Get docx html view failure. Unexpected status code: " + statusCode);
        }

        //
        // FIXME: Cannot pass on Smartcloud. The port cannot be recognized.
        //
        // url = url.substring(0, url.lastIndexOf("/")) + "/pictures/image.png";
        // boolean exists;
        //
        // exists = vClient.openPdfPictures(url);
        // if (!exists)
        // fail();
        // logger.info("Get PDF image sucessfully,url:  " + url);
      }
    }
    catch (Exception e)
    {
      fail();
      logger.warning("Get docx html view failure. Exception: " + e);
    }
  }

  @AfterClass
  public static void shutDown()
  {
    if (vClient != null)
    {
      vClient.logout();
    }
  }

  private String generateFileID(String docUri)
  {
    String id = null;
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(docUri.getBytes());
      id = new BigInteger(rawMD5).abs().toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      logger.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
      throw new IllegalArgumentException(e);
    }

    return id;
  }
}
