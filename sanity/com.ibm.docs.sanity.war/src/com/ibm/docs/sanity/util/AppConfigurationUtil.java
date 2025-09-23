package com.ibm.docs.sanity.util;

import java.io.File;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;

public class AppConfigurationUtil
{
  public static String getAppConfigJsonPath(String appName) throws ConfigurationException
  {
    String configFS = ServerTypeUtil.IBMDocsConfigPath;
    String filePrefix = appName;
    if( "docs".equalsIgnoreCase(appName) )
      filePrefix = "concord";
    String configPath = new PathUtil(configFS, File.separator + filePrefix + "-config.json")
        .resolveToAbsolutePath();

    return configPath;
  }
}
