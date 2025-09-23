package com.ibm.docs.viewer.automation.cases;

import static org.junit.Assert.fail;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import com.ibm.docs.viewer.automation.ViewerClient;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig.SC_CASES;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class UploadFileMA
{
  private static ViewerClient vClient = null;

  private static String sampleDir;

  private static Logger logger = Logger.getLogger(ConversionTest.class.getName());

  private static boolean htmlTest;

  private static HashMap<String, String> fileIds = new HashMap<String, String>();

  private static boolean isUserentitled;

  private static boolean fileViewerEnabled;

  protected static final int DEFAULT_RETRY_INTERVAL = 1000;

  protected static final int DEFAULT_RETRY = 150;
  
	private static JSONArray idArray = new JSONArray();
	private static JSONObject jsonObject = new JSONObject();
	private static String userName = "";
	private static String userId = "";
	private static String jsonDir = "";

	public static String getJsonDir() {
		return jsonDir;
	}

	public static void setJsonDir(String jsonDir) {
		UploadFileMA.jsonDir = jsonDir;
	}

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
      userName = vClient.getCurrentUser().getId();
      userId = vClient.getUserId();
      jsonObject.put("user", userName);
      jsonObject.put("userId", userId);
     }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Can't init the test case.", e);
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
      
      if (fileId!=null){
    	  logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);
    	  JSONObject detail = new JSONObject();
    	  detail.put("tc", "testThumbnailsGenerationOnUpload");
          detail.put("fileId",fileId);
          idArray.add(detail);
      }else{
    	  logger.log(Level.INFO, "Uploaded file failed. ID={0}", fileId);
    	  fail();
      }
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
      if (fileId!=null){
    	  logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);
    	  JSONObject detail = new JSONObject();
    	  detail.put("tc", "testViewFileLinkInVerse");
          detail.put("fileId",fileId);
          idArray.add(detail);
      }else{
    	  logger.log(Level.INFO, "Uploaded file failed. ID={0}", fileId);
    	  fail();
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
      if (fileId!=null){
    	  logger.log(Level.INFO, "Uploaded file successfully. ID={0}", fileId);
    	  JSONObject detail = new JSONObject();
    	  detail.put("tc", "testViewFiles");
          detail.put("fileId",fileId);
          idArray.add(detail);
      }else{
    	  logger.log(Level.INFO, "Uploaded file failed. ID={0}", fileId);
    	  fail();
      }
    }
    catch (Exception e)
    {
      fail();
    }
  }

 

  @AfterClass
  public static void shutDown()
  {
	jsonObject.put("cases", idArray);
	Date date = new Date();
	jsonObject.put("time", date.toString());
	logger.log(Level.INFO, "write data to fileName as={0}", userName);
	try
    { File targetDir = new File(jsonDir) ;
      File targetJson = new File(jsonDir ,userName + ".json");
    	if (! targetDir.exists())
    		targetDir.mkdirs();
    	else if(targetJson.exists())
    		targetJson.delete();
      FileOutputStream stream = new FileOutputStream(targetJson);
      jsonObject.serialize(stream);
      idArray.clear();
      jsonObject.clear();
    }
    catch (Exception exp)
    {
      exp.printStackTrace();
    }
    if (vClient != null)
    {
      vClient.logout();
    }
  }



}
