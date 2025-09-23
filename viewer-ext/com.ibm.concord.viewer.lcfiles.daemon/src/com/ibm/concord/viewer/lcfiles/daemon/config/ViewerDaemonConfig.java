/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lcfiles.daemon.config;

import java.io.File;
import java.io.FileInputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;

/**
 * Viewer daemon configuration file management class.
 * 
 */
public class ViewerDaemonConfig
{
  private static final Logger LOG = Logger.getLogger(ViewerDaemonConfig.class.getName());

  // public static final String LOTUS_CONNECTIONS_CONFIG_NAME = "LotusConnections-config";

  private static final String CONFIG_FILE_FOLDER = "IBMDocs-config";

  public static final String VIEWER_DAEMON_CONFIG_DIR_KEY = "VIEWER_DAEMON_CONFIG_DIR";

  public static final String VIEWER_DAEMON_CONFIG_FILE = "viewer-daemon-config.json";

  private static final String SERVER_URL_KEY = "server_url";

  private static final String S2S_TOKEN_KEY = "s2s_token";

  private static final String J2C_ALIAS_KEY = "j2c_alias";

  private static final String FILENET_REPOSITORY_ID = "filenet_repository_id";

  private static final String IGNORE_EVENT_KEY = "ignore_event";

  private static final String MAX_CONNECTION_KEY = "max_connection";

  private static final String MAX_CONNECTION_PER_HOST_KEY = "max_conn_per_host";

  private static final String SOCKET_TIMEOUT_KEY = "socket_timeout";

  private static final String CONNECTION_TIMEOUT_KEY = "connection_timeout";

  private static final String CONNECTION_MANAGER_TIMEOUT_KEY = "connection_manager_timeout";

  private String configFileDir;

  private JSONObject root;

  // Specifies whether ignore the uploading events or not.
  private boolean isIgnoreEvent = false;

  // Specifies the Viewer server URL for the requests from IC server to Viewer server.
  private String viewerServerUrl;

  // Specifies the s2s call token for the requests from IC server to Viewer server.
  private String s2sToken;

  // Specifies the j2c alias for the requests from IC server to Viewer server, only needed when authType is "SAML".
  private String j2cAlias;

  // The max HTTP connection number.
  private int maxConnection = 100;

  // The max HTTP connection number per host.
  private int maxConnectionPerHost = 100;

  // Time out value for getting HTTP response. TIME UNIT is millisecond.
  private int socketTimeOut = 10000;

  // Time out value for establishing HTTP connection. TIME UNIT is millisecond.
  private int connectionTimeOut = 10000;

  // Time out value for getting connection from connection pool of connection manager. TIME UNIT is millisecond.
  private long connManagerTimeOut = 10000;

  private boolean isSmartCloud = false;

  private String filenetRepositoryId;

  private static ViewerDaemonConfig _instance = new ViewerDaemonConfig();

  /**
   * Private constructor of ViewerDaemonConfig to support singleton instance.
   * 
   */
  private ViewerDaemonConfig()
  {
    initialize();
  }

  /**
   * Get the single ViewerDaemonConfig instance.
   * 
   * @return
   */
  public static ViewerDaemonConfig getInstance()
  {
    return _instance;
  }

  /**
   * Reads the daemon configuration file and parses the configuration JSON object.
   * 
   */
  private void initialize()
  {
    // In smart cloud environment, read the configuration items from topology configuration file.
    if (TopologyConfigHelper.isCloud())
    {
      viewerServerUrl = TopologyConfigHelper.getViewerServerUrl();
      s2sToken = TopologyConfigHelper.getS2SToken();
      // No need j2cAlias for Smart Cloud.
      j2cAlias = "";
      LOG.log(Level.INFO, "Get the configuration items from topology configuration file: ViewerServerUrl=" + viewerServerUrl);
      isSmartCloud = true;
      return;
    }

    // Find the configuration file from folder "LotusConnections-config" in cell firstly.
    String cellPath = WASConfigHelper.getCellPath();
    if (cellPath != null)
    {
      File configFileFolder = new File(cellPath, CONFIG_FILE_FOLDER);
      File configFile = new File(configFileFolder, VIEWER_DAEMON_CONFIG_FILE);
      if (configFile.exists() && configFile.isFile())
      {
        configFileDir = configFileFolder.getAbsolutePath();
      }
    }

    if (configFileDir == null)
    {
      // Find the configuration file path from the cell level variable.
      configFileDir = WASConfigHelper.getCellVariable(VIEWER_DAEMON_CONFIG_DIR_KEY);
    }

    if (configFileDir == null)
    {
      LOG.log(Level.INFO, VIEWER_DAEMON_CONFIG_DIR_KEY + " is not found as Websphere cell variable, checking JVM system property");
      configFileDir = System.getProperty(VIEWER_DAEMON_CONFIG_DIR_KEY);

      if (configFileDir == null)
      {
        LOG.log(Level.INFO, VIEWER_DAEMON_CONFIG_DIR_KEY + " is not found as JVM system property, checking system environment variables");
        configFileDir = System.getenv(VIEWER_DAEMON_CONFIG_DIR_KEY);
      }
    }

    if (configFileDir != null)
    {
      File configFile = new File(configFileDir, VIEWER_DAEMON_CONFIG_FILE);
      if (configFile.exists() && configFile.isFile())
      {
        LOG.log(Level.INFO, "Find the configuration file here: " + configFile.getAbsolutePath());

        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          root = JSONObject.parse(fis);
          if (root != null)
          {
            LOG.log(Level.INFO, "Viewer daemon configuration: " + root.toString());

            viewerServerUrl = (String) root.get(SERVER_URL_KEY);
            s2sToken = (String) root.get(S2S_TOKEN_KEY);
            filenetRepositoryId = (String) root.get(FILENET_REPOSITORY_ID);
            j2cAlias = (String) root.get(J2C_ALIAS_KEY);
            isIgnoreEvent = Boolean.parseBoolean((String) root.get(IGNORE_EVENT_KEY));

            String maxConnectionStr = (String) root.get(MAX_CONNECTION_KEY);
            String maxConnectionPerHostStr = (String) root.get(MAX_CONNECTION_PER_HOST_KEY);
            String socketTimeoutStr = (String) root.get(SOCKET_TIMEOUT_KEY);
            String connTimeoutStr = (String) root.get(CONNECTION_TIMEOUT_KEY);
            String connMgrTimeoutStr = (String) root.get(CONNECTION_MANAGER_TIMEOUT_KEY);

            maxConnection = (maxConnectionStr != null) ? Integer.valueOf(maxConnectionStr) : maxConnection;
            maxConnectionPerHost = (maxConnectionPerHostStr != null) ? Integer.valueOf(maxConnectionPerHostStr) : maxConnectionPerHost;
            socketTimeOut = (socketTimeoutStr != null) ? Integer.valueOf(socketTimeoutStr) : socketTimeOut;
            connectionTimeOut = (connTimeoutStr != null) ? Integer.valueOf(connTimeoutStr) : connectionTimeOut;
            connManagerTimeOut = (connMgrTimeoutStr != null) ? Long.valueOf(connMgrTimeoutStr) : connManagerTimeOut;

            LOG.log(Level.INFO, "Viewer daemon parameters: ViewerServerUrl=" + viewerServerUrl + ", isIgnoreEvent=" + isIgnoreEvent
                + ", maxConnection=" + maxConnection + ", maxConnectionPerHost=" + maxConnectionPerHost + ", socketTimeOut="
                + socketTimeOut + ", connectionTimeOut=" + connectionTimeOut + ", connManagerTimeOut=" + connManagerTimeOut
                + ", filenetRepositoryId=" + filenetRepositoryId);
          }
        }
        catch (Exception ex)
        {
          LOG.log(Level.SEVERE, "Error happens while reading the config file " + configFile.getAbsolutePath(), ex);
        }
        finally
        {
          if (fis != null)
          {
            try
            {
              fis.close();
            }
            catch (Exception ex)
            {
              LOG.log(Level.WARNING, "IO error happens when closing file input stream for file " + configFile.getAbsolutePath(), ex);
            }
          }
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath() + " does not exist.");
      }
    }
    else
    {
      LOG.log(Level.WARNING, VIEWER_DAEMON_CONFIG_DIR_KEY + " is not found as a System Property or Websphere variable.");
    }
  }

  /**
   * Returns the Viewer server URL for the requests from IC server to Viewer server.
   * 
   * @return
   */
  public String getViewerServerUrl()
  {
    return viewerServerUrl;
  }

  /**
   * Returns the s2s call token for the requests from IC server to Viewer server.
   * 
   * @return
   */
  public String getS2SToken()
  {
    return s2sToken;
  }

  /**
   * Returns the j2c alias for the requests from IC server to Viewer server.
   * 
   * @return
   */
  public String getJ2cAlias()
  {
    return j2cAlias;
  }

  /**
   * Return the filenet repository id. By default, it would be "ICObjectStore".
   * 
   * @return
   */
  public String getFilenetRepositoryId()
  {
    return filenetRepositoryId;
  }

  /**
   * Returns if ignore the uploading events or not.
   * 
   * @return
   */
  public boolean isIgnoreEvent()
  {
    return isIgnoreEvent;
  }

  /**
   * Returns the max HTTP connection number.
   * 
   * @return
   */
  public int getMaxConnection()
  {
    return maxConnection;
  }

  /**
   * Returns the max HTTP connection number per host.
   * 
   * @return
   */
  public int getMaxConnectionPerHost()
  {
    return maxConnectionPerHost;
  }

  /**
   * Returns time out value for getting HTTP response.
   * 
   * @return
   */
  public int getSocketTimeOut()
  {
    return socketTimeOut;
  }

  /**
   * Returns time out value for establishing HTTP connection.
   * 
   * @return
   */
  public int getConnectionTimeOut()
  {
    return connectionTimeOut;
  }

  /**
   * Returns time out value for getting connection from connection pool of connection manager.
   * 
   * @return
   */
  public long getConnManagerTimeOut()
  {
    return connManagerTimeOut;
  }

  /**
   * Returns if the current environment is smart-cloud
   * 
   * @return
   */
  public boolean isSmartCloud()
  {
    return this.isSmartCloud;
  }
}
