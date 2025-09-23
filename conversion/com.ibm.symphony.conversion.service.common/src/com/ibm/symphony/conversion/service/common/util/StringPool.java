package com.ibm.symphony.conversion.service.common.util;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;

public class StringPool
{

  public final static String DEFAULT_FILE_NAME = "stringPool";

  private JSONObject dataPool = null;

  private StringPool(JSONObject data)
  {
    dataPool = data;
  }

  public static StringPool load(File path)
  {
    File dataFile = null;
    if (path.isDirectory())
    {
      dataFile = new File(path + File.separator + DEFAULT_FILE_NAME);
    }
    else
    {
      dataFile = path;
    }
    if (path.exists())
    {
      InputStream stream = null;
      try
      {
        stream = new BufferedInputStream(new FileInputStream(dataFile));
        JSONObject obj = JSONObject.parse(stream);
        return new StringPool(obj);
      }
      catch (Exception e)
      {
      }
      finally
      {
        if (stream != null)
        {
          try
          {
            stream.close();
          }
          catch (IOException e)
          {
          }
        }
      }

    }
    return createStringPool();
  }

  public static StringPool createStringPool()
  {
    JSONObject obj = new JSONObject();
    return new StringPool(obj);
  }

  public String addString(String value)
  {
    String key;
    do
    {
      key = DOMIdGenerator.generate();
    }
    while (dataPool.containsKey(key));

    dataPool.put(key, value);
    return key;
  }

  public String addString(String key, String value)
  {
    if (key == null)
      return addString(value);

    dataPool.put(key, value);
    return key;
  }

  public String getString(String key)
  {
    return (String) dataPool.get(key);
  }

  public boolean contains(String key)
  {
    return dataPool.containsKey(key);
  }

  public void save(File path)
  {
    File dataFile = null;
    if (path.isDirectory())
    {
      dataFile = new File(path + File.separator + DEFAULT_FILE_NAME);
    }
    else
    {
      dataFile = path;
    }

    OutputStream out = null;
    try
    {
      out = new BufferedOutputStream(new FileOutputStream(dataFile));
      dataPool.serialize(out);
    }
    catch (Exception e)
    {

    }
    finally
    {
      if (out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {

        }
      }
    }
  }

}
