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
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
//import com.ibm.concord.viewer.gatekeeper.ViewerGatekeeper;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class ViewerConfig
{
  private static final String SUBKEY_FILE_THUMBNAIL = "file_thumbnail";

  private static final String SUBKEY_IMAGE_CACHE = "viewer_cache";

  private static final String KEY_CONVERT_ON_UPLOAD = "convert_on_upload";

  private static final String SUBKEY_MULTI_CONVERT = "multi-convert";

  private static final String KEY_POLICY = "policy";

  private static final String SUBKEY_VIEW_RULE = "view_rule";

  private static final String KEY_ASYNC_UPLOAD = "async_upload";

  private static final String SUBKEY_MAX_THREAD_COUNT = "max_thread_count";
  
  private ReadWriteLock readWriteLock = new ReentrantReadWriteLock();

  public enum ConvertType {
    VIEW, THUMBNAIL
  }

  public enum ApplicationType {
    TEXT, PRES, SHEET
  }

  public enum RepositoryType {
    LOCAL("viewer.storage"), VERSE_ATTACHMENT("mail"), FILES("lcfiles"), CCM("ecm"), INOTES("tempstorage"), VERSE_FILES_LINK("vsfiles");

    private String id;

    RepositoryType(String id)
    {
      this.id = id;
    }

    public String getId()
    {
      return id;
    }
  }

  private static final Logger LOG = Logger.getLogger(ViewerConfig.class.getName());

  public static final String CONFIG_FS_KEY = "ViewerFS";

  public static final String VIEWER_CONFIG_FILE = "viewer-config.json";

  public static final String ON_PREMISE = "On-premise";

  public static final String LOCALTEST = "localtest";

  public static final String SMART_CLOUD = "smart_cloud";

  public static final String VIEWERNEXT = "verse";

  private static final String CONFIG_FILE_FOLDER = "IBMDocs-config";

  public static final String FAST_DOWNLOAD_CONFIG = "IHS_fast_download";

  public static final String CACHE_ROOT_ALIAS = "cache_root_alias";

  public static final String EDITOR_INTEGRATION = "docs_integration";

  public static final String EDITOR_ENABLED = "docs_enabled";

  public static final String EDITOR_EXCEPTION_TYPE = "doc_not_supported_by_docs";

  public static final String EDITOR_URI = "docs_context_root";

  public static final String EDITOR_HOST = "host";

  private static final String KEY_DISPLAY_MODE = "display_mode";

  private static final String SUBKEY_FULLVIEWER_ENABLED = "enable_fullviewer";

  private static final int DEFAULT_MAX_THREAD_COUNT = 50;

  private static final int DEFAULT_ASYNC_TIMEOUT = 60000;

  private static final String SUBKEY_TIMEOUT = "time_out";

  private static final String KEY_BUILD_INFO = "build-info";

  private static final String KEY_SHARED_STORAGES = "shared-storages";

  private String installRoot;

  private String viewerFS;

  private JSONObject rootConfig;

  private static ViewerConfig _instance;

  private String sharedDataRoot;

  private String localDataRoot;

  private String sharedDataName;

  private String localDataName;

  private String docsSharedDataName;

  private boolean isSnapshotMode;

  private boolean isPDFJsViewMode;
  
  private boolean isPDFCopyDisabled;

  private String viewRule;

  private String ecmJ2cAlias;

  private String docsJ2cAlias;

  private String deploy_env;

  private boolean isFullViewerSupported;

  private int maxThreadCount;

  private int asyncTimeout;

  private Boolean textMultiConvert = Boolean.FALSE;

  private Boolean presMultiConvert = Boolean.FALSE;

  private Boolean sheetMultiConvert = Boolean.FALSE;

  private JSONObject buildInfoConfig;

  private Boolean isVerseEnv = Boolean.FALSE;

  private int img2html_maxQueueSize = Integer.MAX_VALUE;

  private long img2html_sendReqInterval = 5 * 1000;

  private int img2html_logPrintFrequency = 50;

  private boolean img2html_cleanImgCache = true;

  private static String DOCS_DRAFT_HOME = "";
  
  private boolean isPDFRangeDisabled;

  private JSONObject pDFAgentList;
  
  private static String[] browserArray = { "IE", "Mozilla", "FF", "Opera", "WebKit", "Chrome", "Safari" };

  private static final List<String> browserList = Arrays.asList(browserArray);

  public static ViewerConfig getInstance()
  {
    if (_instance == null)
    {
      _instance = new ViewerConfig();
    }
    return _instance;
  }

  public static ViewerConfig getInstance(InputStream is)
  {
    _instance = new ViewerConfig(is);
    return _instance;
  }

  private ViewerConfig()
  {
    init();
  }

  private ViewerConfig(InputStream is)
  {
    init2(is);
  }

  public boolean isSnapshotMode()
  {
    return isSnapshotMode;
  }

  public boolean isPDFJsViewMode()
  {
    return isPDFJsViewMode;
  }

  public boolean isPDFCopyDisabled()
  {
    return isPDFCopyDisabled;
  }

  public String getConfigDirectory()
  {
    return viewerFS;
  }

  public String getEcmJ2cAlias()
  {
    return ecmJ2cAlias;
  }

  public String getInstallRoot()
  {
    return installRoot;
  }

  public JSONObject getSubConfig(String key)
  {
    if (rootConfig == null)
      LOG.log(Level.SEVERE, "Error, the viewer config file was not loaded from " + viewerFS + ", rootConfig is null");
    return (JSONObject) rootConfig.get(key);
  }

  public String getSharedDataRoot()
  {
    return sharedDataRoot;
  }

  public String getDataRoot(CacheType type)
  {
    String dataRoot = null;
    switch (type)
      {
        case NFS :
          dataRoot = sharedDataRoot;
          break;
        case LOCAL :
          dataRoot = localDataRoot;
      }
    return dataRoot;
  }

  public String getSharedDataName(CacheType type)
  {
    String datatName = null;
    switch (type)
      {
        case NFS :
          datatName = sharedDataName;
          break;
        case LOCAL :
          datatName = localDataName;
      }
    return datatName;
  }

  public String getDocsSharedDataName()
  {
    return docsSharedDataName;
  }

  public String getViewRule()
  {
    return viewRule;
  }

  public boolean isFullViewerSupported()
  {
    return isFullViewerSupported;
  }

  public void setSubConfig(String key, String configKey, String configValue)
  {
    JSONObject subConfig = (JSONObject) rootConfig.get(key);
    subConfig.put(configKey, configValue);
  }

  public boolean isOnpremise()
  {
    return ON_PREMISE.equalsIgnoreCase(getEnv());
  }

  private String getEnv()
  {
    if (deploy_env != null)
    {
      return deploy_env;
    }

    JSONObject envConfig = (JSONObject) rootConfig.get("deployment");
    if (envConfig != null && envConfig.get("env") != null)
    {
      deploy_env = (String) envConfig.get("env");
      if (deploy_env == null || deploy_env.isEmpty())
      {
        deploy_env = ON_PREMISE;
        LOG.log(Level.WARNING, "Failed to get the deployment configuration, using the default setting as {0}", deploy_env);
      }
      else
      {
        LOG.log(Level.INFO, "Viewer is configured to be running on {0}.", deploy_env);
      }
    }
    return deploy_env;
  }

  public boolean isLocalEnv()
  {
    return LOCALTEST.equalsIgnoreCase(getEnv());
  }

  public boolean isSmartCloud()
  {
    return SMART_CLOUD.equalsIgnoreCase(getEnv());
  }

  public boolean supportMultiConvert(String appType)
  {
    LOG.entering(ViewerConfig.class.getName(), "supportMultiConvert", appType);

    boolean ret = false;
    if (ApplicationType.TEXT.name().equalsIgnoreCase(appType))
    {
      ret = textMultiConvert;
    }
    else if (ApplicationType.PRES.name().equalsIgnoreCase(appType))
    {
      ret = presMultiConvert;
    }
    else if (ApplicationType.SHEET.name().equalsIgnoreCase(appType))
    {
      ret = sheetMultiConvert;
    }

    LOG.exiting(ViewerConfig.class.getName(), "supportMultiConvert", ret);
    return ret;
  }

  public boolean doUploadConvert(ConvertType type)
  {
    boolean ret = false;
    try
    {
      JSONObject o = (JSONObject) rootConfig.get(KEY_CONVERT_ON_UPLOAD);
      if (type == ConvertType.VIEW)
      {
        ret = Boolean.valueOf((String) o.get(SUBKEY_IMAGE_CACHE));
      }
      else if (type == ConvertType.THUMBNAIL)
      {
        ret = Boolean.valueOf((String) o.get(SUBKEY_FILE_THUMBNAIL));
      }
      else
      {
        LOG.warning("Invalid type: " + type.toString());
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when getting upload conversion option. Type: {0}", type);
      LOG.log(Level.FINE, e.getMessage(), e);
    }
    return ret;
  }

  private String getEditorHostString(JSONObject editor_integration)
  {
    String host = "";

    if (isSmartCloud() && !getIsVerseEnv())
      host = "http://localhost"; // place holder host, real value should be read from topology_shared.json
    else
      host = (String) editor_integration.get(EDITOR_HOST);

    if (host == null)
    {
      host = ""; // to avoid NPE
    }
    else if (host.endsWith("/docs"))
    {
      host = host.substring(0, host.length() - "/docs".length());
    }
    else if (host.endsWith("/docs/"))
    {
      host = host.substring(0, host.length() - "/docs/".length());
    }
    else if (host.endsWith("/"))
    {
      host = host.substring(0, host.length() - 1);
    }

    return host;
  }

  public String getSnapshotSrvURL()
  {
    JSONObject envConfig = (JSONObject) rootConfig.get(EDITOR_INTEGRATION);
    try
    {
      String host = getEditorHostString(envConfig);
      String serviceURI = (String) envConfig.get("snapshot_service_uri");
      new URL(host + serviceURI);
      return host + serviceURI;
    }
    catch (MalformedURLException e)
    {
      return null;
    }
  }

  public String getDocsEntitlementUrl()
  {
    JSONObject envConfig = (JSONObject) rootConfig.get(EDITOR_INTEGRATION);
    String host = getEditorHostString(envConfig);
    String serviceURI = (String) envConfig.get("entitlement_uri");
    if (serviceURI == null || "".equals(serviceURI.trim()))
      serviceURI = "/docs/api/entitlement";
    return host + serviceURI;
  }

  public String getDocsJ2CAlias()
  {
    return docsJ2cAlias;
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

  private void init2(InputStream is)
  {
    try
    {
      JSONObject json = JSONObject.parse(is);
      rootConfig = json;
      JSONObject docsIntegration = getSubConfig(EDITOR_INTEGRATION);
      JSONObject htmlConfig = getSubConfig("HtmlViewerConfig");
      JSONObject PDFViewerConfig = getSubConfig("PDFViewerConfig");
      isSnapshotMode = Boolean.valueOf((String) docsIntegration.get("docs_enabled")) && Boolean.valueOf((String) htmlConfig.get("enabled"))
          && Boolean.valueOf((String) htmlConfig.get("snapshot_mode"));
      isPDFJsViewMode = (PDFViewerConfig != null) && Boolean.valueOf((String) PDFViewerConfig.get("PDFJs_view_mode"));
      isPDFCopyDisabled = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_copy_disabled") != null) ? Boolean
          .valueOf((String) PDFViewerConfig.get("PDFJs_copy_disabled")) : false;
      isPDFRangeDisabled = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_range_disabled") != null) ? Boolean
          .valueOf((String) PDFViewerConfig.get("PDFJs_range_disabled")) : false;
      try
      {
        JSONObject agentList = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_agent_list") != null) ? (JSONObject) PDFViewerConfig
            .get("PDFJs_agent_list") : null;
        LOG.log(Level.FINE, "get agentList is " + agentList);
        if (agentList != null)
        {
          if (pDFAgentList == null)
          {
            pDFAgentList = new JSONObject();
          }
          for (String key : browserList)
          {
            LOG.log(Level.FINE, "browser name is " + key);
            String value = (String) agentList.get(key);
            if (value != null)
            {
              pDFAgentList.put(key, URLEncoder.encode(value, "UTF-8"));
            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "found exception when parse agent list in init2 " + e.getMessage());
      }
    }
    catch (FileNotFoundException e)
    {
      isSnapshotMode = false;
      isPDFJsViewMode = false;
      isPDFCopyDisabled = false;
      isPDFRangeDisabled = false;
      pDFAgentList = null;
      LOG.log(Level.WARNING, "file not found exception when init2 " + e.getMessage());
    }
    catch (IOException e)
    {
      isSnapshotMode = false;
      isPDFJsViewMode = false;
      isPDFCopyDisabled = false;
      isPDFRangeDisabled = false;
      pDFAgentList = null;
      LOG.log(Level.WARNING, "io exception when init2 " + e.getMessage());
    }
  }

  private void init()
  {
    initViewerFS();

    if (viewerFS != null)
    {
      loadViewerConfig();
    }
    else
    {
      LOG.log(Level.WARNING, "System Property: " + CONFIG_FS_KEY + " has not been set. Needed for system to work");
    }

    initVerseEnv();

    installRoot = WASConfigHelper.getCellVariable("VIEWER_INSTALL_ROOT");
    if (installRoot != null)
    {
      installRoot = resolve(installRoot);
      LOG.info("VIEWER_INSTALL_ROOT: " + installRoot);
    }

    // Create the share folder
    sharedDataRoot = WASConfigHelper.getCellVariable(ConfigConstants.VIEWER_SHARED_DATA_ROOT);
    if (sharedDataRoot == null)
    {
      LOG.severe("Failed to get VIEWER_SHARED_DATA_ROOT from WAS.");
    }
    else
    {
      sharedDataRoot = resolve(sharedDataRoot);
      LOG.info("VIEWER_SHARED_DATA_ROOT: " + sharedDataRoot);
      File fSharedDataRoot = new File(sharedDataRoot);
      if (!fSharedDataRoot.exists() && !fSharedDataRoot.mkdirs())
      {
        if (isVerseEnv)
          LOG.log(Level.WARNING, "Not created VIEWER_SHARED_DATA_ROOT " + sharedDataRoot
              + ", please check if nfs is mounted correctly late.");
        else
          LOG.log(Level.SEVERE, "Create VIEWER_SHARED_DATA_ROOT: " + sharedDataRoot + " failed. Please check whether the NFS works");
      }
    }

    // Create the local folder
    if (isVerseEnv)
    {
      localDataRoot = WASConfigHelper.getCellVariable(ConfigConstants.VIEWER_LOCAL_DATA_ROOT);
    }
    if (localDataRoot == null)
    {
      if (isVerseEnv)
        LOG.severe("Failed to get VIEWER_LOCAL_DATA_ROOT from WAS.");
    }
    else
    {
      localDataRoot = resolve(localDataRoot);
      LOG.info("VIEWER_LOCAL_DATA_ROOT: " + localDataRoot);
      File fLocalDataRoot = new File(localDataRoot);
      if (!fLocalDataRoot.exists() && !fLocalDataRoot.mkdirs())
      {
        LOG.log(Level.SEVERE, "Create VIEWER_LOCAL_DATA_ROOT: " + localDataRoot + " failed. Please check whether the local disk.");
      }
    }
    sharedDataName = WASConfigHelper.getCellVariable(ConfigConstants.VIEWER_SHARED_DATA_NAME);
    if (sharedDataName == null)
    {
      LOG.log(Level.SEVERE, "Websphere Variables VIEWER_SHARED_DATA_NAME is not configured, use default value VIEWER_SHARE.");
      sharedDataName = "VIEWER_SHARE";
    }
    localDataName = WASConfigHelper.getCellVariable(ConfigConstants.VIEWER_LOCAL_DATA_NAME);
    if (localDataName == null)
    {
      LOG.log(Level.SEVERE, "Websphere Variables VIEWER_LOCAL_DATA_NAME is not configured, use default value VIEWER_LOCAL.");
      localDataName = "VIEWER_LOCAL";
    }
    docsSharedDataName = WASConfigHelper.getCellVariable(ConfigConstants.DOCS_SHARED_DATA_NAME);
    if (docsSharedDataName == null)
    {
      LOG.log(Level.SEVERE, "Websphere Variables DOCS_SHARED_DATA_NAME is not configured, use default value DOCS_SHARE.");
      docsSharedDataName = "DOCS_SHARE";
    }

    initDocsIntegration();

    initJ2CAlias();

    initPolicy();

    initDisplayMode();

    initAsyncUpload();

    initMultiConvertOnUpload();

    initBuildInfo();

  }

  private void initBuildInfo()
  {
    buildInfoConfig = getSubConfig(KEY_BUILD_INFO);
  }

  public JSONObject getBuildInfo()
  {
    return buildInfoConfig;
  }

  private void loadViewerConfig()
  {
    File configFile = new File(viewerFS, VIEWER_CONFIG_FILE);
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
        LOG.log(Level.SEVERE, "Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.", e);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Malformed config file: " + configFile.getAbsolutePath() + " can not be parsed successfully.", e);
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

  private void initViewerFS()
  {
    viewerFS = System.getProperty(CONFIG_FS_KEY);
    if (viewerFS == null)
    {
      LOG.info(CONFIG_FS_KEY + " not found as System property, checking environment variables");
      viewerFS = System.getenv(CONFIG_FS_KEY);
    }
    if (viewerFS == null)
    {
      String cellPath = WASConfigHelper.getCellPath();
      LOG.info(CONFIG_FS_KEY + " not found as System property and environment variables, try to use the one from cell path " + cellPath);
      if (cellPath != null)
      {
        File configFileFolder = new File(cellPath, CONFIG_FILE_FOLDER);
        if (configFileFolder.exists() && configFileFolder.isDirectory())
        {
          viewerFS = configFileFolder.getAbsolutePath();
          LOG.log(Level.INFO, "ViewerFS: {0}", viewerFS);
        }
        else
        {
          LOG.log(Level.WARNING, "Configuration folder {0} does not exist.", configFileFolder);
        }
      }
      else
      {
        LOG.warning("Failed to the cell path.");
      }
    }
  }

  private void initDocsIntegration()
  {
    try
    {
      JSONObject docsIntegration = getSubConfig(EDITOR_INTEGRATION);
      docsJ2cAlias = (String) docsIntegration.get("j2c_alias");
      if (docsJ2cAlias == null)
      {
      	docsJ2cAlias = (String) docsIntegration.get("j2cAlias");
      }
      JSONObject htmlConfig = getSubConfig("HtmlViewerConfig");
      boolean docsEnabled = Boolean.valueOf((String) docsIntegration.get("docs_enabled"));
      boolean htmlViewEnabled = Boolean.valueOf((String) htmlConfig.get("enabled"));
      boolean snapshotEnabled = Boolean.valueOf((String) htmlConfig.get("snapshot_mode"));
      isSnapshotMode = docsEnabled && htmlViewEnabled && snapshotEnabled;
      if (htmlViewEnabled)
      {
        LOG.log(Level.INFO, "Viewer is configurated to use HTML view.  Snapshot mode is {0}.", isSnapshotMode);
      }
      else
      {
        LOG.log(Level.INFO, "Viewer is configurated to use image view.");
      }
      JSONObject PDFViewerConfig = getSubConfig("PDFViewerConfig");
      isPDFJsViewMode = (PDFViewerConfig != null) && Boolean.valueOf((String) PDFViewerConfig.get("PDFJs_view_mode"));
      if (isPDFJsViewMode)
      {
        LOG.log(Level.INFO, "Viewer is configurated to use PDf JS to view PDF document. ");
      }
      else
      {
        LOG.log(Level.INFO, "Viewer is configurated to use image view to view PDF document..");
      }

      if (isSnapshotMode)
      {
        if (isSmartCloud() && !getIsVerseEnv())
        {
          DOCS_DRAFT_HOME = WASConfigHelper.getCellVariable("EDITOR_DRAFT_HOME") + File.separator + "data";
        }
        else
        {
          DOCS_DRAFT_HOME = (String) docsIntegration.get("shared_data_root");
        }
        LOG.log(Level.INFO, "Docs draft home is configurated as " + DOCS_DRAFT_HOME);
      }
      isPDFCopyDisabled = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_copy_disabled") != null) ? Boolean
          .valueOf((String) PDFViewerConfig.get("PDFJs_copy_disabled")) : false;
      isPDFRangeDisabled = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_range_disabled") != null) ? Boolean
          .valueOf((String) PDFViewerConfig.get("PDFJs_range_disabled")) : false;
      try
      {
        JSONObject agentList = (PDFViewerConfig != null) && (PDFViewerConfig.get("PDFJs_agent_list") != null) ? (JSONObject) PDFViewerConfig
            .get("PDFJs_agent_list") : null;
        LOG.log(Level.FINE, "get agentList is " + agentList);
        if (agentList != null)
        {
          if (pDFAgentList == null)
          {
            pDFAgentList = new JSONObject();
          }
          for (String key : browserList)
          {
            LOG.log(Level.FINE, "browser name is " + key);
            String value = (String) agentList.get(key);
            if (value != null)
            {
              pDFAgentList.put(key, URLEncoder.encode(value, "UTF-8"));
            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "found exception when parse agent list in initDocsIntegration" + e.getMessage());
      }
    }
    catch (Exception e)
    {
      isSnapshotMode = false;
      isPDFJsViewMode = false;
      isPDFCopyDisabled = false;
      isPDFRangeDisabled = false;
      pDFAgentList = null ;
      DOCS_DRAFT_HOME = "";
      LOG.log(Level.WARNING, "Error occurred when reading snapshot setting.  Using none snapshot mode. " + e.getMessage());
    }
  }

  private void initJ2CAlias()
  {
    try
    {
      JSONObject j2cAlias = getSubConfig("j2c_alias");
      ecmJ2cAlias = (String) j2cAlias.get("ecm");
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error occurred when reading ecmJ2cAlias. " + e.getMessage());
    }

  }

  private void initPolicy()
  {
    try
    {
      JSONObject rule = getSubConfig(KEY_POLICY);
      viewRule = (String) rule.get(SUBKEY_VIEW_RULE);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error occurred when reading view rule. " + e.getMessage());
    }

  }

  private void initDisplayMode()
  {
    try
    {
      JSONObject displayMode = getSubConfig(KEY_DISPLAY_MODE);
      if (displayMode == null)
      {
        isFullViewerSupported = false;
        LOG.log(Level.WARNING, "Display_mode is NOT configurated. Default value is used: enable_fullviewer=false");
      }
      else
      {
        isFullViewerSupported = Boolean.valueOf((String) displayMode.get(SUBKEY_FULLVIEWER_ENABLED));
      }

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error occurred when reading display_mode > enable_fullviewer. " + e.getMessage());
    }

  }

  private void initVerseEnv()
  {
    JSONObject envConfig = getSubConfig("deployment");
    if (envConfig != null && envConfig.get("symbol") != null)
    {
      String symbol = (String) envConfig.get("symbol");
      if (isSmartCloud() && StringUtils.isNotBlank(symbol) && symbol.equalsIgnoreCase(VIEWERNEXT))
      {
        isVerseEnv = Boolean.TRUE;
      }
    }
    LOG.log(Level.INFO, "IsVerseEnv is configurated as {0}", isVerseEnv);
  }

  private void initAsyncUpload()
  {
    try
    {
      JSONObject asyncUpload = getSubConfig(KEY_ASYNC_UPLOAD);
      if (asyncUpload == null)
      {
        maxThreadCount = DEFAULT_MAX_THREAD_COUNT;
        asyncTimeout = DEFAULT_ASYNC_TIMEOUT;
        LOG.log(Level.WARNING, "Async_upload is NOT configurated. Default value is used: max_thread_count={0}, time_out={1}", new Object[] {
            maxThreadCount, asyncTimeout });
      }
      else
      {
        try
        {
          maxThreadCount = Integer.valueOf((String) asyncUpload.get(SUBKEY_MAX_THREAD_COUNT));
          LOG.log(Level.INFO, "Max number of asnyc upload thread pool is configured as {0}", maxThreadCount);
        }
        catch (Exception e)
        {
          maxThreadCount = DEFAULT_MAX_THREAD_COUNT;
          LOG.log(Level.WARNING, "Error occurred when reading async_upload > max_thread_count. Default value is used as {0}. Excetion:{1}",
              new Object[] { maxThreadCount, e.getMessage() });
        }
        try
        {
          asyncTimeout = Integer.valueOf((String) asyncUpload.get(SUBKEY_TIMEOUT));
          LOG.log(Level.INFO, "Timeout of asnyc upload thread is configured as {0}", asyncTimeout);
        }
        catch (Exception e)
        {
          asyncTimeout = DEFAULT_ASYNC_TIMEOUT;
          LOG.log(Level.WARNING, "Error occurred when reading async_upload > time_out. Default value is used as {0}. Excetion:{1}",
              new Object[] { asyncTimeout, e.getMessage() });
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error occurred when reading async_upload configuration. " + e.getMessage());
    }

  }

  private void initMultiConvertOnUpload()
  {
    try
    {
      JSONObject uploadConfig = getSubConfig(KEY_CONVERT_ON_UPLOAD);
      JSONObject multiConvert = (JSONObject) uploadConfig.get(SUBKEY_MULTI_CONVERT);
      textMultiConvert = Boolean.valueOf((String) multiConvert.get(ApplicationType.TEXT.name().toLowerCase()));
      presMultiConvert = Boolean.valueOf((String) multiConvert.get(ApplicationType.PRES.name().toLowerCase()));
      sheetMultiConvert = Boolean.valueOf((String) multiConvert.get(ApplicationType.SHEET.name().toLowerCase()));

      StringBuffer sbf = new StringBuffer("Multi-conversion enabled:");
      if (textMultiConvert)
      {
        sbf.append(" ").append(ApplicationType.TEXT.name());
      }
      else if (presMultiConvert)
      {
        sbf.append(" ").append(ApplicationType.PRES.name());
      }
      else if (sheetMultiConvert)
      {
        sbf.append(" ").append(ApplicationType.SHEET.name());
      }
      else
      {
        sbf.append("none.");
      }
      LOG.log(Level.INFO, sbf.toString());
    }
    catch (Exception e)
    {
      String ex_msg = e.getMessage();
      if (ex_msg == null)
        ex_msg = "";
      LOG.log(Level.WARNING, "Failed to get multi-convert option.  Disable all by default. " + ex_msg);
    }

  }

  /**
   * Support to change the config at runtime. Read the config each time this function is called.
   * 
   * @return
   */
  public boolean getHouseKeepingEnableECM()
  {
    if (viewerFS != null)
    {
      File configFile = new File(viewerFS, VIEWER_CONFIG_FILE);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          JSONObject vConfig = JSONObject.parse(fis);
          JSONObject hkCfg = (JSONObject) vConfig.get("House_Keeping");
          return Boolean.valueOf((String) hkCfg.get("enable_ecm"));
        }
        catch (FileNotFoundException e)
        {
          LOG.log(Level.SEVERE, "Config file: " + configFile.getAbsolutePath() + " must exist and be a file for system to work.", e);
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Malformed config file: " + configFile.getAbsolutePath() + " can not be parsed successfully.", e);
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
    else
    {
      LOG.log(Level.WARNING, "System Property: " + CONFIG_FS_KEY + " has not been set. Needed for system to work");
    }
    return false;

  }

  public String getBssCoreBackEnd()
  {
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

  public JSONObject getFeatureConfig()
  {
    JSONObject json = new JSONObject();
    json.put("VIEWER_HTML_FEATURE", true);// isSmartCloud() ? ViewerGatekeeper.isHTMLViewerEnabled() : true);
    json.put("VIEWER_POSTMESSAGE_FEATURE", true);// isSmartCloud() ? ViewerGatekeeper.isPostMessageEnabled() : false);
    return json;
  }

  public String getVirtualHostsJunctionDomain()
  {
    JSONObject topologyConfig = (JSONObject) rootConfig.get("topology_shared");
    String value = (String) topologyConfig.get("virtual_hosts_junction_domain");
    LOG.log(Level.FINE, "Get virtual hosts junction domain: " + value);
    return value;
  }

  public int getMaxAsyncThreadCount()
  {
    return maxThreadCount;
  }

  public int getAsyncTimeout()
  {
    return asyncTimeout;
  }

  public Boolean getIsVerseEnv()
  {
    return isVerseEnv;
  }

  public String getDocsDraftHome()
  {
    return DOCS_DRAFT_HOME;
  }

  public int getImg2html_maxQueueSize()
  {
    return img2html_maxQueueSize;
  }

  public void setImg2html_maxQueueSize(int img2html_maxQueueSize)
  {
    this.img2html_maxQueueSize = img2html_maxQueueSize;
  }

  public long getImg2html_sendReqInterval()
  {
    return img2html_sendReqInterval;
  }

  public void setImg2html_sendReqInterval(long img2html_sendReqInterval)
  {
    this.img2html_sendReqInterval = img2html_sendReqInterval;
  }

  public int getImg2html_logPrintFrequency()
  {
    return img2html_logPrintFrequency;
  }

  public void setImg2html_logPrintFrequency(int img2html_logPrintFrequency)
  {
    this.img2html_logPrintFrequency = img2html_logPrintFrequency;
  }

  public boolean isImg2html_cleanImgCache()
  {
    return img2html_cleanImgCache;
  }

  public void setImg2html_cleanImgCache(boolean img2html_cleanImgCache)
  {
    this.img2html_cleanImgCache = img2html_cleanImgCache;
  }

  /**
   * @return the isPDFRangeDisabled
   */
  public boolean isPDFRangeDisabled()
  {
    return isPDFRangeDisabled;
  }

  /**
   * @param isPDFRangeDisabled the isPDFRangeDisabled to set
   */
  public void setPDFRangeDisabled(boolean isPDFRangeDisabled)
  {
    this.isPDFRangeDisabled = isPDFRangeDisabled;
  }

  /**
   * @return the pDFAgentList
   */
  public JSONObject getpDFAgentList()
  {
    return pDFAgentList;
  }

  /**
   * @param pDFAgentList the pDFAgentList to set
   */
  public void setpDFAgentList(JSONObject pDFAgentList)
  {
    this.pDFAgentList = pDFAgentList;
  }

  /*
   * get shared storages settings for viewernext only
   */
  public JSONObject getSharedStorageConfig()
  {
    if (isVerseEnv)
    {
      JSONObject storages = getSubConfig(KEY_SHARED_STORAGES);
      return storages;
    }
    else
    {
      return null;
    }
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

  public void addConfigList(String key, String configValue) throws Exception
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
      throw e;
    }
    finally
    {
      readWriteLock.writeLock().unlock();
    }
    LOG.exiting(this.getClass().getName(), "setConfigList");
  }

  public void removeConfigList(String key, String configValue) throws Exception
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
      throw e;
    }
    finally
    {
      readWriteLock.writeLock().unlock();
    }
    LOG.exiting(this.getClass().getName(), "removeConfigList");
  }
  
  /**
   * updateConfigFile()
   */
  public void updateConfigFile()
  {
    if (viewerFS != null)
    {
      File configFile = new File(viewerFS + File.separator + VIEWER_CONFIG_FILE);
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
          LOG.log(Level.SEVERE, "Config file: {0} must exist and be a file for system to work. Excetion:{1}",
              new Object[] { configFile.getAbsolutePath(), e.getMessage() });
        }
        catch (IOException e)
        {
          LOG.log(Level.SEVERE, "Malformed config file: {0}  can not be update successfully. Excetion:{1}",
              new Object[] { configFile.getAbsolutePath(), e.getMessage() });
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
}
