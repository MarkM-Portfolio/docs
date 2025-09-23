package com.ibm.docs.sanity.check.docs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;

import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RepositoryCheckPoint extends URLCheckPoint
{
  private static final Logger LOG = Logger.getLogger(RepositoryCheckPoint.class.getName());

  protected static final String S2S_TOKEN;

  static
  {
    String className = RepositoryCheckPoint.class.getSimpleName();

    messages.put(className + "@setUp@1", "The installation root path was not found.");
    messages.put(className + "@setUp@2", "The configuration file at [{0}] was not found.");
    messages.put(className + "@setUp@3", "The configuration file content cannot be parsed.");
    messages.put(className + "@setUp@4", "The S2S token for repository server was not found.");
    messages.put(className + "@setUp@5", "The S2S token is wrong. Expectation: {0}, Actual: {1}");
    messages.put(className + "@setUp@6", "The repository server url was not found.");
    messages.put(className + "@setUp@7", "The S2S token is missing from the configuration file.");
    messages.put(className + "@setUp@8", "The j2c_alias is missing or empty from the configuration file.");

    messages.put(className + "@doCheckMore@1", "Error Code : 3221, Http Status: {0}, Response Body: \"{1}\"");

    messages.put(className + "@tearDown@1", "");
    messages.put(className + "@tearDown@2", "");
    messages.put(className + "@tearDown@3", "");

    S2S_TOKEN = "ICON.token"; // This icon should be read from zookeeper
    // server at
    // /registry/by_component/BSSCore/s2s_token/type,
    // by pass check it now.
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(RepositoryCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for external repository (Files).", messages);

  private String serverUrl;

  private String code;

  public RepositoryCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(RepositoryCheckPoint.class.getName(), "setUp");

    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(ServerTypeUtil.varFile);
      //String installRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "DOCS_INSTALL_ROOT");
      String configFS = AppConfigurationUtil.getAppConfigJsonPath("docs");
      if (configFS == null)
      {
        throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 1);
      }

      //installRoot = resolve(installRoot);
      JSONObject rootConfig;
      File configFile = new File(configFS);
      if (configFile.exists() && configFile.isFile())
      {
        FileInputStream fis = null;
        try
        {
          fis = new FileInputStream(configFile);
          rootConfig = JSONObject.parse(fis);
        }
        catch (FileNotFoundException e)
        {
          throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", e);
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", e);
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
              throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", e);
            }
          }
        }
      }
      else
      {
        String sPath = configFile.getPath();
        Properties prop = System.getProperties();
        String os = prop.getProperty("os.name");
        if (os.startsWith("win") || os.startsWith("Win"))
          sPath = sPath.replaceAll("\\\\", "\\\\\\\\");
        throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 2, new Object[] { escape(sPath,
            this.getFormatMime()) });
      }

      if (rootConfig == null)
      {
        throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 3);
      }

      JSONArray components = (JSONArray) ((JSONObject) rootConfig.get("component")).get("components");
      JSONObject repoSvr = null;
      for (Object obj : components)
      {
        JSONObject component = (JSONObject) obj;
        String id = (String) component.get("id");

        if ((id != null) && (id.equals("com.ibm.docs.repository")))
        {
          repoSvr = (JSONObject) component;
          break;
        }
      }
      if (repoSvr == null)
      {
        throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 4);
      }
      else
      {
        JSONArray adapters = (JSONArray) ((JSONObject) repoSvr.get("config")).get("adapters");
        if (adapters == null)
        {
          throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 4);
        }
        else
        {
          JSONObject adapterConfig = (JSONObject) ((JSONObject) adapters.get(0)).get("config");
          if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
          {
            String s2sToken = (String) adapterConfig.get("s2s_token");
            // if (!S2S_TOKEN.equalsIgnoreCase(s2sToken))
            // {
            // throw new SanityCheckException(this, cpItem,
            // RepositoryCheckPoint.class, "setUp", 5, new Object[]
            // { S2S_TOKEN, s2sToken });
            // }
            if (s2sToken == null)
            {
              throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 7);
            }
            else
            {
              code = s2sToken;
            }
          }
          else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
          {
            String j2cAlias = (String) adapterConfig.get("j2c_alias");
            if (j2cAlias == null || j2cAlias.isEmpty())
            {
              throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 8);
            }
            else
            {
              code = j2cAlias;
            }
          }
          String serverUrl = (String) adapterConfig.get("server_url");
          if (serverUrl == null)
          {
            throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", 6);
          }
          else
          {
            this.serverUrl = serverUrl;
          }
        }
      }
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "setUp", e);
    }

    LOG.exiting(RepositoryCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    LOG.entering(RepositoryCheckPoint.class.getName(), "doCheckMore", new Object[] { httpStatus });

    if (httpStatus == 404)
    {
      try
      {
        String respStr = httpMethod.getResponseBodyAsString();
        if (respStr.contains("ItemNotFound") && respStr.contains("EJPVJ9067E"))
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else if (respStr.contains("ItemNotFound") && respStr.contains("EJPVJ9070E"))
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else
        {
          throw new SanityCheckException(this, cpItem, RepositoryCheckPoint.class, "doCheckMore", 1, new Object[] { httpStatus, respStr });
        }
      }
      catch (IOException e)
      {
        throw new SanityCheckException(this, getCheckPointItem(), URLCheckPoint.class, "doCheckMore", e);
      }
    }

    LOG.exiting(RepositoryCheckPoint.class.getName(), "doCheckMore");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(RepositoryCheckPoint.class.getName(), "tearDown");
    LOG.exiting(RepositoryCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(RepositoryCheckPoint.class.getName(), "report");

    cpItem.setDescription(getURL() == null ? cpItem.getDescription() : getURL());
    prepare(cpItem);

    LOG.exiting(RepositoryCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  public String getURL()
  {
    if (serverUrl == null)
    {
      return null;
    }
    else
    {
      if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
      {
        if (serverUrl.endsWith("/"))
        {
          return serverUrl + "form/api/introspection";
        }
        else
        {
          return serverUrl + "/form/api/introspection";
        }

      }
      else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
      {
        if (serverUrl.endsWith("/"))
        {
          return serverUrl + "form/cmis";
        }
        else
        {
          return serverUrl + "/form/cmis";
        }
      }
      else
      {
        return null;
      }
    }
  }

  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }

  protected Header[] getRequestHeaders()
  {
    Header s2sTokenHeader = new Header();
    if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
    {
      s2sTokenHeader.setName("s2stoken");
    }
    else if (ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.ONPREMISE)
    {
      s2sTokenHeader.setName("j2c_alias");
    }
    s2sTokenHeader.setValue(code);

    Header onBehalfOfHeader = new Header();
    onBehalfOfHeader.setName("onBehalfOf");
    onBehalfOfHeader.setValue("bssadmin@us.ibm.com"); // This user will not
    // have access to
    // Files, so Files
    // will return a 404
    // error as checked
    // above.

    return new Header[] { s2sTokenHeader, onBehalfOfHeader };
  }
}
