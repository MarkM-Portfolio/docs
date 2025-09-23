/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet.util;

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

import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

public final class WASConfigHelper
{
  private static final Logger LOG = Logger.getLogger(WASConfigHelper.class.getName());

  private static String ssoDomain = null;

  private static Map<String, Integer> sslPortAssociations = null;

  private static final AdminService wasAdminService = AdminServiceFactory.getAdminService();

  private static XMLConfiguration cellVarConfig = null;

  private static XMLConfiguration resourceConfig = null;

  private static Integer[] convWorkManagerMaxValues = null;

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
  
  public static final String getCellName()
  {
    if (System.getProperty("was.install.root") != null)
    {
      return wasAdminService.getCellName();
    }
    else
    {
      return null;
    }
  }
  
  public static final String getWasInstallRoot()
  {
    return System.getProperty("was.install.root");
  }

  public static final String getUserInstallRoot()
  {
    return System.getProperty("user.install.root");
  }
  
  public static final Integer getConvWorkManagerMaxThreads()
  {
    return convWorkManagerMaxValues[0];
  }

  public static final Integer getConvWorkManagerMaxQSize()
  {
    return convWorkManagerMaxValues[1];
  }

  public static final Integer getConvWorkManagerTimeout()
  {
    return convWorkManagerMaxValues[2];
  }

  static
  {
    loadConfig();
  }

  private static void loadConfig()
  {
    try
    {
      File secFile;
      File idxFile;
      File varFile;
      File resFile;
      String rootPath = "";
      String cellName = "";
      String nodeName = "";
      String procName = "";
      if (System.getProperty("was.install.root") != null)
      {
        rootPath = System.getProperty("user.install.root");
        cellName = wasAdminService.getCellName();
        nodeName = wasAdminService.getNodeName();
        procName = wasAdminService.getProcessName();
        String secFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("nodes").append(File.separator)
            .append(nodeName).append(File.separator).append("serverindex.xml").toString();
        String varFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("variables.xml").toString();
        String resFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("nodes").append(File.separator)
            .append(nodeName).append(File.separator).append("servers").append(File.separator).append(procName).append(File.separator)
            .append("resources-pme.xml").toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        varFile = new File(varFilePath);
        resFile = new File(resFilePath);
      }
      else
      {
        String secFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("serverindex.xml").toString();
        String varFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("variables.xml").toString();
        String resFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("resources-pme.xml").toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        varFile = new File(varFilePath);
        resFile = new File(resFilePath);
        procName = "server1";
      }

      /*
       * Temporarily comment, will recover after Li Jiao fix 2008 deployment issue XMLConfiguration xmlConfig = new
       * XMLConfiguration(secFile); Configuration config = getLTPAConfig(xmlConfig); if (config != null && config.getBoolean("[@enabled]"))
       * ssoDomain = config.getString("[@domainName]");
       */

      XMLConfiguration xmlConfig1 = new XMLConfiguration(idxFile);
      sslPortAssociations = Collections.unmodifiableMap(getHttpsAssocMap(xmlConfig1, procName));

      cellVarConfig = new XMLConfiguration(varFile);

      resourceConfig = new XMLConfiguration(resFile);

      /*
       * Here try to parse XML and find out conversion work manager info, if not found, will try another resource file path in cluster
       * folder
       */
      if (getConvWMMaxValues() == null)
      {
        LOG.log(Level.INFO, "Not found ConversionWorkManager info in the config file " + resFile.getAbsolutePath()
            + ", try to find in cluster folder.");
        String clusterFolderPath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("clusters").toString();
        File clusterFolder = new File(clusterFolderPath);
        if (clusterFolder.exists())
        {
          String[] clusterNames = clusterFolder.list();
          for (String clusterName : clusterNames)
          {
            LOG.log(Level.INFO,"cluster name: " + clusterName);
            String resFilePath = (new StringBuilder()).append(clusterFolderPath).append(File.separator).append(clusterName)
                .append(File.separator).append("resources-pme.xml").toString();
            resFile = new File(resFilePath);
            resourceConfig = new XMLConfiguration(resFile);
            if (getConvWMMaxValues() != null)
              break;
          }
          if(convWorkManagerMaxValues == null)
          {
            LOG.log(Level.WARNING,"Fail to get ConversionWorkManager info from cluster config files");
          }
          else
          {
            LOG.log(Level.INFO,"Get ConversionWorkManager info successfully");
          }
        }
        else
        {
          LOG.log(Level.WARNING,"Can not find cluster folder, fail to get ConversionWorkManager info");
        }
      }
    }
    catch (ConfigurationException e)
    {
      ConversionLogger.log(LOG, Level.WARNING, ErrCodeConstants.CONVERSION_WAS_CONFIG_LOAD_ERR, "Exception is got when loading config", e);
    }

  }

  private static final Integer[] getConvWMMaxValues()
  {
    int maxIdx = resourceConfig.getMaxIndex("workmanager:WorkManagerProvider.factories");
    for (int i = 0; i <= maxIdx; i++)
    {
      Configuration config = resourceConfig.subset((new StringBuilder()).append("workmanager:WorkManagerProvider.factories(").append(i)
          .append(")").toString());
      if ("ConversionWorkManager".equals(config.getString("[@name]")))
      {
        convWorkManagerMaxValues = new Integer[3];
        String value = config.getString("[@maxThreads]");
        convWorkManagerMaxValues[0] = new Integer(Integer.valueOf(value));
        value = config.getString("[@workReqQSize]");
        convWorkManagerMaxValues[1] = new Integer(Integer.valueOf(value));
        value = config.getString("[@workTimeout]");
        convWorkManagerMaxValues[2] = new Integer(Integer.valueOf(value));        
        return convWorkManagerMaxValues;
      }
    }
    LOG.log(Level.WARNING, "Fail to get ConversionWorkMananger max threads count, return 0");
    return null;
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

}
