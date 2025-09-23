/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class ConcordConfig
{
  private static final Logger LOG = Logger.getLogger(ConcordConfig.class.getName());

  private static final ConcordConfig _instance = new ConcordConfig();

  private ReadWriteLock readWriteLock = new ReentrantReadWriteLock();

  public static final String CONFIG_FS_KEY = "ConcordFS";

  public static final String CONCORD_CONFIG_FILE = "concord-config.json";

  public static final String DOCS_CONFIG_JSON_SUB_DIR = "IBMDocs-config";

  public static final String INFO_CENTER_URL = "http://www.ibm.com/support/knowledgecenter/SSFHJY/welcome";

  private static final String ExternalCommentService = "ExternalCommentService";

  private String installRoot;

  private String configFS;

  private JSONObject rootConfig;

  private String sharedDataRoot;

  private String sharedDataName;

  public static ConcordConfig getInstance()
  {
    return _instance;
  }

  private ConcordConfig()
  {
  }

  public String getInstallRoot()
  {
    return installRoot;
  }

  public String getConfigDirectory()
  {
    return configFS;
  }

  public JSONObject getSubConfig(String key)
  {
    return (JSONObject) rootConfig.get(key);
  }

  public void setSubConfig(String key, String configKey, String configValue)
  {
    JSONObject subConfig = (JSONObject) rootConfig.get(key);
    subConfig.put(configKey, configValue);
  }

  public String getSharedDataRoot()
  {
    return sharedDataRoot;
  }

  public String getSharedDataName()
  {
    return sharedDataName;
  }

  public JSONArray getConfigList(String key)
  {
    LOG.entering(this.getClass().getName(), "getConfigList");
    readWriteLock.readLock().lock();
    JSONArray configList = new JSONArray();
    try
    {
      configList = (JSONArray) rootConfig.get(key);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to get config {0} array !!!!", new Object[] { key });
    }
    finally
    {
      readWriteLock.readLock().unlock();
    }
    LOG.exiting(this.getClass().getName(), "getConfigList");
    return configList;
  }

  public void addConfigList(String key, String configValue)
  {
    LOG.entering(this.getClass().getName(), "setConfigList");
    readWriteLock.writeLock().lock();
    try
    {
      JSONArray configList = (JSONArray) rootConfig.get(key);
      if (!configList.contains(configValue))
      {
        configList.add(configValue);
        updateConfigFile();
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to set config {0} {1}!!!!", new Object[] { key, configValue });
    }
    finally
    {
      readWriteLock.writeLock().unlock();
    }
    LOG.exiting(this.getClass().getName(), "setConfigList");
  }

  public void removeConfigList(String key, String configValue)
  {
    LOG.entering(this.getClass().getName(), "removeConfigList");
    readWriteLock.writeLock().lock();
    try
    {
      JSONArray configList = (JSONArray) rootConfig.get(key);
      if (configList.contains(configValue))
      {
        configList.remove(configValue);
        updateConfigFile();
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to remove config {0} {1}!!!!", new Object[] { key, configValue });
    }
    finally
    {
      readWriteLock.writeLock().unlock();
    }
    LOG.exiting(this.getClass().getName(), "removeConfigList");
  }

  /**
   * Get the s2s token of Docs server for s2s call from others servers.
   * 
   * @return
   */
  public String getS2SToken()
  {
    JSONObject s2sConfig = (JSONObject) rootConfig.get("s2s");
    return (s2sConfig != null) ? (String) s2sConfig.get("s2s_token") : null;
  }

  public boolean isCookiesEnforceSecure()
  {
    JSONObject cookieConfig = (JSONObject) rootConfig.get("cookies");

    if ((cookieConfig != null))
    {
      String secureStr = (String) cookieConfig.get("enforce_secure");
      if ("true".equalsIgnoreCase(secureStr))
      {
        return true;
      }
    }
    return false;
  }

  /**
   * 
   */
  public void updateConfigFile()
  {
    if (configFS != null)
    {
      File configFile = new File(configFS + File.separator + CONCORD_CONFIG_FILE);
      if (configFile.exists() && configFile.isFile())
      {
        FileOutputStream fos = null;
        try
        {
          fos = new FileOutputStream(configFile);
          rootConfig.serialize(fos, true);
        }
        catch (FileNotFoundException e)
        {
          ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.CONFIG_FILE_ERROR, "Config file: " + configFile.getAbsolutePath()
              + " must exist and be a file for system to work.", e);
        }
        catch (IOException e)
        {
          ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.CONFIG_FILE_ERROR, "Malformed config file: " + configFile.getAbsolutePath()
              + " can not be update successfully.", e);
        }
        finally
        {
          if (fos != null)
          {
            try
            {
              fos.close();
            }
            catch (IOException e)
            {
              LOG.log(Level.WARNING, "io error when closing " + configFile.getAbsolutePath());
            }
          }
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.");
      }
    }
    else
    {
      LOG.log(Level.WARNING, "System Property: " + CONFIG_FS_KEY + " has not been set. Needed for system to work");
    }
  }

  private String resolve(String path)
  {
    if (File.separatorChar == '\\')
    {
      if (path.indexOf('/') != -1)
      {
        path = path.replace('/', '\\');
      }
      if (path.endsWith("\\"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    else
    {
      if (path.endsWith("/"))
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    return path;
  }

  public boolean isCloud()
  {
    JSONObject typeahead = (JSONObject) rootConfig.get("typeahead");
    if (typeahead != null)
    {
      String value = (String) typeahead.get("is_cloud");
      return "true".equalsIgnoreCase(value);
    }
    return false;
  }

  public boolean isCommentExternal()
  {
    JSONObject commentObj = (JSONObject) rootConfig.get(ExternalCommentService);
    if (commentObj != null)
    {
      String value = (String) commentObj.get("enabled");
      return "true".equalsIgnoreCase(value);
    }
    return false;
  }

  public String getMentionUsersUri()
  {
    JSONObject commentObj = (JSONObject) rootConfig.get(ExternalCommentService);
    if (commentObj != null)
    {
      JSONObject apiConfig = (JSONObject) commentObj.get("apiConfig");
      if (apiConfig != null)
      {
        String userlist_api = (String) apiConfig.get("MentionUsersUri");
        return userlist_api;
      }
    }
    return "";
  }

  public String getMentionNotificationUri()
  {
    JSONObject commentObj = (JSONObject) rootConfig.get(ExternalCommentService);
    if (commentObj != null)
    {
      JSONObject apiConfig = (JSONObject) commentObj.get("apiConfig");
      if (apiConfig != null)
      {
        String notification_api = (String) apiConfig.get("MentionNotificationUri");
        return notification_api;
      }
    }
    return "";
  }

  private String getHelpUrl(String repository, String repositoryType, String key, String defaultUrl)
  {
    String url = defaultUrl;
    if (repository != null && (repository.equalsIgnoreCase("external.cmis") || repositoryType.equalsIgnoreCase("external.rest")))
    {
      url = INFO_CENTER_URL;
      key = "infocenter_url";
    }

    JSONObject helpConfig = ConcordConfig.getInstance().getSubConfig("Help");
    if (helpConfig != null)
    {
      if (helpConfig.get(key) != null)
      {
        url = (String) helpConfig.get(key);
      }
    }
    return url;
  }

  public String getTextHelpUrl(String repository, String repositoryType)
  {
    return getHelpUrl(repository, repositoryType, "text_helpurl", "/help/topic/com.ibm.help.ibmdocs.doc/text/document/documents_frame.html");
  }

  public String getPresHelpUrl(String repository, String repositoryType)
  {
    return getHelpUrl(repository, repositoryType, "pres_helpurl",
        "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/presentation/presentations_frame.html");
  }

  public String getSheetHelpUrl(String repository, String repositoryType)
  {
    return getHelpUrl(repository, repositoryType, "sheet_helpurl",
        "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/spreadsheet/spreadsheets_frame.html");
  }

  public String getECMHelpUrl(String repository, String repositoryType)
  {
    String url = "/kc/SSFHJY_2.0.0/";
    JSONObject helpConfig = ConcordConfig.getInstance().getSubConfig("Help");
    if (helpConfig != null)
    {
      if (helpConfig.get("ecm_help_root") != null)
      {
        url = (String) helpConfig.get("ecm_help_root");
      }
    }
    return url;
  }

  public boolean isCloudTypeAhead()
  {
    boolean isCloudTypeahead = false;
    JSONObject typeahead = ConcordConfig.getInstance().getSubConfig("typeahead");
    if (typeahead != null)
    {
      String value = (String) typeahead.get("is_cloud");
      isCloudTypeahead = "true".equalsIgnoreCase(value);
    }
    return isCloudTypeahead;
  }

  public String getBetasStr()
  {
    String betasStr = "";
    JSONObject betas = ConcordConfig.getInstance().getSubConfig("beta_features");
    if (betas != null)
    {
      Object betasObj = betas.get("beta");
      if (betasObj != null)
      {
        betasStr = betasObj.toString();
      }
    }
    return betasStr;
  }

  public boolean isReloadLog()
  {
    boolean reloadLog = false;
    JSONObject logConfig = ConcordConfig.getInstance().getSubConfig("log");
    if (logConfig != null)
    {
      Object rf = logConfig.get("reloadLog");
      if (rf != null)
        reloadLog = Boolean.valueOf(rf.toString());
    }
    return reloadLog;
  }

  public String getBssCoreBackEnd()
  {
    if (!isCloud())
    {
      return null;
    }
    JSONObject topologyConfig = (JSONObject) rootConfig.get("topology_shared");
    String value = (String) topologyConfig.get("bss_be_url");
    try
    {
      new URL(value);
      LOG.log(Level.FINE, "Get bss core backend url: " + value);
      return value;
    }
    catch (MalformedURLException e)
    {
      LOG.log(Level.WARNING, "Invalid bss core backend url: " + value);
      return null;
    }
  }

  public String getVirtualHostsJunctionDomain()
  {
    if (!isCloud())
    {
      return null;
    }
    JSONObject topologyConfig = (JSONObject) rootConfig.get("topology_shared");
    String value = (String) topologyConfig.get("virtual_hosts_junction_domain");
    LOG.log(Level.FINE, "Get virtual hosts junction domain: " + value);
    return value;
  }

  public void init(File configFile)
  {
    if (configFile.exists() && configFile.isFile())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(configFile);
        JSONObject tempConfigObj = JSONObject.parse(fis);
        rootConfig = tempConfigObj;

      }
      catch (FileNotFoundException e)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.CONFIG_FILE_ERROR, "Config file: " + configFile.getAbsolutePath()
            + " must exist and be a file for system to work.", e);
      }
      catch (IOException e)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.CONFIG_FILE_ERROR, "Malformed config file: " + configFile.getAbsolutePath()
            + " can not be parsed successfully.", e);
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            LOG.log(Level.WARNING, "io error when closing " + configFile.getAbsolutePath());
          }
        }
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.");
    }
  }

  public void init()
  {
    installRoot = WASConfigHelper.getCellVariable("DOCS_INSTALL_ROOT");
    String wasInstallRoot = WASConfigHelper.getWasInstallRoot();
    if (wasInstallRoot != null)
    {
      configFS = WASConfigHelper.getDocsConfigPath();
      LOG.info("DOCS_CONFIG_PATH: " + configFS);
    }
    else if (installRoot != null)
    {
      LOG.info("DOCS_INSTALL_ROOT: " + installRoot);
      installRoot = resolve(installRoot);
      configFS = installRoot + File.separator + "config";
    }
    else
    {
      configFS = System.getProperty(CONFIG_FS_KEY);
      if (configFS == null)
      {
        LOG.info(CONFIG_FS_KEY + " not found as System property, checking environment variables");
        configFS = System.getenv(CONFIG_FS_KEY);
      }
    }

    sharedDataRoot = WASConfigHelper.getCellVariable(ConfigConstants.DOCS_SHARED_DATA_ROOT);
    if (sharedDataRoot == null)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.WAS_CONFIG_ERROR,
          "Websphere Variables DOCS_SHARED_DATA_ROOT is not configured.");
    }
    sharedDataRoot = resolve(sharedDataRoot);
    sharedDataName = WASConfigHelper.getCellVariable(ConfigConstants.DOCS_SHARED_DATA_NAME);
    if (sharedDataName == null)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.WAS_CONFIG_ERROR, "Websphere Variables APP_NAME is not configured.");
    }
    if (configFS != null)
    {
      File configFile = new File(configFS + File.separator + CONCORD_CONFIG_FILE);
      init(configFile);
    }
    else
    {
      LOG.log(Level.WARNING, "System Property: " + CONFIG_FS_KEY + " has not been set. Needed for system to work");
    }
  }
}
