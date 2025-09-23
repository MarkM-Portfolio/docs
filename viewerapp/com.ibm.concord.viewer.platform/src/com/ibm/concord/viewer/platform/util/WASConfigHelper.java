/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.HierarchicalConfiguration;
import org.apache.commons.configuration.XMLConfiguration;
import org.w3c.dom.Document;

import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

public final class WASConfigHelper
{
  private static final Logger LOG = Logger.getLogger(WASConfigHelper.class.getName());
  private static final String CONNECTIONS_CONFIG_FILE = "LotusConnections-config.xml";
  private static final String CONNECTIONS_CONFIG_FILE_PATH = "LotusConnections-config";
  private static String ssoDomain = null;
  private static Map<String, Integer> sslPortAssociations = null;
  private static final AdminService wasAdminService = AdminServiceFactory.getAdminService();
  private static XMLConfiguration cellVarConfig = null;
  private static XMLConfiguration resourceConfig = null;
  
  private static Integer[] vwWorkManagerMaxValues = null;
  private static String sslProtocol = null;
  
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
  
  static {
    loadConfig();
  }
  
  public static final Integer getViewerWorkManagerTimeout()
  {
	int ret = 150000;
	if (vwWorkManagerMaxValues!=null&&vwWorkManagerMaxValues[2]>1000)
		ret = vwWorkManagerMaxValues[2];
    return ret;
  }
  
  public static final String getWasInstallRoot()
  {
    return System.getProperty("was.install.root");
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
  
  private static void loadConfig()
  {
    try {
      File secFile;
      File idxFile;
      File resFile;
      File varFile;
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
        String secFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator).append("cells").append(File.separator).append(cellName).append(File.separator).append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator).append("cells").append(File.separator).append(cellName).append(File.separator).append("nodes").append(File.separator).append(nodeName).append(File.separator).append("serverindex.xml").toString();
        String resFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
                .append("cells").append(File.separator).append(cellName).append(File.separator).append("nodes").append(File.separator)
                .append(nodeName).append(File.separator).append("servers").append(File.separator).append(procName).append(File.separator)
                .append("resources-pme.xml").toString();
        String varFilePath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
            .append("cells").append(File.separator).append(cellName).append(File.separator).append("variables.xml").toString();
        String connectionsFilePath = new StringBuilder().append(rootPath).append(File.separator).append("config").append(File.separator).append("cells").append(File.separator).append(cellName).append(File.separator).append(CONNECTIONS_CONFIG_FILE_PATH).append(File.separator).append(CONNECTIONS_CONFIG_FILE).toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        resFile = new File(resFilePath);
        varFile = new File(varFilePath);
        sslProtocol = getSSLValue(new File(connectionsFilePath));
        LOG.info("The ssl protocol used is " + sslProtocol);
      }
      else {
        String secFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator).append("security.xml").toString();
        String idxFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator).append("serverindex.xml").toString();
        String resFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
                .append("resources-pme.xml").toString();
        String varFilePath = (new StringBuilder()).append(System.getProperty("user.install.root")).append(File.separator)
            .append("variables.xml").toString();
        secFile = new File(secFilePath);
        idxFile = new File(idxFilePath);
        resFile = new File(resFilePath);
        varFile = new File(varFilePath);
        procName = "server1";
      }
      
      cellVarConfig = new XMLConfiguration(varFile);
      
      resourceConfig = new XMLConfiguration(resFile);
      
      XMLConfiguration xmlConfig = new XMLConfiguration(secFile);
      Configuration config = getLTPAConfig(xmlConfig);
      if (config != null && config.getBoolean("[@enabled]"))
        ssoDomain = config.getString("[@domainName]");
      
      XMLConfiguration xmlConfig1 = new XMLConfiguration(idxFile);
      sslPortAssociations = Collections.unmodifiableMap(getHttpsAssocMap(xmlConfig1, procName));
      
      /*
       * Here try to parse XML and find out conversion work manager info, if not found, will try another resource file path in cluster
       * folder
       */
      if (getViewerWMMaxValues() == null)
      {
        LOG.log(Level.INFO, "Not found ViewerWorkManager info in the config file " + resFile.getAbsolutePath()
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
            if (getViewerWMMaxValues() != null)
              break;
          }
          if(vwWorkManagerMaxValues == null)
          {
            LOG.log(Level.WARNING,"Fail to get ViewerWorkManager info from cluster config files");
          }
          else
          {
            LOG.log(Level.INFO,"Get ViewerWorkManager info successfully");
          }
        }
        else
        {
          LOG.log(Level.WARNING,"Can not find cluster folder, fail to get ViewerWorkManager info");
        }
      }
    }
    catch (ConfigurationException e)
    {
      LOG.log(Level.WARNING,"Exception is got when loading config", e);
    }
  }
  
  public static String getSSLProtocol()
  {
    return sslProtocol;
  }
  
  private static String getSSLValue(File connectionsFile)
  {
    String override = null;
    try
    {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc = builder.parse(connectionsFile);

      XPathFactory xpathFactory = XPathFactory.newInstance();
      XPath xpath = xpathFactory.newXPath();
      NamespaceContext nsContext = new ConnectionsConfigNSContext();
      xpath.setNamespaceContext(nsContext);
      XPathExpression expr = null;
      expr = xpath.compile("//config:properties/config:genericProperty[@name='com.ibm.connections.SSLProtocol']");
      override = (String) expr.evaluate(doc, XPathConstants.STRING);
      return override;
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "Unable to locate LotusConnections-config.xml to parse com.ibm.connections.SSLProtocol: " + e.getMessage());
    }
    catch (Exception e1)
    {
      LOG.log(Level.SEVERE, "Unable to initialize Connections configuration to parse com.ibm.connections.SSLProtocol: " + e1.getMessage());
    }
    return null;
  }
  
  private static final Integer[] getViewerWMMaxValues()
  {
    int maxIdx = resourceConfig.getMaxIndex("workmanager:WorkManagerProvider.factories");
    for (int i = 0; i <= maxIdx; i++)
    {
      Configuration config = resourceConfig.subset((new StringBuilder()).append("workmanager:WorkManagerProvider.factories(").append(i)
          .append(")").toString());
      if ("ViewerWorkManager".equals(config.getString("[@name]")))
      {
        vwWorkManagerMaxValues = new Integer[3];
        String value = config.getString("[@maxThreads]");
        vwWorkManagerMaxValues[0] = new Integer(Integer.valueOf(value));
        value = config.getString("[@workReqQSize]");
        vwWorkManagerMaxValues[1] = new Integer(Integer.valueOf(value));
        value = config.getString("[@workTimeout]");
        vwWorkManagerMaxValues[2] = new Integer(Integer.valueOf(value));        
        return vwWorkManagerMaxValues;
      }
    }
    LOG.log(Level.WARNING, "Fail to get ViewerWorkMananger max threads count, return 0");
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
        return (HierarchicalConfiguration)config;
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
      Integer integer1 = hierConfig.getInteger((new StringBuilder()).append("specialEndpoints(").append(j).append(").endPoint.[@port]").toString(), integer);
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
