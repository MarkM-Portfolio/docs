/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.sanity.util;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.time.DateFormatUtils;

import com.ibm.docs.viewer.sanity.ISanityCheck;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author linfeng_li
 * 
 */
public class SanityFileUtil
{
  private static final Logger LOG = Logger.getLogger(SanityFileUtil.class.getName());

  /**
   * @param is
   * @param path
   * @return
   */
  public static boolean setInputStreamToPath(InputStream is, String path)
  {
    LOG.entering(SanityFileUtil.class.getName(), String.format("setInputStreamToPath path : %s .", path));
    OutputStream os = null;
    try
    {
      File file = new File(path);
      os = new BufferedOutputStream(new FileOutputStream(file));
      byte[] bytes = new byte[4096];
      int readLength = 0;

      while ((readLength = is.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
      }
      os.flush();
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IOException occur when setInputStreamToPath.", e);
      return false;
    }
    finally
    {
      try
      {
        if (os != null)
          os.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur when close stream of setInputStreamToPath.", e);
        return false;
      }
    }
    LOG.exiting(SanityFileUtil.class.getName(), "setInputStreamToPath");
    return true;
  }

  /**
   * @param src
   * @param dest
   */
  public static JSONObject copyFileToFile(String src, String dest)
  {
    LOG.entering(SanityFileUtil.class.getName(), String.format("copyFileToFile srcPath : %s , destPath : %s ", src, dest));
    JSONObject resultJson = new JSONObject();
    File srcFile = new File(src);
    if (!srcFile.exists())
    {
      resultJson.put(ISanityCheck.STATUS_FAIL, String.format("Source file %s is not exist.", src));
      return resultJson;
    }
    File destFile = new File(dest);
    InputStream in = null;
    OutputStream out = null;
    try
    {
      in = new FileInputStream(srcFile);
      out = new FileOutputStream(destFile);
      final byte[] buffer = new byte[8192];
      int n;
      while ((n = in.read(buffer)) != -1)
      {
        out.write(buffer, 0, n);
      }
      out.flush();
    }
    catch (FileNotFoundException e)
    {
      resultJson.put(ISanityCheck.STATUS_FAIL, String.format("Source file %s is not exist.", src));
      LOG.log(Level.SEVERE, "FileNotFoundException occur when copyFileToFile .", e);
      return resultJson;
    }
    catch (IOException e)
    {
      resultJson.put(ISanityCheck.STATUS_FAIL, String.format("IOException occur when copyFileToFile : %s .", src));
      LOG.log(Level.SEVERE, "IOException occur when copyFileToFile .", e);
      return resultJson;
    }
    finally
    {
      try
      {
        if (in != null)
          in.close();
        if (out != null)
          out.close();
      }
      catch (IOException e)
      {
        resultJson.put(ISanityCheck.STATUS_FAIL, String.format("IOException occur when copyFileToFile : %s .", src));
        LOG.log(Level.SEVERE, "IOException occur when copyFileToFile .", e);
        return resultJson;
      }
    }
    resultJson = null;
    LOG.exiting(SanityFileUtil.class.getName(), "copyFileToFile");
    return resultJson;
  }

  /**
   * @param filePath
   * @param metaFilePath
   */
  public static JSONObject generateMeta(String filePath, String metaFilePath)
  {
    LOG.entering(SanityFileUtil.class.getName(),
        String.format("getDocumentContent filePath : %s , metaFilePath : %s ", filePath, metaFilePath));
    JSONObject resultJson = new JSONObject();
    JSONObject retObj = null;
    InputStream is = null;
    OutputStream os = null;
    try
    {
      File file = new File(filePath);
      File metaFile = new File(metaFilePath);
      is = new FileInputStream(file);
      os = new BufferedOutputStream(new FileOutputStream(metaFile));
      byte[] bytes = new byte[4096];
      int readLength = 0;
      long totleLength = 0;

      while ((readLength = is.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
        totleLength += readLength;
      }
      os.flush();

      JSONObject obj = new JSONObject();
      obj.put("name", file.getName());
      obj.put("id", file.getName());
      obj.put("size", totleLength);
      String now = DateFormatUtils.ISO_DATETIME_TIME_ZONE_FORMAT.format(new Date());
      obj.put("modified_at", now);
      JSONObject creators = new JSONObject();
      creators.put("id", "5c11a0c0-7f6f-1033-982d-eba7a40afa7a");
      creators.put("name", "vsanity");
      creators.put("email", "vsanity@cn.ibm.com");
      obj.put("created_by", creators);
      obj.put("modified_by", creators);
      JSONObject permission = new JSONObject();
      obj.put("permissions", permission);
      permission.put("read", "true");
      permission.put("write", "true");
      Double fileVersion = 0.0;
      try
      {
        String version = (String) obj.get("version");
        if (version == null)
          fileVersion = 1.0;
        else
        {
          fileVersion = Double.valueOf(version);
          fileVersion += 1.0;
        }
      }
      catch (NumberFormatException e)
      {
        fileVersion = 1.0;
      }
      obj.put("version", fileVersion.toString());
      setMeta(obj, metaFilePath);

      resultJson.put("size", String.valueOf(totleLength));
      JSONArray array = new JSONArray();
      array.add(obj);

      retObj = new JSONObject();
      retObj.put("total_count", 1);
      retObj.put("entries", array);
    }
    catch (FileNotFoundException e)
    {
      resultJson.put(ISanityCheck.STATUS_FAIL, String.format("FileNotFoundException occur when update meta json of %s .", filePath));
      LOG.log(Level.SEVERE, "FileNotFoundException occur when update meta json .", e);
      return resultJson;
    }
    catch (IOException e)
    {
      resultJson.put(ISanityCheck.STATUS_FAIL, String.format("IOException occur when update meta json of %s .", filePath));
      LOG.log(Level.SEVERE, "IOException occur when update meta json .", e);
      return resultJson;
    }
    finally
    {
      try
      {
        if (is != null)
          is.close();
        if (os != null)
          os.close();
      }
      catch (IOException e)
      {
        resultJson.put(ISanityCheck.STATUS_FAIL, String.format("IOException occur when close stream of %s .", filePath));
        LOG.log(Level.SEVERE, "IOException occur when close stream .", e);
        return resultJson;
      }
    }
    LOG.exiting(SanityFileUtil.class.getName(), "getDocumentContent");
    return resultJson;
  }

  /**
   * @param filePath
   * @return
   */
  public static JSONObject getJson(String filePath)
  {
    LOG.entering(SanityFileUtil.class.getName(), String.format("getJson metaFilePath : %s ", filePath));
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
    LOG.exiting(SanityFileUtil.class.getName(), "getJson");
    return jsonResult;
  }

  /**
   * @param jsonObj
   * @param metaPath
   */
  private static void setMeta(JSONObject jsonObj, String metaPath)
  {
    LOG.entering(SanityFileUtil.class.getName(), String.format("setMeta metaFilePath : %s ", metaPath));
    File metaFile = new File(metaPath);
    FileOutputStream fop = null;
    try
    {
      fop = new FileOutputStream(metaFile);
      fop.write(jsonObj.toString().getBytes());
      fop.flush();
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.SEVERE, "FileNotFoundException occur when parse json of setMeta .", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IOException occur when parse json of setMeta .", e);
    }
    finally
    {
      try
      {
        if (fop != null)
          fop.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "IOException occur when close output stream of setMeta .", e);
      }
    }
    LOG.exiting(SanityFileUtil.class.getName(), "getMeta");
  }
}
