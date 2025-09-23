/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.httpclient.HttpClient;

import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalConversionService implements IConversionService
{
  private Map<String, IFormatConverter> converterMap = new HashMap<String, IFormatConverter>();

  public LocalConversionService(JSONArray config)
  {
    try
    {
      int j = config.size();
      for (int i = 0; i < j; i++)
      {
        JSONObject obj = (JSONObject) config.get(i);
        String source = (String) obj.get("source");
        String target = (String) obj.get("target");
        String className = (String) obj.get("class");
        IFormatConverter converter = (IFormatConverter) Class.forName(className).newInstance();
        converterMap.put(source + "+" + target, converter);
      }
    }
    catch (Throwable e)
    {
      e.printStackTrace();
    }
  }

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath) throws ConversionException, UnsupportedMimeTypeException
  {
    // TODO Auto-generated method stub
    return null;
  }

  public ConversionTask convert(String path, String sourceType, String targetType, String targetPath, Map<String, Object> options, boolean async, IConversionJob job)
      throws ConversionException, UnsupportedMimeTypeException
  {
    // TODO Auto-generated method stub
    return null;
  }

  public ConversionTask convert(String path, String sourceType, String targetType)  throws ConversionException, UnsupportedMimeTypeException
  {
    String key = sourceType + "+" + targetType;
    IFormatConverter converter = converterMap.get(key.toLowerCase());
    if (converter == null)
    {
      throw new UnsupportedMimeTypeException("Unsupported document type");
    }
    try
    {
      converter.convert(path, sourceType, targetType);
      return null;
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    
    return null;
  }

  public ConversionTask convert(String path, String sourceType, String targetType, Map<String, Object> options) throws ConversionException, UnsupportedMimeTypeException
  {
    String key = sourceType + "+" + targetType;
    IFormatConverter converter = converterMap.get(key.toLowerCase());
    if (converter == null)
    {
      throw new UnsupportedMimeTypeException("Unsupported document type");
    }
    else
    {
      if (options != null && targetType.equals("application/pdf"))
      {
        IFormatConverterWithOptions symConverter = (IFormatConverterWithOptions) converter;
        try
        {
          symConverter.convert(path, sourceType, targetType, options);
          return null;
        }
        catch (Exception e)
        {
          e.printStackTrace();
        }
      }
    }
    try
    {
      converter.convert(path, sourceType, targetType);
      return null;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    
    return null;
  }

  public boolean supports(String sourceType, String targetType)
  {
    String key = sourceType + "+" + targetType;
    IFormatConverter converter = converterMap.get(key.toLowerCase());
    if (converter == null)
    {
      return false;
    }
    return true;
  }

  public boolean queryState(ConversionTask[] tasks, IConversionJob job) throws ConversionException
  {
    return false;
  }

  public ConversionTask createConversionTask(TaskCategory category)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public HttpClient getHttpClient()
  {
    return null;
  }
}
