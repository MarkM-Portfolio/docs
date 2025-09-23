/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.g11n;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

public class G11NConfigFileUtil
{
  private static Logger log = Logger.getLogger(G11NConfigFileUtil.class.getName());

  private static String CONFIG_FILE_PATH;

  public static void setConfigPath(String path)
  {
    CONFIG_FILE_PATH = path;
  }

  public static JSONObject parseJSON(String resourceName)
  {
    InputStream input = null;
    JSONObject ret = null;
    try
    {
      String configFile = getConfigFile(resourceName);
      if(configFile.equals(resourceName))
        input = G11NConfigFileUtil.class.getResourceAsStream(resourceName);
      else
      {
        File file = new File(configFile);
        if(file.exists())
          input = new FileInputStream(configFile);
        else
          input = G11NConfigFileUtil.class.getResourceAsStream(resourceName);
      }

      ret = JSONObject.parse(input);
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, e.toString());
    }
    finally
    {
      if (input != null)
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
        }
      }
    }
    return ret;
  }

  private static String getConfigFile(String fileName)
  {
    return (CONFIG_FILE_PATH == null || CONFIG_FILE_PATH.equals("")) ? fileName : CONFIG_FILE_PATH + File.separator + fileName;
  }

}
