/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.win32;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;

public class WinPlatformMetaConvertor
{
  static Logger log = Logger.getLogger(WinPlatformMetaConvertor.class.getName());
  
  public static final String NATIVE_DIR = "wmf2png" + File.separator;

  static WinPlatformMetaConvertor instance = null;

  public native boolean convert(String fileName, String targetName, int width, int height);
  
  public native boolean convert(String fileName, String targetName, double percent);
  
  private WinPlatformMetaConvertor()
  {
  }

  static
  {
    if (System.getProperty("os.name").toLowerCase().startsWith("win"))
    {
      try
      {
        String dataModel = System.getProperty("sun.arch.data.model");
        JSONObject conversionlibCfg = (JSONObject) ConversionConfig.getInstance().getConfig("conversionLib");
        String conversionlibPath = (String) conversionlibCfg.get("path");
        String wmf2pngPath = new File(conversionlibPath).getParent() + "/wmf2png/";

        if ("64".equals(dataModel))
        {
          System.load(wmf2pngPath + "MetaFileLib64.dll");
          log.info("MetaFileLib64 loaded");
        }
        else
        {
          System.load(wmf2pngPath + "MetaFileLib.dll");
          log.info("MetaFileLib loaded");
        }
        instance = new WinPlatformMetaConvertor();

      }
      catch (Throwable e)
      {
        log.log(Level.INFO, e.getMessage(), e);
      }
            
    }
    else
    {
      log.info("Not windows platform, no lib is loaded");
    }
  }
  
  public static WinPlatformMetaConvertor getInstance()
  {
    return instance;
  }

}
