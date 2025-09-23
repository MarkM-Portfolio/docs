package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.File;
import java.util.Map;
import java.util.logging.Logger;

import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.util.ViewType;
import com.ibm.json.java.JSONObject;

public class HTMLSnapshotTest extends ImageThumbnailServiceTest
{
  private static Logger logger = Logger.getLogger(HTMLSnapshotTest.class.getName());

  protected void viewFile(String fileId)
  {
    viewFile(fileId, ViewType.HTML);
  }

  protected String uploadFile(String fileName)
  {
    try
    {
      File f = new File(sampleDir + "/" + fileName);
      if (f.exists())
      {
        String fileId = vClient.uploadDocument(sampleDir + "/" + fileName);
        logger.info("Upload a new file. fileId = " + fileId);
        boolean res = vClient.queryThumbnailsCacheStatus(repositoryId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
        assertEquals("Thumbnails were generated during upload conversion.", true, res);
        return fileId;
      }
      else
      {
        logger.warning("Can't find file: " + f.getAbsolutePath());
        fail();
      }
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
    return null;
  }

  protected void viewFile(String fileId, ViewType type)
  {
    try
    {
      Map<String, String> r = vClient.openViewPage(fileId, repositoryId, type);
      boolean isHTML = true;
      if (type == ViewType.IMAGE)
      {
        isHTML = false;
      }
      String jobId = r.get("jobId");
      if (!jobId.equals("null"))
      {
        boolean b = vClient.queryStatus(fileId, jobId, r.get("version"), repositoryId, isHTML, null);
        assertEquals("View action is done successfully.", b, true);
      }
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testUploadConversion()
  {
    uploadFile("sample.doc");
  }

  @Test
  public void testViewByIE8()
  {
    String fileId = uploadFile("sample.doc");
    viewFileByIE8(fileId);
  }

  @Test
  public void testUploadPDF()
  {
    String fileId = super.uploadFile("sample.pdf");
    try
    {
      boolean res = vClient.queryThumbSrvConversionStatus(repositoryId, fileId, 0, DEFAULT_RETRY_INTERVAL);
      assertEquals("One-page thumbnail conversion were excuted successfully.", res, false);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testSnapshotGeneration()
  {

    File f = new File(sampleDir + "/" + "sample.doc");
    if (!f.exists())
    {
      logger.warning("Can't find file: " + f.getAbsolutePath());
      fail();
    }
    try
    {
      String fileId = vClient.uploadDocument(sampleDir + "/" + "sample.doc");
      logger.info("Upload a new file. fileId = " + fileId);
      viewFile(fileId);
      boolean res = vClient.querySnapshotStatus(repositoryId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
      assertEquals("Snapshot were generated successfully.", res, true);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testViewWithoutCache()
  {
    String fileId = uploadFile("sample.doc");
    try
    {
      deleteThumbnails(fileId);

      viewFile(fileId);

      boolean res = vClient.queryThumbnailsCacheStatus(repositoryId, fileId, 0, DEFAULT_RETRY_INTERVAL);
      assertEquals("Thumbnails were generated successfully.", res, true);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testGenerateThumbnailWithoutCache()
  {
    String fileId = uploadFile("sample.doc");
    try
    {
      deleteThumbnails(fileId);

      createThumbnails(fileId);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Test
  public void testMoveFileToTrash()
  {
    super.testMoveFileToTrash();
  }

  @Override
  public void testGenerateThumbnailOnValidCache()
  {
    return;
  }

  @Test
  public void testViewOnValidCache()
  {
    return;
  }

  @Override
  public void testViewOnUploadCache()
  {
    return;
  }

  @Override
  public void testGenerateThumbnailOnUploadCache()
  {
    return;
  }

}
