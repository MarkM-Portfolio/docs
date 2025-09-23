package com.ibm.docs.api.rest.sample.util;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;

import org.apache.commons.lang3.time.DateFormatUtils;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class FileUtil
{
  private String filePath;
  
  private String metaFilePath;
  
  public FileUtil(String filePath, String metaFilePath)
  {
    this.filePath = filePath;
    this.metaFilePath = metaFilePath;
  }
  
  private void setMeta(JSONObject obj)
  {
    File metaFile = new File(this.metaFilePath);
    FileOutputStream fop = null;
    try
    {
      fop = new FileOutputStream(metaFile);
      fop.write(obj.toString().getBytes());
      fop.flush();
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
    }
    catch (IOException e)
    {    
      e.printStackTrace();
    }
    finally
    {
      if(fop != null)
      {
        try
        {
          fop.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }

  public JSONObject getMeta()
  {
    FileInputStream metaIn = null;
    JSONObject metaJson = null;
    try
    {
      File metaFile = new File(this.metaFilePath);
      metaIn = new FileInputStream(metaFile);
      metaJson = JSONObject.parse(metaIn);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      if (metaIn != null)
      {
        try
        {
          metaIn.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    
    return metaJson;
  }

  public InputStream getContentStream()
  {
    File file = new File(this.filePath);
    FileInputStream fis = null;
    try
    {
      fis = new FileInputStream(file);
    }
    catch (FileNotFoundException e)
    {     
      e.printStackTrace();
    }
    finally
    {      
    }
    
    return fis;
  }

  public JSONObject setContentStream(InputStream is)
  {
    JSONObject retObj = null;
    OutputStream os = null;
    try
    {
      File file = new File(this.filePath);
      os = new BufferedOutputStream(new FileOutputStream(file));
      byte[] bytes = new byte[4096];
      int readLength = 0;
      long totleLength = 0;
      
      // update document
      while ((readLength = is.read(bytes)) != -1)
      {
        os.write(bytes, 0, readLength);
        totleLength += readLength;
      }
      os.flush();
      
      // update document meta
      JSONObject obj = this.getMeta();      
      obj.put("size", totleLength);      
      String now = DateFormatUtils.ISO_DATETIME_TIME_ZONE_FORMAT.format(new Date()); // ISO8601
      obj.put("modified_at", now);      
      String version = (String)obj.get("version");
      Double fV = Double.valueOf(version);
      fV += 1.0;
      obj.put("version", fV.toString());      
      this.setMeta(obj);
            
      
      JSONArray array = new JSONArray();
      array.add(obj);
      
      retObj = new JSONObject();
      retObj.put("total_count", 1);
      retObj.put("entries", array);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
    finally
    {
      try
      {
        os.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }
    
    return retObj;
  }

}
