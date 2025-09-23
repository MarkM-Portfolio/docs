package com.ibm.concord.viewer.platform.util;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.config.TopologyConfigHelper;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class SnapshotSrvClient
{
  private static final Logger logger = Logger.getLogger(SnapshotSrvClient.class.getName());

  private static SnapshotSrvClient inst = null;

  private static final String SMARTC_CLOUD = "smart_cloud";

  private static final String ON_PREMISE = "On-premise";

  private static HttpClient httpClient = null;

  enum DeploymentEnv {
    SC, ONPREM, LOCAL
  }

  private DeploymentEnv env;

  private String serviceURL;

  private String s2sToken;

  private String j2cAlias;

  private SnapshotSrvClient(DeploymentEnv environment, String url, String s2sToken, String j2cAlias)
  {
    this.env = environment;
    serviceURL = url;
    this.s2sToken = s2sToken;
    this.j2cAlias = j2cAlias;
    createHttpClient();
  }

  public static SnapshotSrvClient getInstance()
  {
    if (inst == null)
    {
      boolean isSC = ViewerConfig.getInstance().isSmartCloud();
      boolean isViewerNext = ViewerConfig.getInstance().getIsVerseEnv();
      boolean isLocal = ViewerConfig.getInstance().isLocalEnv();
      URL serviceURL = null;
      try
      {
        serviceURL = new URL(Platform.getViewerConfig().getSnapshotSrvURL());
        if (isSC && !isViewerNext)
        {
          String server = TopologyConfigHelper.getDocsServerUrl();
          if (server.endsWith("/docs"))
          {
            server = server.substring(0, server.length() - "/docs".length());
          }
          serviceURL = new URL(server + serviceURL.getPath());
        }
        logger.log(Level.INFO, "Snapshot URL is \"{0}\".", serviceURL.toString());
      }
      catch (MalformedURLException e)
      {
        logger.warning("Snapshot URI error!" + Platform.getViewerConfig().getSnapshotSrvURL());
        return null;
      }

      if (isSC && !isViewerNext)
      {
        inst = new SnapshotSrvClient(DeploymentEnv.SC, serviceURL.toString(), TopologyConfigHelper.getS2SToken(), "");
      }
      else if (isLocal)
      {
        inst = new SnapshotSrvClient(DeploymentEnv.LOCAL, serviceURL.toString(), S2SCallHelper.decode(S2SCallHelper.getEncodedToken()), "");
      }
      else
      {
        inst = new SnapshotSrvClient(DeploymentEnv.ONPREM, serviceURL.toString(), S2SCallHelper.decode(S2SCallHelper.getEncodedToken()),
            ViewerConfig.getInstance().getDocsJ2CAlias());
      }
    }

    return inst;
  }

  public int getSnapshot(UserBean user, String repoId, String docId) throws Exception
  {
    logger.entering(SnapshotSrvClient.class.getName(), "getSnapshot", new Object[] { user.getId(), docId });

    // Replace both repoid and docid with actual value.
    // For localtest storage, viewer and editor have different storage name, so
    // it is not changeable from viewer-config-localtest.json
    String url = serviceURL.replace("{docid}", URLEncoder.encode(docId, "UTF-8")).replace("{repoid}", repoId);
    logger.fine("Getting Snapshot, " + url);

    GetMethod method = new GetMethod(url);
    String userId = env.equals(DeploymentEnv.LOCAL) ? user.getEmail() : user.getId();
    method.setRequestHeader("onBehalfOf", userId);
    method.setRequestHeader("s2stoken", s2sToken);
    if (URLConfig.getIcfilesContext() != null)
      method.setRequestHeader("x-ibm-icfiles-context", URLConfig.getIcfilesContext());

    int statuscode = 200;
    try
    {
      statuscode = httpClient.executeMethod(method);
      
      Header responseHeaders = method.getResponseHeader(HttpSettingsUtil.PROBLEM_ID);
      if (responseHeaders != null && !"".equals(responseHeaders.getValue()))
      {
        String responseID = responseHeaders.getValue();
        URLConfig.setResponseID(responseID);
        logger.info(new LogEntry(URLConfig.getRequestID(), responseID, String.format("Response back by call url : %s .", url)).toString());
      }
      
      InputStream is = method.getResponseBodyAsStream();
      if (statuscode == HttpServletResponse.SC_OK)
      {
        JSONObject result;
        Header encoder = method.getResponseHeader("Content-Encoding");
        if (encoder != null && encoder.getValue().equalsIgnoreCase("gzip"))
        {
          String content = ViewerUtil.decompressGzip(is);
          result = JSONObject.parse(content);
        }
        else
        {
          result = JSONObject.parse(new AutoCloseInputStream(is));
        }

        Object error = result.get("error_code");
        if (error != null)
        {
          int errorCode = Integer.parseInt(String.valueOf(error));
          if (errorCode != 0) // "0" stands for no specific error
          {
            statuscode = errorCode;
          }
        }
      }
    }
    catch (Exception e)
    {
      logger.logp(Level.WARNING, SnapshotSrvClient.class.getName(), "getSnapshot", e.getMessage(), e);
      throw e;
    }
    finally
    {
      if (method != null)
      {
        method.releaseConnection();
      }
    }

    logger.exiting(SnapshotSrvClient.class.getName(), "getSnapshot", statuscode);
    return statuscode;
  }

  private void createHttpClient()
  {
    if (ViewerConfig.getInstance().isSmartCloud() || ViewerConfig.getInstance().isLocalEnv())
    {
      logger.log(Level.FINER, "Create httpclient by HttpClientCreator.");
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(ViewerConfig.getInstance().getSubConfig(ViewerConfig.EDITOR_INTEGRATION));
      httpClient = httpClientCreator.create();
    }
    else
    {
      logger.log(Level.FINER, "Create httpclient by SONATA, j2cAlias={0}", j2cAlias);
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
  }
}
