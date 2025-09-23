package com.ibm.concord.viewer.platform.util;

import java.io.DataInputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ViewerVersionCheck
{
  private static String viewerVersion = null;

  private static ExpiringCache conversionVersion = new ExpiringCache(30000);

  private static final Logger LOG = Logger.getLogger(ViewerVersionCheck.class.getName());

  private static HttpClient httpClient;

  private static void initiateHttpclient(JSONObject config, String j2cAlias)
  {
    if (ViewerConfig.getInstance().isSmartCloud() || ViewerConfig.getInstance().isLocalEnv())
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      httpClient = httpClientCreator.create();
    }
    else
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
  }

  public static boolean isValidVersion()
  {
    if (viewerVersion == null)
    {
      viewerVersion = ViewerUtil.getDescription();
      String buildnum = ViewerUtil.getBuildVersion();
      LOG.info("Viewer version is: " + viewerVersion + "_" + buildnum);
    }

    String version = conversionVersion.getValue();
    if (version == null)
    {
      version = getVersionByURL();
      conversionVersion.setValue(version);
      LOG.info("Conversion version is:" + conversionVersion.getValue());
    }

    if (!ViewerConfig.getInstance().isOnpremise())
    {
      return true;
    }
    else
    {
      boolean ret = viewerVersion.equals(version);
      if (!ret)
      {
        LOG.warning(new StringBuffer("Incompatible version.  Viewer version ").append(viewerVersion).append(".  Conversion version ")
            .append(version).append(".").toString());
      }
      return ret;
    }
  }

  public static String getVersionByURL()
  {
    String versionRet = "";
    JSONObject componentConfig = (JSONObject) ViewerConfig.getInstance().getSubConfig("component");
    JSONArray array = (JSONArray) componentConfig.get("components");
    JSONObject config = null;
    for (int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject) array.get(i);
      String id = (String) obj.get("id");
      if ("com.ibm.concord.viewer.platform.conversion".equals(id))
      {
        config = (JSONObject) obj.get("config");
        break;
      }
    }
    JSONObject conversionService = (JSONObject) config.get("conversionService");
    String conversionServiceURL = (String) conversionService.get("serviceurl");
    String j2cAlias = (String) conversionService.get("j2c_alias");
    if (j2cAlias == null)
    {
    	j2cAlias = (String) conversionService.get("j2cAlias");
    }
    String txtURL = conversionServiceURL.replace("ConversionService", "version");
    try
    {
      LOG.log(Level.FINE, "Getting conversion version at " + txtURL);

      if (httpClient == null)
      {
        initiateHttpclient(conversionService, j2cAlias);
      }
      GetMethod getMethod = new GetMethod(txtURL);
      getMethod.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getEncodedToken());
      int nHttpStatus = httpClient.executeMethod(getMethod);
      if (HttpStatus.SC_OK == nHttpStatus || HttpStatus.SC_ACCEPTED == nHttpStatus)
      {
        LOG.log(Level.INFO, "http call status: ", nHttpStatus);
        InputStream is = getMethod.getResponseBodyAsStream();
        JSONObject r = JSONObject.parse(is);
        versionRet = (String) r.get("build_version");
      }
      else
      {
        LOG.log(Level.WARNING, "http call status: ", nHttpStatus);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to get Conversion version:" + e.toString());
    }
    return versionRet;
  }
}
