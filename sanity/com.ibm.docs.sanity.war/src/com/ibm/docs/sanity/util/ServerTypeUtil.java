package com.ibm.docs.sanity.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.http.HttpVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.conn.params.ConnManagerParams;
import org.apache.http.conn.params.ConnPerRouteBean;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;

import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.DeploymentServerType;
import com.ibm.docs.sanity.check.AbstractCheckPoint;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.management.AdminService;
import com.ibm.websphere.management.AdminServiceFactory;

public class ServerTypeUtil
{
  private static final Logger LOG = Logger.getLogger(ServerTypeUtil.class.getName());

  private static String DOCS_ROOT = "DOCS_INSTALL_ROOT";

  private static String CONV_ROOT = "CONVERSION_INSTALL_ROOT";

  // Comment
  private static DeploymentServerType serverType = DeploymentServerType.NONE;

  // private static int serverType = -1;

  private static final String DOCS_CONFIG_FILE = "concord-config.json";

  private static final String CONVERSION_CONFIG_FILE = "conversion-config.json";

  private static final AdminService wasAdminService = AdminServiceFactory.getAdminService();

  private static final String SYSTEM_KEY_WAS_INSTALL_ROOT = "was.install.root";

  private static final String SYSTEM_KEY_USER_INSTALL_ROOT = "user.install.root";

  public static final File varFile;

  public static DeploymentEnvType onPremiseOrCloud = DeploymentEnvType.NONE;

  public static final String IBMDocsConfigPath;

  static
  {
    if (System.getProperty(SYSTEM_KEY_WAS_INSTALL_ROOT) != null)
    {
      String rootPath = System.getProperty(SYSTEM_KEY_USER_INSTALL_ROOT);
      String cellName = wasAdminService.getCellName();
      varFile = new File((new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
          .append("cells").append(File.separator).append(cellName).append(File.separator).append("variables.xml").toString());
      IBMDocsConfigPath = (new StringBuilder()).append(rootPath).append(File.separator).append("config").append(File.separator)
          .append("cells").append(File.separator).append(cellName).append(File.separator).append("IBMDocs-config").toString();
    }
    else
    {
      varFile = new File((new StringBuilder()).append(System.getProperty(SYSTEM_KEY_USER_INSTALL_ROOT)).append(File.separator)
          .append("variables.xml").toString());
      IBMDocsConfigPath = null;
    }
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

  /**
   * 
   * @return 0 for Docs and Conversion mixture mode, 1 for Docs only mode, 2 for Conversion only mode, -1 for not supported mode.
   */
  // Temporarily comment for time limitation,and testing,will rollback further
  // sanity improvement
  public static DeploymentServerType getServerType()
  {
    if (serverType != DeploymentServerType.NONE)
    {
      return serverType;
    }

    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(varFile);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Look up server type failed.", e);
      return DeploymentServerType.UNKNOWN;
    }
    // JSONObject config =
    // Platform.getConcordConfig().getSubConfig("typeahead");
    boolean hasDocs = false;
    boolean hasConv = false;
    String docsConfigFS = null;
    String convConfigFS = null;
    File docsCellConfigPath = (IBMDocsConfigPath != null) ? new File(IBMDocsConfigPath) : null;
    if (docsCellConfigPath != null && docsCellConfigPath.exists())
    {
      docsConfigFS = IBMDocsConfigPath;
      convConfigFS = IBMDocsConfigPath;
    }
    String docsInstallRoot = getCellVariable(cellVarConfig, DOCS_ROOT);
    if (docsInstallRoot != null)
    {
      hasDocs = true;
      if (docsConfigFS == null)
      {
        String docsOldConfigFS = (new StringBuilder()).append(docsInstallRoot).append(File.separator).append("config").toString();
        File docsOldConfigPath = (docsOldConfigFS != null) ? new File(docsOldConfigFS) : null;
        if (docsOldConfigPath != null && docsOldConfigPath.exists())
          docsConfigFS = docsOldConfigFS;
      }
      if (onPremiseOrCloud == DeploymentEnvType.NONE)
        onPremiseOrCloud = getDeploymentEnvType(docsConfigFS, DOCS_CONFIG_FILE);
    }

    String convInstallRoot = getCellVariable(cellVarConfig, CONV_ROOT);
    if (convInstallRoot != null)
    {
      hasConv = true;
      if (convConfigFS == null)
      {
        String convOldConfigFS = (new StringBuilder()).append(convInstallRoot).append(File.separator).append("config").toString();
        File convOldConfigPath = (convOldConfigFS != null) ? new File(convOldConfigFS) : null;
        if (convOldConfigPath != null && convOldConfigPath.exists())
          convConfigFS = convOldConfigFS;
      }

      if (onPremiseOrCloud == DeploymentEnvType.NONE)
        onPremiseOrCloud = getDeploymentEnvType(convConfigFS, CONVERSION_CONFIG_FILE);
    }

    if (hasDocs && hasConv && onPremiseOrCloud == DeploymentEnvType.CLOUD)
    {
      serverType = DeploymentServerType.CLOUD_DOCS_CONVERSION;
      return DeploymentServerType.CLOUD_DOCS_CONVERSION;
    }
    else if (hasDocs && !hasConv && onPremiseOrCloud == DeploymentEnvType.CLOUD)
    {
      serverType = DeploymentServerType.CLOUD_DOCS_ONLY;
      return DeploymentServerType.CLOUD_DOCS_ONLY;
    }
    else if (!hasDocs && hasConv && onPremiseOrCloud == DeploymentEnvType.CLOUD)
    {
      serverType = DeploymentServerType.CLOUD_CONVERSION_ONLY;
      return DeploymentServerType.CLOUD_CONVERSION_ONLY;
    }
    else if (hasDocs && hasConv && onPremiseOrCloud == DeploymentEnvType.ONPREMISE)
    {
      serverType = DeploymentServerType.ONPREMISE_DOCS_CONVERSION;
      return DeploymentServerType.ONPREMISE_DOCS_CONVERSION;
    }
    else if (hasDocs && !hasConv && onPremiseOrCloud == DeploymentEnvType.ONPREMISE)
    {
      serverType = DeploymentServerType.ONPREMISE_DOCS_ONLY;
      return DeploymentServerType.ONPREMISE_DOCS_ONLY;
    }
    else if (!hasDocs && hasConv && onPremiseOrCloud == DeploymentEnvType.ONPREMISE)
    {
      serverType = DeploymentServerType.ONPREMISE_CONVERSION_ONLY;
      return DeploymentServerType.ONPREMISE_CONVERSION_ONLY;
    }
    else
    {
      serverType = DeploymentServerType.NONE;
      return DeploymentServerType.NONE;
    }
  }

  public static String getCellVariable(XMLConfiguration cellConfig, String configName)
  {
    if (cellConfig == null || configName == null)
    {
      throw new NullPointerException("The cellConfig or configName is not allowed to be null.");
    }

    LOG.entering(AbstractCheckPoint.class.getName(), "getCellVariable", new Object[] { cellConfig.getBasePath(), configName });

    String result = null;
    int length = cellConfig.getMaxIndex("entries");
    for (int j = 0; j <= length; j++)
    {
      Configuration config = cellConfig.subset((new StringBuilder()).append("entries(").append(j).append(")").toString());
      // String cfgItemName = config.getString("[@symbolicName]");
      if (configName.equals(config.getString("[@symbolicName]")))
      {
        String value = config.getString("[@value]");
        result = value;
        break;
      }
    }

    LOG.exiting(AbstractCheckPoint.class.getName(), "getCellVariable", result);
    return result;
  }

  public static DeploymentEnvType getDeploymentEnvType(String sConPath, String sConFileName)
  {
    if (sConPath == null)
      return DeploymentEnvType.NONE;

    if (onPremiseOrCloud != DeploymentEnvType.NONE)
      return onPremiseOrCloud;

    DeploymentEnvType nDEType = DeploymentEnvType.NONE;

    sConPath = resolvePath(sConPath);
    String sConFile = (new StringBuilder()).append(sConPath).append(File.separator).append(sConFileName).toString();
    File configFile = new File(sConFile);
    if (configFile.exists() && configFile.isFile())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(configFile);
        JSONObject tempConfigObj = JSONObject.parse(fis);
        String software_mode = (String) tempConfigObj.get("software_mode");
        boolean bIsCloud = false;
        if (software_mode != null && software_mode.equalsIgnoreCase("sc"))
        {
          bIsCloud = true;
        }
        else
        {
          JSONObject objSCCfg = (JSONObject) tempConfigObj.get("typeahead");
          if (objSCCfg != null)
          {
            String sCould = (String) objSCCfg.get("is_cloud");
            if (sCould != null && Boolean.valueOf(sCould))
              bIsCloud = true;
          }
        }
        if (bIsCloud)
          nDEType = DeploymentEnvType.CLOUD;
        else
          nDEType = DeploymentEnvType.ONPREMISE;
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.SEVERE, "Config file: " + configFile.getAbsolutePath() + " must exist.", e);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Config file: " + configFile.getAbsolutePath() + " cannot be parsed.", e);
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
      LOG.log(Level.WARNING, "Config file: " + configFile.getAbsolutePath() + " must exist.");
    }

    return nDEType;
  }

  public static String resolvePath(String path)
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

  public static DeploymentEnvType getDeploymentEnvType()
  {
    return onPremiseOrCloud;
  }

  public static int getSchemaVersion()
  {
    int nVer = 1;
    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(varFile);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to find the server type.", e);
      return -1;
    }

    String docsInstallRoot = getCellVariable(cellVarConfig, DOCS_ROOT);
    if (docsInstallRoot != null)
    {
      docsInstallRoot = resolvePath(docsInstallRoot);
      String sSchemaPath = docsInstallRoot + File.separator + "product" + File.separator + "setupDB";
      File sScheDir = new File(sSchemaPath);
      if (sScheDir.exists() && sScheDir.isDirectory())
      {
        String[] sFiles = sScheDir.list();
        String sPrefix = "fixup";
        int nLenPre = sPrefix.length();
        for (int i = 0; i < sFiles.length; i++)
        {
          int nExt = sFiles[i].lastIndexOf(".");
          if (sFiles[i].startsWith("fixup") && nExt < sFiles.length && sFiles[i].substring(nExt + 1).equalsIgnoreCase("sql"))
          {
            String sVer = sFiles[i].substring(nLenPre, nExt);
            int nSch = Integer.parseInt(sVer);
            if (nSch > nVer)
              nVer = nSch;
          }
        }
      }
    }
    return nVer;
  }

  public static HttpClient createHttpClient()
  {
    LOG.entering(ServerTypeUtil.class.getName(), "createHttpClient");

    HttpParams params = new BasicHttpParams();
    ConnManagerParams.setTimeout(params, 10 * 1000);
    ConnManagerParams.setMaxConnectionsPerRoute(params, new ConnPerRouteBean(100));
    ConnManagerParams.setMaxTotalConnections(params, 10);

    HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
    HttpProtocolParams.setContentCharset(params, "UTF-8");
    HttpConnectionParams.setSoTimeout(params, 10 * 1000);
    HttpConnectionParams.setConnectionTimeout(params, 10 * 1000);

    SchemeRegistry schreg = new SchemeRegistry();
    schreg.register(new Scheme("http", PlainSocketFactory.getSocketFactory(), 80));

    ThreadSafeClientConnManager connManager = new ThreadSafeClientConnManager(params, schreg);
    DefaultHttpClient httpClient = new DefaultHttpClient(connManager, params);

    LOG.exiting(ServerTypeUtil.class.getName(), "createHttpClient", httpClient != null);
    return httpClient;
  }

  public static JSONObject readJsonConfigureFile(String filename) throws IOException
  {
    JSONObject result = null;
    FileInputStream fis = null;
    if (IBMDocsConfigPath == null)
      return null;
    File configFile = new File(IBMDocsConfigPath + File.separator + filename);
    if (configFile.exists() && configFile.isFile())
    {
      try
      {
        fis = new FileInputStream(configFile);
        result = JSONObject.parse(fis);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Read file " + configFile.getAbsolutePath() + "failed: ", e);
        throw e;
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
            LOG.log(Level.SEVERE, "Failed to close read stream", e);
            throw e;
          }
        }
      }
    }
    return result;
  }
}
