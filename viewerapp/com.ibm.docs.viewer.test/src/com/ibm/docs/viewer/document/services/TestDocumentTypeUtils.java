package com.ibm.docs.viewer.document.services;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.junit.BeforeClass;
import org.junit.Test;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.json.java.JSONObject;

public class TestDocumentTypeUtils
{
  private static JSONObject templateConfig = null;

  private static final String configFile = "viewer-config.json";

  @BeforeClass
  public static void setup()
  {
    try
    {
      InputStream is = TestDocumentTypeUtils.class.getResourceAsStream(configFile);
      templateConfig = JSONObject.parse(is);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }

  @Test
  public void testIsHTML()
  {
    String tempDir = System.getProperty("java.io.tmpdir");
    File config = new File(tempDir, "viewer-config.json");
    try
    {
      if (config.exists())
      {
        config.delete();
      }

      JSONObject htmlJson = (JSONObject) templateConfig.get("HtmlViewerConfig");
      htmlJson.put("enabled", "true");
//      htmlJson.put("exclude", "pdf;text;sheet;pres");
//
//      templateConfig.put("HtmlViewerConfig", htmlJson);
//      templateConfig.serialize(new FileOutputStream(config));
//
//      ViewerConfig.getInstance(new FileInputStream(config));
//      assertFalse(DocumentTypeUtils.isHTML("application/pdf"));
//      assertFalse(DocumentTypeUtils.isHTML("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
//      assertFalse(DocumentTypeUtils.isHTML("application/vnd.oasis.opendocument.presentation"));
//      assertFalse(DocumentTypeUtils.isHTML("application/vnd.oasis.opendocument.text"));

      htmlJson.put("exclude", "text;sheet");
      templateConfig.put("HtmlViewerConfig", htmlJson);
      templateConfig.serialize(new FileOutputStream(config));

      ViewerConfig.getInstance(new FileInputStream(config));

      assertFalse(DocumentTypeUtils.isHTML("application/pdf"));
      assertFalse(DocumentTypeUtils.isHTML("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
      assertTrue(DocumentTypeUtils.isHTML("application/vnd.oasis.opendocument.presentation"));
      assertFalse(DocumentTypeUtils.isHTML("application/vnd.oasis.opendocument.text"));
    }
    catch (FileNotFoundException e)
    {
      fail();
    }
    catch (IOException e)
    {
      fail();
    }
    finally
    {
      if (config.exists())
      {
        config.delete();
      }
    }

  }
}
