/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.config;

import java.io.File;
import java.io.FileInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

/**
 * Helper class being used to parse the topology configuration file of AC node on smart cloud environment.
 * 
 */
public final class TopologyConfigHelper
{
  private static final Logger LOGGER = Logger.getLogger(TopologyConfigHelper.class.getName());

  private static final String CONFIG_FS_KEY = "ConfigFS";

  private static final String TOPOLOGY_CONFIG_FILE = "topology-shared.json";

  private static final String TOPOLOGY_PROP_KEY = "prop";

  private static final String TOPOLOGY_PROP_S2STOKEN_KEY = "s2stoken";

  private static final String TOPOLOGY_SERVER_KEY = "server";

  private static final String TOPOLOGY_SERVER_DOCS_KEY = "docs_be";

  private static String configFS;

  // Specifies the Docs server URL for the requests from IC server to Docs server.
  private static String docsServerUrl;

  // Specifies the s2s call token for the requests from IC server to Docs server.
  private static String s2sToken;

  static
  {
    loadConfig();
  }

  /**
   * Loads the topology configuration file of AC node on smart cloud environment.
   * 
   */
  private static void loadConfig()
  {
    FileInputStream fis = null;
    try
    {
      configFS = System.getProperty(CONFIG_FS_KEY);
      if (configFS == null)
      {
        LOGGER.log(Level.INFO, CONFIG_FS_KEY + " is not found as system property, checking environment variable");
        configFS = System.getenv(CONFIG_FS_KEY);
      }

      if (configFS != null)
      {
        File configFile = new File(configFS, TOPOLOGY_CONFIG_FILE);
        if (!configFile.exists())
        {
          configFile = new File("/opt/ll/runtime/config", TOPOLOGY_CONFIG_FILE);
        }

        if (configFile.exists() && configFile.isFile())
        {
          LOGGER.log(Level.INFO, "Parsing the configuration file " + configFile.getAbsolutePath());

          fis = new FileInputStream(configFile);
          JSONObject root = JSONObject.parse(fis);
          if (root != null)
          {
            JSONObject propJson = (JSONObject) root.get(TOPOLOGY_PROP_KEY);
            s2sToken = propJson != null ? (String) propJson.get(TOPOLOGY_PROP_S2STOKEN_KEY) : null;

            JSONObject serverJson = (JSONObject) root.get(TOPOLOGY_SERVER_KEY);
            docsServerUrl = serverJson != null ? (String) serverJson.get(TOPOLOGY_SERVER_DOCS_KEY) : null;

            LOGGER.log(Level.INFO, "Configuration items: docsServerUrl=" + docsServerUrl);
          }
        }
        else
        {
          LOGGER.log(Level.WARNING, "Configuration file " + configFile.getAbsolutePath() + " does not exist.");
        }
      }
      else
      {
        LOGGER.log(Level.INFO, CONFIG_FS_KEY + " is not found as a system property or system environment");
      }
    }
    catch (Throwable e)
    {
      LOGGER.log(Level.WARNING, "Exception happens when loading topology configuration of AC node on smart cloud environment", e);
    }
    finally
    {
      if (fis != null)
      {
        try
        {
          fis.close();
        }
        catch (Throwable ex)
        {
          LOGGER.log(Level.WARNING, "IO error happens when closing file input stream for configuration file", ex);
        }
      }
    }
  }

  /**
   * Returns the Docs server URL for the requests from IC server to Docs server.
   * 
   * @return
   */
  public static String getDocsServerUrl()
  {
    return docsServerUrl;
  }

  /**
   * Returns the s2s call token for the requests from IC server to Docs server.
   * 
   * @return
   */
  public static String getS2SToken()
  {
    return s2sToken;
  }
}
