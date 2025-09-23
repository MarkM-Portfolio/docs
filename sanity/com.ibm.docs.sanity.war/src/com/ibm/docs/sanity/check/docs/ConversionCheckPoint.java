package com.ibm.docs.sanity.check.docs;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;
import java.util.UUID;
import java.util.logging.Logger;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.XMLConfiguration;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.params.HttpClientParams;

import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.sanity.Constants;
import com.ibm.docs.sanity.DeploymentEnvType;
import com.ibm.docs.sanity.bean.SanityCheckPointItem;
import com.ibm.docs.sanity.bean.SanityCheckPointItem.CheckResult;
import com.ibm.docs.sanity.check.URLCheckPoint;
import com.ibm.docs.sanity.exception.SanityCheckException;
import com.ibm.docs.sanity.util.AppConfigurationUtil;
import com.ibm.docs.sanity.util.ServerTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class ConversionCheckPoint extends URLCheckPoint
{
  private static final Logger LOG = Logger.getLogger(ConversionCheckPoint.class.getName());

  protected static String S2S_TOKEN;
  
  protected String j2c_alias;
  
  static
  {
    String className = ConversionCheckPoint.class.getSimpleName();

    messages.put(className + "@setUp@2", "The installation root path was not found.");
    messages.put(className + "@setUp@3", "The configuration file at [{0}] was not found.");
    messages.put(className + "@setUp@4", "The configuration file content cannot be parsed.");
    messages.put(className + "@setUp@5", "The S2S token for conversion server was not found.");
    messages.put(className + "@setUp@6", "The S2S token is wrong. Expectation: {0}, Actual: {1}");
    messages.put(className + "@setUp@7", "The conversion result url was not found.");
    messages.put(className + "@setUp@8", "The S2S token is missing from the configuration file.");

    messages.put(className + "@doCheckMore@1", "Error Code : 1200, Http Status: {0}, Response Body: \"{1}\"");

    S2S_TOKEN = "ICON.token"; // This icon should be read from zookeeper server at /registry/by_component/BSSCore/s2s_token/type, by pass
                              // check it now.
  }

  private final SanityCheckPointItem cpItem = new SanityCheckPointItem(ConversionCheckPoint.class.getSimpleName(),
      "This checkpoint is sanity check for the conversion server.", messages);

  private String resUrl;

  private String code;

  private String mockJobId;

  public ConversionCheckPoint(String formatMime)
  {
    super(formatMime);
  }

  public void setUp() throws SanityCheckException
  {
    super.setUp();
    LOG.entering(ConversionCheckPoint.class.getName(), "setUp");

    XMLConfiguration cellVarConfig;
    try
    {
      cellVarConfig = new XMLConfiguration(ServerTypeUtil.varFile);
      // String installRoot = ServerTypeUtil.getCellVariable(cellVarConfig, "DOCS_INSTALL_ROOT");
      String configFS = AppConfigurationUtil.getAppConfigJsonPath("docs");
      if (configFS == null)
      {
        throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 2);
      }
      // installRoot = resolve(installRoot);
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
          throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", e);
        }
        catch (IOException e)
        {
          throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", e);
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
              throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", e);
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
        throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 3, new Object[] { escape(sPath,
            this.getFormatMime()) });
      }

      if (rootConfig == null)
      {
        throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 4);
      }

      JSONArray components = (JSONArray) ((JSONObject) rootConfig.get("component")).get("components");
      JSONObject covSvr = null;
      for (Object obj : components)
      {
        JSONObject component = (JSONObject) obj;
        String id = (String) component.get("id");

        if ((id != null) && (id.equals("com.ibm.concord.platform.conversion")))
        {
          covSvr = (JSONObject) component;
          break;
        }
      }
      if (covSvr == null)
      {
        throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 5);
      }
      else
      {
        JSONObject serviceCfg = (JSONObject) ((JSONObject) covSvr.get("config")).get("conversionService");
        if (serviceCfg == null)
        {
          throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 5);
        }
        else
        {
          String tokenVal = (String) serviceCfg.get("s2s_token");
          // if (!S2S_TOKEN.equalsIgnoreCase(tokenVal))
          // {
          // throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 6,
          // new Object[] { S2S_TOKEN, tokenVal });
          // }
          if (tokenVal == null)
          {
            throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 8);
          }
          else
          {
            code = new BASE64Encoder().encode(tokenVal.getBytes());
          }

          String resUrlVal = (String) serviceCfg.get("resulturl");
          if (resUrlVal == null)
          {
            throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", 7);
          }
          else
          {
            resUrl = resUrlVal;
          }  
          
          j2c_alias = (String) serviceCfg.get(Constants.J2C_ALIAS);
          if(j2c_alias == null || j2c_alias.length() ==0)
          {
            j2c_alias = Constants.J2C_ALIAS_DEFAULT;
          }
        }
      }
    }
    catch (ConfigurationException e)
    {
      throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "setUp", e);
    }

    mockJobId = UUID.randomUUID().toString();

    LOG.exiting(ConversionCheckPoint.class.getName(), "setUp");
    return;
  }

  public void doCheckMore(int httpStatus, HttpMethod httpMethod) throws SanityCheckException
  {
    LOG.entering(ConversionCheckPoint.class.getName(), "doCheckMore", new Object[] { httpStatus });

    if (httpStatus == 404)
    {
      try
      {
        String respStr = httpMethod.getResponseBodyAsString();
        if (respStr.contains("t find task with given JOBID"))
        {
          cpItem.setResult(CheckResult.RESULT_SUCCESS(this.getFormatMime()));
        }
        else
        {
          throw new SanityCheckException(this, cpItem, ConversionCheckPoint.class, "doCheckMore", 1, new Object[] { httpStatus, respStr });
        }
      }
      catch (IOException e)
      {
        throw new SanityCheckException(this, getCheckPointItem(), URLCheckPoint.class, "doCheckMore", e);
      }
    }

    LOG.exiting(ConversionCheckPoint.class.getName(), "doCheckMore");
  }

  public void tearDown() throws SanityCheckException
  {
    super.tearDown();
    LOG.entering(ConversionCheckPoint.class.getName(), "tearDown");
    LOG.exiting(ConversionCheckPoint.class.getName(), "tearDown");
    return;
  }

  public SanityCheckPointItem report()
  {
    LOG.entering(ConversionCheckPoint.class.getName(), "report");

    cpItem.setDescription(getURL() == null ? cpItem.getDescription() : getURL());
    prepare(cpItem);

    LOG.exiting(ConversionCheckPoint.class.getName(), "report", cpItem.getResult().isSanity());
    return cpItem;
  }

  public String getURL()
  {
    if (resUrl == null || mockJobId == null)
    {
      return null;
    }
    else
    {
      return resUrl + "?JOBID=" + mockJobId;
    }
  }

  public SanityCheckPointItem getCheckPointItem()
  {
    return cpItem;
  }

  protected Header[] getRequestHeaders()
  {
    Header header = new Header();
    header.setName("token");
    header.setValue(code);
    return new Header[] { header };
  }

  protected HttpClient getHttpClient()
  {
    HttpClient httpClient = null;
    if(ServerTypeUtil.getDeploymentEnvType() == DeploymentEnvType.CLOUD)
    {
      httpClient = new HttpClient();
      HttpClientParams clientParams = httpClient.getParams();
      clientParams.setParameter("http.socket.timeout", 10000);
      clientParams.setParameter("http.connection.timeout", 10000);
    }
    else
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2c_alias);
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
    return httpClient;          
  }
}
