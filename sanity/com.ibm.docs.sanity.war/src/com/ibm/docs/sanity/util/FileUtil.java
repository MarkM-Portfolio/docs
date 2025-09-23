/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.sanity.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.docs.sanity.task.ConversionUploadTask;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class FileUtil
{
  private static final Logger LOG = Logger.getLogger(FileUtil.class.getName());

  public static boolean exists(File file)
  {
    if (file.exists())
    {
      return true;
    }

    FileInputStream fis = null;
    boolean exist = true;
    try
    {
      file.getParentFile().listFiles();
      fis = new FileInputStream(file);
    }
    catch (FileNotFoundException e)
    {
      exist = false;
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Failed to close read stream {0}, Exception: {1}", new Object[] { file.getAbsolutePath(), e });
        }
      }
    }

    return exist;
  }

  public static void cleanDirectory(File dir)
  {
    boolean dirExist = !dir.exists();
    File[] files = dir.listFiles();
    if (dirExist || files == null)
    {
      return;
    }

    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        cleanDirectory(f);
        f.delete();
      }
      else
      {
        f.delete();
      }
    }
  }

  public static String encodeToken(String value)
  {
    LOG.entering(ConversionUploadTask.class.getName(), "encodeToken", value);

    BASE64Encoder ecoder = new BASE64Encoder();
    String token = ecoder.encode(value.getBytes());

    LOG.exiting(ConversionUploadTask.class.getName(), "encodeToken", token != null);
    return token;
  }

  public static String escapeForJson(String in)
  {
    String out = null;
    out = StringEscapeUtils.escapeJavaScript(in);
    out = StringEscapeUtils.escapeHtml(out);
    return out;
  }

  /**
   * @param filePath
   * @return
   */
  public static JSONObject getJson(String filePath)
  {
    LOG.entering(FileUtil.class.getName(), String.format("getJson : %s ", filePath));
    FileInputStream is = null;
    JSONObject jsonResult = null;
    try
    {
      File file = new File(filePath);
      if (!file.exists())
        return jsonResult;
      is = new FileInputStream(file);
      jsonResult = JSONObject.parse(is);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IOException occur when parse json of getJson .", e);
    }
    finally
    {
      try
      {
        if (is != null)
          is.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur when close output stream of getJson .", e);
      }
    }
    LOG.exiting(FileUtil.class.getName(), "getJson");
    return jsonResult;
  }
}
