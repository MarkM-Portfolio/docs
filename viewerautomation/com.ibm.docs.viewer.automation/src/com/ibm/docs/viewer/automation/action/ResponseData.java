package com.ibm.docs.viewer.automation.action;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPInputStream;

import com.ibm.json.java.JSONObject;

public class ResponseData
{
  private int statusCode;

  private InputStream is;

  private String encoding;

  private static final String GZIP = "gzip";

  private static final Logger logger = Logger.getLogger(ResponseData.class.getName());

  public ResponseData(int code, InputStream is, String encoding)
  {
    super();
    this.statusCode = code;
    this.is = is;
    this.encoding = encoding;
  }

  public int getCode()
  {
    return statusCode;
  }

  public InputStream getInputStream()
  {
    return is;
  }

  public JSONObject getDataAsJSON()
  {
    if (GZIP.equals(encoding))
      return getGZipDataAsJSON();
    try
    {
      return JSONObject.parse(is);
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      return null;
    }
  }

  public String getDataAsString() throws UnsupportedEncodingException
  {
    if (GZIP.equals(encoding))
      return getGZipDataAsString();

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    byte[] buffer = new byte[1024];
    try
    {
      int len;
      while ((len = is.read(buffer)) > -1)
      {
        baos.write(buffer, 0, len);
      }
      baos.flush();
      return new String(baos.toByteArray());
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      if (baos != null)
      {
        try
        {
          baos.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    return "";
  }

  private JSONObject getGZipDataAsJSON()
  {
    GZIPInputStream gis = null;
    try
    {
      gis = new GZIPInputStream(is);
      return JSONObject.parse(gis);
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      return null;
    }
    finally
    {
      if (gis != null)
      {
        try
        {
          gis.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }

  private String getGZipDataAsString()
  {
    GZIPInputStream gis = null;
    ByteArrayOutputStream baos = null;
    try
    {
      gis = new GZIPInputStream(is);
      baos = new ByteArrayOutputStream();
      byte[] buffer = new byte[1024];
      int len;
      while ((len = gis.read(buffer, 0, 1024)) != -1)
      {
        baos.write(buffer, 0, len);
      }
      baos.flush();
      return new String(baos.toByteArray());
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
    }
    finally
    {
      if (gis != null)
      {
        try
        {
          gis.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      if (baos != null)
      {
        try
        {
          baos.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    return "";
  }
}
