/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.sanity.util;

import java.io.File;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.HierarchicalConfiguration;
import org.apache.commons.configuration.XMLConfiguration;

import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

public final class WASConfigHelper
{
  private static final Logger LOG = Logger.getLogger(WASConfigHelper.class.getName());

  private static String ssoDomain = null;

  private static Map<String, Integer> sslPortAssociations = null;

  private static final AdminService wasAdminService = AdminServiceFactory.getAdminService();

  private static XMLConfiguration cellVarConfig = null;

  public WASConfigHelper()
  {

  }

  public static final String getSSODomain()
  {
    return ssoDomain;
  }

  public static final Map<String, Integer> getSslPortAssociations()
  {
    return sslPortAssociations;
  }

  public static final String getCellVariable(String symbolicName)
  {
    int i = cellVarConfig.getMaxIndex("entries");
    for (int j = 0; j <= i; j++)
    {
      Configuration config = cellVarConfig.subset((new StringBuilder()).append("entries(").append(j).append(")").toString());
      if (symbolicName.equals(config.getString("[@symbolicName]")))
      {
        String value = config.getString("[@value]");
        return value;
      }
    }

    return null;
  }

  static
  {
    loadConfig();
  }

  public static String getCellName()
  {
    return wasAdminService.getCellName();
  }

  private static void loadConfig()
  {
    try
    {
      File secFile;
      File idxFile;
      File varFile;
      String procName;
      if (System.getProperty("was.install.root") != null)
      {
        String rootPath = System.getProperty("user.install.root");
        String cellName = wasAdminService.getCellName();
        String nodeName = wasAdminService.getNodeName();
        procName = wasAdminService.getProcessName();
        String secFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("nodes").append(File.separator)
            .append(nodeName).append(File.separator).append("serverindex.xml").toString();
        String varFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("variables.xml").toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        varFile = new File(varFilePath);
      }
      else
      {
        String secFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("serverindex.xml").toString();
        String varFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("variables.xml").toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        varFile = new File(varFilePath);
        procName = "server1";
      }

      XMLConfiguration xmlConfig = new XMLConfiguration(secFile);
      Configuration config = getLTPAConfig(xmlConfig);
      if (config != null && config.getBoolean("[@enabled]"))
        ssoDomain = config.getString("[@domainName]");

      XMLConfiguration xmlConfig1 = new XMLConfiguration(idxFile);
      sslPortAssociations = Collections.unmodifiableMap(getHttpsAssocMap(xmlConfig1, procName));

      cellVarConfig = new XMLConfiguration(varFile);
    }
    catch (ConfigurationException e)
    {
      LOG.log(Level.WARNING, "Exception is got when loading config", e);
    }
  }

  private static final Configuration getLTPAConfig(XMLConfiguration xmlConfig)
  {
    int i = xmlConfig.getMaxIndex("authMechanisms");
    for (int j = 0; j <= i; j++)
    {
      Configuration config = xmlConfig.subset((new StringBuilder()).append("authMechanisms(").append(j).append(")").toString());
      if ("security:LTPA".equals(config.getString("[@xmi:type]")))
        return config.subset("singleSignon");
    }

    return null;
  }

  private static final HierarchicalConfiguration getSslPortAssocConfig(XMLConfiguration xmlConfig, String serverName)
  {
    int i = xmlConfig.getMaxIndex("serverEntries");
    for (int j = 0; j <= i; j++)
    {
      Configuration config = xmlConfig.subset((new StringBuilder()).append("serverEntries(").append(j).append(")").toString());
      if (serverName.equals(config.getString("[@serverName]")))
        return (HierarchicalConfiguration) config;
    }

    return null;
  }

  private static final Map<String, Integer> getHttpsAssocMap(XMLConfiguration xmlConfig, String serverName)
  {
    HierarchicalConfiguration hierConfig = getSslPortAssocConfig(xmlConfig, serverName);
    int i = hierConfig.getMaxIndex("specialEndpoints");
    HashMap<String, Integer> map = new HashMap<String, Integer>(i);
    Integer integer = Integer.valueOf(-1);
    for (int j = 0; j <= i; j++)
    {
      String s1 = hierConfig.getString((new StringBuilder()).append("specialEndpoints(").append(j).append(").[@endPointName]").toString());
      String s2 = hierConfig.getString((new StringBuilder()).append("specialEndpoints(").append(j).append(").endPoint.[@host]").toString());
      Integer integer1 = hierConfig.getInteger((new StringBuilder()).append("specialEndpoints(").append(j).append(").endPoint.[@port]")
          .toString(), integer);
      if (s1.equals("WC_defaulthost"))
      {
        map.put((new StringBuilder()).append("http.").append(s2).toString(), integer1);
        continue;
      }
      if (s1.equals("WC_defaulthost_secure"))
      {
        map.put((new StringBuilder()).append("https.").append(s2).toString(), integer1);
      }
    }

    return map;
  }

  public static String getServerLogPath()
  {
    String resFilePath = null;
    try
    {
      String rootPath = System.getProperty("user.install.root");
      String procName = wasAdminService.getProcessName();
      resFilePath = (new StringBuilder().append(rootPath).append(File.separator).append("logs").append(File.separator).append(procName))
          .toString();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception is got when get server log path.", e);
    }
    return resFilePath;
  }

  public static String getCellPath()
  {
    try
    {
      if (System.getProperty("was.install.root") != null)
      {
        String rootPath = System.getProperty("user.install.root");
        String cellName = wasAdminService.getCellName();
        return (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator).append("cells")
            .append(File.separator).append(cellName).toString();
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception is got when loading config", e);
    }
    return null;
  }

}
