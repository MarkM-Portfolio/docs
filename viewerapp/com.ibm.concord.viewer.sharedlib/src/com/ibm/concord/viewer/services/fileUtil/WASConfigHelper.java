/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.fileUtil;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.XMLConfiguration;

import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

/**
 * Helper class being used to read the WebSphere Cell configuration variable.
 *
 */
public final class WASConfigHelper
{
  private static final Logger LOG = Logger.getLogger(WASConfigHelper.class.getName());
  private static final AdminService wasAdminService = AdminServiceFactory.getAdminService();
  private static XMLConfiguration cellVarConfig = null;
  
  /**
   * 
   */
  public WASConfigHelper()
  {
    
  }
  
  static
  {
    loadConfig();
  }
  
  /**
   * 
   */
  private static void loadConfig()
  {
    try
    {
      File varFile;
      if (System.getProperty("was.install.root") != null)
      {
        String rootPath = System.getProperty("user.install.root");
        String cellName = wasAdminService.getCellName();
        String varFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator).append("cells").append(File.separator).append(cellName).append(File.separator).append("variables.xml").toString();
        varFile = new File(varFilePath);
      }
      else
      {
        String varFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator).append("variables.xml").toString();
        varFile = new File(varFilePath);
      }
      
      cellVarConfig = new XMLConfiguration(varFile);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception is got when loading config", e);
    }
  }
  
  /**
   * 
   * @param symbolicName
   * @return
   */
  public static String getCellVariable(String symbolicName)
  {
    int length = cellVarConfig.getMaxIndex("entries");
    for (int index = 0; index <= length; index++)
    {
      Configuration config = cellVarConfig.subset((new StringBuilder()).append("entries(").append(index).append(")").toString());
      if (symbolicName.equals(config.getString("[@symbolicName]")))
      {
        String value = config.getString("[@value]");
        return value;
      }
    }
    
    return null;
  }
  
  /**
   * Get the path of current cell that the server located in.
   * 
   * @return
   */
  public static String getCellPath()
  {
    try
    {
      if (System.getProperty("was.install.root") != null)
      {
        String rootPath = System.getProperty("user.install.root");
        String cellName = wasAdminService.getCellName();
        return (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator).append("cells").append(File.separator).append(cellName).toString();
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception is got when loading config", e);
    }
    return null;
  }
}
