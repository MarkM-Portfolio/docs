package com.ibm.docs.lcfiles.daemon.config;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.XMLConfiguration;


public class LotusConnectionsConfig
{
  private static final Logger LOG = Logger.getLogger(LotusConnectionsConfig.class.getName());
  
  public static final String LOTUS_CONNECTIONS_CONFIG_NAME = "LotusConnections-config";
  
  public static final String LOTUS_CONNECTIONS_CONFIG_FILE = "LotusConnections-config.xml";
  
  private boolean isCCMEnabled = false;
  
  private static final LotusConnectionsConfig _instance = new LotusConnectionsConfig();

  private LotusConnectionsConfig()
  {
    initialize();
  }
  
  private void initialize()
  {
    // In smart cloud environment, CCM is disabled
    if (TopologyConfigHelper.getS2SToken() != null && TopologyConfigHelper.getDocsServerUrl() != null)
    {
      isCCMEnabled = false;
      return;
    }    
    
    String cellPath = WASConfigHelper.getCellPath();
    if (cellPath != null)
    {
      File lccConfigFileFolder = new File(cellPath, LOTUS_CONNECTIONS_CONFIG_NAME);
      File lccConfigFile = new File(lccConfigFileFolder, LOTUS_CONNECTIONS_CONFIG_FILE);
      isCCMEnabled = isDocsEnabledInLCCConfig(lccConfigFile);
    }
    else
    {
      LOG.log(Level.WARNING, "Does not found cells configuration folder!");
    }    
    
  }
  
  public static LotusConnectionsConfig getInstance()
  {
    return _instance;
  }
  
  public boolean isCCMEnabled()
  {
    return isCCMEnabled;
  }  
  
  private boolean isDocsEnabledInLCCConfig(File lccConfigFile)
  {
    boolean enabled = false;    
    if (lccConfigFile.exists() && lccConfigFile.isFile())
    {
      try
      {
        XMLConfiguration lccConfig = new XMLConfiguration(lccConfigFile);
        int i = lccConfig.getMaxIndex("sloc:serviceReference");
        boolean found = false;
        for (int j = 0; j <= i; j++)
        {
          Configuration config = lccConfig.subset((new StringBuilder()).append("sloc:serviceReference(").append(j).append(")").toString());
          if ("docs".equalsIgnoreCase(config.getString("[@serviceName]")))
          {
            found = true;
            String enabledStr = config.getString("[@enabled]");
            enabled = Boolean.valueOf(enabledStr);
            LOG.log(Level.INFO, "got sloc:serviceReference/enabled when serviceName=docs in config file LotusConnections-config.xml: ", enabledStr);
            break;
          }
        }
        if(!found)
        {
          LOG.log(Level.INFO, "did not get sloc:serviceReference/enabled when serviceName=docs in config file LotusConnections-config.xml!!!");
        }       
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "Exception is got when loading config file LotusConnections-config.xml", e);
      }
    }
    else
    {
      LOG.log(Level.WARNING, "The config file LotusConnections-config.xml does not exist!");
    }
    
    return enabled;
  }  
}
