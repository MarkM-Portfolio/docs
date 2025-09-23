package com.ibm.concord.viewer.platform.util;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
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
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.json.java.JSONObject;

import com.ibm.websphere.cache.DistributedMap;

public class DocsEntitlementCheck
{
  private static final Logger LOG = Logger.getLogger(DocsEntitlementCheck.class.getName());

  private HttpClient httpClient;

  private static DocsEntitlementCheck inst = null;

  private String serviceURL;

  private String s2sToken;

  private String j2cAlias;

  private boolean isLocalEnv = false;

  private boolean isSCEnv = false;

  private boolean isSnapshotMode = false;

  private DocsEntitlementCheck(String url, String s2stoken, String j2calias)
  {
    this.serviceURL = url;
    this.s2sToken = s2stoken;
    this.j2cAlias = j2calias;
    this.isLocalEnv = ViewerConfig.getInstance().isLocalEnv();
    this.isSCEnv = ViewerConfig.getInstance().isSmartCloud();
    this.isSnapshotMode = ViewerConfig.getInstance().isSnapshotMode();

    initiateHttpclient(this.j2cAlias);
  }

  public static DocsEntitlementCheck getInstance()
  {
    if (inst == null)
    {
      URL serviceURL = null;
      boolean isSC = ViewerConfig.getInstance().isSmartCloud();
      boolean isViewerNext = ViewerConfig.getInstance().getIsVerseEnv();
      try
      {
        String entUrl = Platform.getViewerConfig().getDocsEntitlementUrl();
        serviceURL = new URL(entUrl);
        // only for SC, the docsServerUrl is get from topology
        // for Verse, it also needs read from viewer config
        if (isSC && !isViewerNext)
        {
          String server = TopologyConfigHelper.getDocsServerUrl();
          if (server.endsWith("/docs"))
          {
            server = server.substring(0, server.length() - "/docs".length());
          }
          serviceURL = new URL(server + serviceURL.getPath());
        }
        LOG.log(Level.INFO, "Entitlement URL is \"{0}\".", serviceURL.toString());
      }
      catch (MalformedURLException e)
      {
        LOG.warning("Snapshot URI error!" + Platform.getViewerConfig().getDocsEntitlementUrl());
        return null;
      }

      if (isSC && !isViewerNext)
      {
        inst = new DocsEntitlementCheck(serviceURL.toString(), TopologyConfigHelper.getS2SToken(), "");
      }
      else if (ViewerConfig.getInstance().isLocalEnv()) // local test environment
      {
        inst = new DocsEntitlementCheck(serviceURL.toString(), S2SCallHelper.getToken(), "");
      }
      else
      // on-premise or viewernext environment
      {
        inst = new DocsEntitlementCheck(serviceURL.toString(), S2SCallHelper.getToken(), ViewerConfig.getInstance().getDocsJ2CAlias());
      }
    }

    return inst;
  }

  private void initiateHttpclient(String j2cAlias)
  {
    // don't create http client when snapshot mode is not enabled
    if (!isSnapshotMode)
    {
      return;
    }

    if (isSCEnv || isLocalEnv)
    {
      LOG.log(Level.FINER, "Create httpclient by HttpClientCreator.");
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(ViewerConfig.getInstance().getSubConfig(ViewerConfig.EDITOR_INTEGRATION));
      httpClient = httpClientCreator.create();
    }
    else
    {
      LOG.log(Level.FINER, "Create httpclient by SONATA, j2cAlias={0}", j2cAlias);
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
  }

  public boolean getEntitlement(UserBean user)
  {
    return getEntitlement(user, false);
  }

  public boolean getEntitlement(UserBean user, boolean bForce)
  {
    LOG.entering(DocsEntitlementCheck.class.getName(), "getEntitlement", new Object[] { user.getId() });

    if (!isSnapshotMode)
    {
      return false; // when snapshot is disabled, always return false
    }

    DistributedMap docsentmap = Platform.getDocEntitleCacheMap();
    if (docsentmap == null)
    {
      return false; // always false when docs entitle cache object is not created
    }

    GetMethod method = new GetMethod(serviceURL);
    String userId = isLocalEnv ? user.getEmail() : user.getId();
    method.setRequestHeader("onBehalfOf", userId);
    method.setRequestHeader("s2stoken", s2sToken);

    boolean rc = false;

    // check CacheMap first
    if (!bForce)
    {
      Object r = docsentmap.get(userId);
      if (r != null && r instanceof Boolean)
      {
        rc = ((Boolean) r).booleanValue();
        LOG.log(Level.FINEST, "Got userId docs entitlement from cache," + userId + " entitle:" + rc);
        return rc;
      }
      else
      {
        LOG.log(Level.FINEST, "Can not get userId docs entitlement from cache." + userId);
      }
    }

    String uid = null;
    int statuscode = 200;
    try
    {
      statuscode = httpClient.executeMethod(method);
      if (statuscode == HttpServletResponse.SC_OK)
      {
        JSONObject result;
        InputStream is = method.getResponseBodyAsStream();
        Header encoder = method.getResponseHeader("Content-Encoding");
        if (encoder != null && encoder.getValue().equalsIgnoreCase("gzip"))
        {
          String content = ViewerUtil.decompressGzip(is);
          result = JSONObject.parse(content);
          is.close();
        }
        else
        {
          result = JSONObject.parse(new AutoCloseInputStream(is));
        }

        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINE, "Docs entitlement query response status code is " + statuscode + ", content is:" + result.toString());
        }

        // for SmartClould, check the docs entitlement level, if > 0 then true
        boolean gotval = false;
        /* if (isSCEnv || isLocalEnv) */{
          Object entitle = result.get("entitlement");
          if (entitle != null)
          {
            int entlevl = Integer.parseInt(String.valueOf(entitle));
            LOG.log(Level.FINE, "got entitlement level," + entlevl);
            if (entlevl > 0)
              rc = true;
            gotval = true;
          }
        } /*
           * else { Object entitle = result.get("entitlement_allowed"); if (entitle != null) { rc =
           * Boolean.parseBoolean(String.valueOf(entitle)); LOG.log(Level.INFO, "got entitlement =" + rc); gotval = true; } else {
           * LOG.log(Level.INFO, "did not get entitlement!"); }
           * 
           * }
           */
        Object usrid = result.get("id");
        if (usrid != null)
        {
          uid = String.valueOf(usrid);
          if (gotval)
          {
            docsentmap.put(userId, new Boolean(rc));
            if (!userId.equalsIgnoreCase(uid.trim()))
            {
              LOG.log(Level.FINE, "returned uid " + uid + " does not match original userid " + userId);
            }
          }
        }
      }
      else if (statuscode == 403 || statuscode == 401)
      {
        // when it gets 403, it also means no docs entitlement, so put into cache too.
        rc = false;
        docsentmap.put(userId, new Boolean(rc));
        LOG.log(Level.FINE, "Docs entitlement query response status code is " + statuscode);
      }
    }
    catch (Exception e)
    {
      LOG.logp(Level.WARNING, DocsEntitlementCheck.class.getName(), "getEntitlement", e.getMessage(), e);
    }
    finally
    {
      if (method != null)
      {
        method.releaseConnection();
      }
    }

    LOG.exiting(DocsEntitlementCheck.class.getName(), "getEntitlement", statuscode);
    LOG.log(Level.FINE, "user " + userId + "/" + uid + " has entitlement? " + rc);
    return rc;
  }
}
