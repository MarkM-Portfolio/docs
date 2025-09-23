/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.invoke;

import java.io.Closeable;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import com.ibm.cic.agent.core.api.ILogger;
import com.ibm.cic.agent.core.api.IMLogger;
import com.ibm.docs.im.installer.common.util.Constants;


public class Utils
{
  static ILogger logger = IMLogger.getLogger(Utils.class.getCanonicalName());
  
  public static Map<String, String> conversionNameMap = new HashMap<String, String>();

  public static Map<String, String> docsNameMap = new HashMap<String, String>();

  public static Map<String, String> viewerNameMap = new HashMap<String, String>();

  public static Map<String, String> proxyNameMap = new HashMap<String, String>();

  public static Map<String, String> docsExtNameMap = new HashMap<String, String>();

  public static Map<String, String> viewerExtNameMap = new HashMap<String, String>();

  public static Map<String, Map<String, String>> nameMap = new HashMap<String, Map<String, String>>();

  static
  {
    // to unify key names of command for same type of command of different component
    nameMap.put(Constants.VIEWER_ID, viewerNameMap);
    nameMap.put(Constants.CONVERSION_ID, conversionNameMap);
    nameMap.put(Constants.DOCS_ID, docsNameMap);
    nameMap.put(Constants.DOCS_PROXY_ID, proxyNameMap);
    nameMap.put(Constants.DOC_EXT_ID, docsExtNameMap);
    nameMap.put(Constants.VIEWER_EXT_ID, viewerExtNameMap);
    
    viewerExtNameMap.put("installCommand", "python icext/install.py ./cfg.properties ../");
    viewerExtNameMap.put("upgradeCommand", "python icext/upgrade.py");
    viewerExtNameMap.put("uninstallCommand", "python icext/uninstall.py ./cfg.properties ../");
    
    docsExtNameMap.put("installCommand", "python icext/install.py -acceptLicense -silentlyInstall");
    docsExtNameMap.put("upgradeCommand", "python icext/upgrade.py -acceptLicense");
    docsExtNameMap.put("uninstallCommand", "python icext/uninstall.py");
    
    proxyNameMap.put("installCommand", "python proxy/install.py -acceptLicense");
    proxyNameMap.put("upgradeCommand", "python proxy/upgrade.py -acceptLicense");
    proxyNameMap.put("uninstallCommand", "python proxy/uninstall.py");
    
    docsNameMap.put("installCommand", "python docs/install.py -acceptLicense -silentlyInstall");
    docsNameMap.put("upgradeCommand", "python docs/upgrade.py -acceptLicense -silentlyInstall");
    docsNameMap.put("uninstallCommand", "python docs/uninstall.py");
    
    viewerNameMap.put("installCommand", "python viewer/install.py ./cfg.properties ../");
    viewerNameMap.put("upgradeCommand", "python viewer/upgrade.py");
    viewerNameMap.put("uninstallCommand", "python viewer/uninstall.py ./cfg.properties ../");
    
    conversionNameMap.put("installCommand", "python conversion/install.py -acceptLicense -silentlyInstall");
    conversionNameMap.put("upgradeCommand", "python conversion/upgrade.py -acceptLicense -silentlyInstall");
    conversionNameMap.put("uninstallCommand", "python conversion/uninstall.py");
    
  }
  
  private Utils()
  {
  }

  public static boolean shouldSkipUpgrade(String upgradeRecordsPath, String component) throws Exception
  {
    Properties upgradeRecordsProps = new Properties();
    InputStream input = null;
    try
    {
      File upgradeRecords = new File(upgradeRecordsPath);
      if (upgradeRecords != null && upgradeRecords.exists())
      {
        input = new FileInputStream(String.format(upgradeRecordsPath));
        upgradeRecordsProps.load(input);
        if (upgradeRecordsProps.containsKey(component) && upgradeRecordsProps.getProperty(component).equalsIgnoreCase("true"))
        {
          return true;
        }
      }
    }
    finally
    {
      Utils.closeResource(input, null);
    }
    return false;
  }
  
  public static boolean setUpgradeRecords(String upgradeRecordsPath, String component, String result) throws Exception
  {
    Properties upgradeRecordsProps = new Properties();
    OutputStream output = null;
    InputStream input = null;
    try
    {
      File upgradeRecords = new File(upgradeRecordsPath);
      if (upgradeRecords != null && upgradeRecords.exists())
      {
        input = new FileInputStream(String.format(upgradeRecordsPath));
        upgradeRecordsProps.load(input);        
        Utils.closeResource(input, null);
      }
      upgradeRecordsProps.setProperty(component, result);
      
      output = new FileOutputStream(String.format(upgradeRecordsPath));
      upgradeRecordsProps.store(output, "upgrade records");      
    }
    finally
    {
      Utils.closeResource(output, null);
      Utils.closeResource(input, null);
    }
    return false;
  } 
  
  // java helper functions
  /**
   * Quietly and cleanly closes the Closeable object (Streams, Readers, etc) if it is still open
   * 
   * @param closeable
   *          Closeable object (Streams, Readers, etc)
   */
  public static void closeResource(Closeable closeable, PrintWriter writer)
  {
    if (closeable != null)
    {
      try
      {
        closeable.close();
      }
      catch (IOException e)
      {
        String closeInformationMessage = String.format("IOException closing resource. %s.", e.getMessage());
        writer.println(closeInformationMessage);
      }
    }
  }
}
