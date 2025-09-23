/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.impl;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.RejectedExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.ThreadConfig;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IConversionTaskManager;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.exception.ConversionException;

public class ConversionService implements IConversionService
{

  public static final String CONVERTERS_EXTENSION_POINT_ID = "com.ibm.symphony.conversion.service.converters";

  public static final String CONVERTERS_EXTENSION_SERVICE = "service";

  public static final String CONVERTERS_EXTENSION_SOURCE_MIMETYPE = "source_mimetype";

  public static final String CONVERTERS_EXTENSION_TARGET_MIMETYPE = "target_mimetype";

  public static final String CONVERTERS_EXTENSION_CLASS = "class";
  
  public static final String FORMAT_CONVERTERS_CONFIG_ID = "formartConverters";

  private Map<String, IFormatConverter> converterMap = new HashMap<String, IFormatConverter>();

  private ConversionConfig config = ConversionConfig.getInstance();
  
  private IConversionTaskManager taskManager = ConversionTaskManager.getInstance();;

  private static final Logger log = Logger.getLogger(ConversionService.class.getName());

  private static ConversionService instance = new ConversionService();

  public static synchronized ConversionService getInstance()
  {
    return instance;
  }

  private ConversionService()
  {
    JSONArray array = (JSONArray) ConversionConfig.getInstance().getConvertersConfig(FORMAT_CONVERTERS_CONFIG_ID);
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject) array.get(i);
      String sourceMIMEType = (String) obj.get(CONVERTERS_EXTENSION_SOURCE_MIMETYPE);
      String targetMIMEType = (String) obj.get(CONVERTERS_EXTENSION_TARGET_MIMETYPE);
      String className = (String) obj.get(CONVERTERS_EXTENSION_CLASS);
      try
      {
        IFormatConverter converter = (IFormatConverter) Class.forName(className).newInstance();
        converterMap.put(sourceMIMEType + "+" + targetMIMEType, converter);
      }
      catch (Throwable t)
      {
        log.log(Level.SEVERE,
            new LogEntry(ThreadConfig.getRequestID(), String.format("Loading failed: %s , Exception %s ", new Object[] { className, t }))
                .toString());
      }
    }
  }

  public IFormatConverter getConverter(String sourceMIMEType, String targetMIMEType) throws ConversionException
  {
    String key = sourceMIMEType + "+" + targetMIMEType;
    IFormatConverter converter = converterMap.get(key);
    return converter;
  }

  public boolean supports(String sourceMIMEType, String targetMIMEType) throws ConversionException
  {
    String key = sourceMIMEType + "+" + targetMIMEType;
    IFormatConverter converter = converterMap.get(key);
    if (converter == null)
      return false;
    else
      return true;
  }

  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, Map parameters)
      throws ConversionException
  {
    return submitConversionTask(sourceMIMEType, targetMIMEType, sourceFile, null, parameters);
  }

  public boolean isCompleted(String jobId) throws ConversionException
  {
    log.entering(getClass().getName(), "isCompleted", jobId);

    boolean result = taskManager.isCompleted(jobId);

    log.exiting(getClass().getName(), "isCompleted", result);
    return result;
  }

  public ConversionResult getConversionResult(String jobId) throws ConversionException
  {
    log.entering(getClass().getName(), "getConversionResult", jobId);

    ConversionResult result = taskManager.getConversionResult(jobId);

    log.exiting(getClass().getName(), "getConversionResult", result);
    return result;
  }

  public String getRepositoryPath()
  {
    return (String) config.getConfig("repositoryPath");
  }

  public Object getConfig(String key)
  {
    return config.getConfig(key);
  }

  public String submitConversionTask(String sourceMIMEType, String targetMIMEType, File sourceFile, File targetFolder, Map parameters)
      throws ConversionException, RejectedExecutionException
  {
    log.entering(getClass().getName(), "submitConversionTask", new Object[] { sourceMIMEType, targetMIMEType, sourceFile, targetFolder });
    String id = taskManager.submitConversionTask(sourceMIMEType, targetMIMEType, sourceFile, targetFolder, parameters);

    log.exiting(getClass().getName(), "submitConversionTask", id);
    return id;
  }

  public void loadConfigurations(String configPath)
  {
    config = ConversionConfig.getInstance();
    config.load(configPath);
  }

  public String getConfigPath()
  {
    return config.getConfigDirectory();
  }
  
  public void cancelConversionTask(String jobId) throws ConversionException
  {
   taskManager.cancelConversionTask(jobId);
  }

  public boolean isCompleted(String jobId, String targetFolder) throws ConversionException
  {
    // TODO Auto-generated method stub
    return false;
  }

  public ConversionResult getConversionResult(String jobId, String targetFolder) throws ConversionException
  {
    // TODO Auto-generated method stub
    return null;
  }
}
