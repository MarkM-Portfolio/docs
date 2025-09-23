package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.logging.Logger;

import org.junit.Test;

import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.util.ViewType;

public class HTMLThumbnailServiceTest extends ImageThumbnailServiceTest
{
  private static Logger logger = Logger.getLogger(HTMLThumbnailServiceTest.class.getName());

  protected void viewFile(String fileId)
  {
    viewFile(fileId, ViewType.HTML, null);
  }

  protected void viewFileByIE8(String fileId)
  {
    viewFile(fileId, ViewType.IMAGE, ViewerClient.MSIE8);
  }

  @Override
  public void testUploadConversion()
  {
    String fileId = uploadFile("sample.doc");
    try
    {
      boolean res = vClient.queryThumbnailsCacheStatus(repositoryId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
      assertEquals("One-page thumbnail conversion were not excuted.", res, true);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Override
  public void testViewWithoutCache()
  {
    String fileId = uploadFile("sample.doc");
    try
    {
      deleteThumbnails(fileId);

      viewFile(fileId);

      boolean res = vClient.queryThumbnailsCacheStatus(repositoryId, fileId, DEFAULT_RETRY, DEFAULT_RETRY_INTERVAL);
      assertEquals("Thumbnails were generated successfully.", res, true);
    }
    catch (Exception e)
    {
      logger.warning(" Exception: " + e);
      fail();
    }
  }

  @Override
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

  @Override
  public void testUploadPDF()
  {
    super.testUploadPDF();
  }

  @Override
  public void testMoveFileToTrash()
  {
    super.testMoveFileToTrash();
  }
  
  @Test
  public void testViewByIE8(){
    String fileId = uploadFile("sample.doc");
    viewFileByIE8(fileId);
  }
  

  @Override
  public void testViewOnUploadCache()
  {
    return;
  }

  @Override
  public void testViewOnValidCache()
  {
    return;
  }

  @Override
  public void testGenerateThumbnailOnUploadCache()
  {
    return;
  }

  @Override
  public void testGenerateThumbnailOnValidCache()
  {
    return;
  }
}
