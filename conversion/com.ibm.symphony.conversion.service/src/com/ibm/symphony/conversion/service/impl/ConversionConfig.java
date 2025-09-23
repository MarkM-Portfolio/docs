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
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class ConversionConfig
{
  public static final String CONFIG_FS_KEY = "ConversionFS";

  public static final String CONCORD_CONFIG_FILE = "conversion-config.json";
  
  public static final String CONCORD_CONFIG_FILE_DEV = "conversion-config-dev.json";
  
  public static final String CONVERTERS_CONFIG_FILE = "converters-config.json";

  private String configFS;

  private JSONObject rootConfig;
  
  private JSONObject convertersRootConfig;

  private static ConversionConfig _instance;

  Logger log = Logger.getLogger(ConversionConfig.class.getName());

  public static ConversionConfig getInstance()
  {
    if (_instance == null)
    {
      _instance = new ConversionConfig();
    }
    return _instance;
  }

  private ConversionConfig()
  {
    init();
  }

  public String getConfigDirectory()
  {
    return configFS;
  }

  public JSONObject getSubConfig(String key)
  {
    return (JSONObject) rootConfig.get(key);
  }

  public Object getConfig(String key)
  {
    return rootConfig.get(key);
  }
  
  public Object getConvertersConfig(String key)
  {
    return convertersRootConfig.get(key);
  }

  public Object getConfig(String key, Object defaultValue)
  {
    return rootConfig.containsKey(key) ? rootConfig.get(key) : defaultValue;
  }

  public void load(String configPath) 
  {
    configFS = configPath.replaceAll("\\\\", "/");
    if(!configFS.endsWith("/"))
      configFS = configFS + "/";
    File configFile = new File(configFS + CONCORD_CONFIG_FILE);
    if (configFile.exists() && configFile.isFile())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(configFile);
        JSONObject tempConfigObj = JSONObject.parse(fis);
        rootConfig = tempConfigObj;
        log.log(Level.INFO, "CONVERSION_REPOSITORY_PATH: " + rootConfig.get("repositoryPath"));
      }
      catch (FileNotFoundException e)
      {
        throw new IllegalArgumentException("Config file: " + configFile.getAbsolutePath()
            + " must exist and be a file for system to work.");
      }
      catch (IOException e)
      {
        throw new IllegalArgumentException("Malformed config file: " + configFile.getAbsolutePath() + " can not be parsed successfully.");
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            log.severe("Cannot close fileinputstream for System config file " + configFile.getAbsolutePath());
          }
        }
      }
    }
    else
      throw new IllegalArgumentException("Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.");
  }
  
  private void init()
  { 
    /* load converters-config.json */
    InputStream is = null;
    try
    {
      is = getClass().getResourceAsStream("/config/" + CONVERTERS_CONFIG_FILE);
      if (is == null)
      {
        throw new IllegalArgumentException("Failed to load " + CONVERTERS_CONFIG_FILE);
      }
      convertersRootConfig = JSONObject.parse(is);
    }
    catch (IOException e)
    {
      throw new IllegalArgumentException("Error happened when load " + CONVERTERS_CONFIG_FILE, e);
    }
    finally
    {
      if (is != null)
      {
        try
        {
          is.close();
        }
        catch (IOException e)
        {
          log.severe("Cannot close FileInputStream for " + CONVERTERS_CONFIG_FILE);
        }
      }
    }
  }
}
