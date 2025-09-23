package com.ibm.docs.viewer.external.util;

import java.io.File;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.common.oauth.OAuth2Util;
import com.ibm.docs.common.oauth.OAuth2Util.OAUTH2_GRANT_TYPE;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.J2CAliasHelper;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ConfigHelper
{
  private static final Logger LOG = Logger.getLogger(ConfigHelper.class.getName());

  private HttpClient client;

  private String docsEndpoint;

  private String repoHomeUrl;

  private String s2sMethod;

  private String oauth2Client;
  
  private String oauth2Secret;
  
  private OAUTH2_GRANT_TYPE oauth2Granttype;

  private JSONObject oauth2Config;
  
  private String oauth2Endpoint;

  private String j2cAlias;

  private String s2sToken;

  private String s2sTokenKey;

  private String onBehalfKey;

  private String serverMetaUrl;

  private String serverGetUrl;

  private String serverSetUrl;

  private OAuth2Util oauth2Util;
  
  private ThreadLocal<OAuth2Helper> t_oauthhelper = new ThreadLocal<OAuth2Helper>();

  private String cacheHome;

  private String sharedDataName;
  
  private String repoId;
  
  private String repoType;
  
  private String filePath;
  
  private String thumbnailSetUrl;

  private static HashMap<String, OAuth2Helper> oauthPasswordUserMap = new HashMap<String, OAuth2Helper>();
  
  public String getRepoId()
  {
    return repoId;
  }
  
  public String getRepoType()
  {
    return repoType;
  }  
  
  public String getFilePath()
  {
    return filePath;
  }
  
  public String getThumbnailSetUrl()
  {
    return thumbnailSetUrl;
  }

  public ConfigHelper(JSONObject config)
  {
    s2sMethod = (String) config.get(Constants.KEY_S2SMETHOD);
    docsEndpoint = (String) config.get(Constants.KEY_DOCS_CALLBACK_URL);
    serverMetaUrl = (String) config.get(Constants.KEY_REST_MEDIA_META_URL);
    serverGetUrl = (String) config.get(Constants.KEY_REST_MEDIA_GET_URL);
    repoHomeUrl = (String) config.get(Constants.KEY_REPOSITORY_HOME_URL);
    repoId = (String) config.get("id");
    
    repoType = null;
    if( config.containsKey("repo_type") )
    {
      repoType =  config.get("repo_type").toString();
    }
    
    thumbnailSetUrl = (String) config.get(Constants.KEY_THUMBNAIL_SET_URL);
    LOG.log(
        Level.INFO,
        "s2sMethod is: {0}, docsEndpoint is: {1}, serverMetaUrl is: {2}, serverGetUrl is: {3}, serverSetUrl is: {4}, Repository home is: {5}",
        new Object[] { s2sMethod, docsEndpoint, serverMetaUrl, serverGetUrl, serverSetUrl, repoHomeUrl });

    CacheType type = CacheType.NFS;
    try
    {
      type = CacheType.valueOf(((String) config.get(ConfigConstants.CACHE_TYPE)).toUpperCase());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Cache_type is not configured or the value is not accepted. The default value of nfs is used.");
    }

    cacheHome = ViewerConfig.getInstance().getDataRoot(type);
    
    filePath = this.cacheHome + File.separator + this.repoId + "_preview";

    sharedDataName = ViewerConfig.getInstance().getSharedDataName(type);

    if (Constants.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod) || Constants.S2S_METHOD_J2CALIAS2.equalsIgnoreCase(s2sMethod))
    {// Sonata J2C_ALIAS only support WebSphere server
      j2cAlias = (String) config.get(Constants.S2S_METHOD_J2CALIAS);
      if (j2cAlias == null)
      {
      	j2cAlias = (String) config.get(Constants.S2S_METHOD_J2CALIAS2);
      }
      onBehalfKey = (String) config.get(Constants.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "j2cAlias is: {0}, onBehalfKey is: {1}", new Object[] { j2cAlias, onBehalfKey });
      if (onBehalfKey == null)
      {
        onBehalfKey = Constants.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (j2cAlias == null || j2cAlias.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing j2c_alias necessary parameters: j2c_alias");
      }
      client = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
    else if (Constants.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      oauth2Config = new JSONObject();
      String granttype = (String)config.get(Constants.KEY_OAUTH2_GRANT_TYPE);
      try {
        if(granttype != null)
          oauth2Granttype = OAUTH2_GRANT_TYPE.valueOf(granttype.toUpperCase());
      } catch(Exception e)
      {
        LOG.warning(granttype + " is not a valid oauth grant type");
      }
      if (oauth2Granttype == null) 
      {
        oauth2Granttype = OAUTH2_GRANT_TYPE.IMPLICIT;
        LOG.info("Will fall back to grant type " + OAUTH2_GRANT_TYPE.IMPLICIT);
      }
      
      switch(oauth2Granttype) {
      case PASSWORD:
      {
        oauth2Client = (String)config.get(Constants.KEY_OAUTH2_CLIENT_ID);
        oauth2Secret = (String)config.get(Constants.KEY_OAUTH2_CLIENT_SECRET);
        String oauth2FunctionalId = (String)config.get(OAuth2Util.KEY_OAUTH2_FUNCTIONAL_ID);
        String oauth2FunctionalSecret = (String)config.get(OAuth2Util.KEY_OAUTH2_FUNCTIONAL_SECRET);
        if (oauth2FunctionalId == null || oauth2FunctionalSecret == null)
        {
          LOG.log(Level.WARNING, "Missing OAuth2 password grant type necessary parameters: " + OAuth2Util.KEY_OAUTH2_FUNCTIONAL_ID + " or " + OAuth2Util.KEY_OAUTH2_FUNCTIONAL_ID + " !!!");
        }
        oauth2Config.put(OAuth2Util.KEY_OAUTH2_FUNCTIONAL_ID, oauth2FunctionalId);
        oauth2Config.put(OAuth2Util.KEY_OAUTH2_FUNCTIONAL_SECRET, oauth2FunctionalSecret);
        break;
      } 
      case IMPLICIT:
      {
        //TODO: for different repository, should define different J2AS user name to differentiate oauth2 client id and secret
        String customerId = (String) config.get(Constants.KEY_OAUTH2_CUSTOMER_ID);
        oauth2Endpoint = (String) config.get(Constants.KEY_OAUTH2_ENDPOINT);
        LOG.log(Level.INFO, "customerId is: {0}, oauth2Endpoint is: {1}", new Object[] { customerId, oauth2Endpoint });
        if (customerId == null)
        {
          LOG.severe("customer_id is not defined!!!");
        }
        String[] pair = J2CAliasHelper.getJ2ASUserName(Constants.VIEWER_OAUTH_J2CALIAS_PREFIX + repoId);
        if (StringUtils.isNotBlank(pair[0]) && StringUtils.isNotBlank(pair[1]))
        {
          oauth2Client = pair[0];
          oauth2Secret = pair[1];
        }
        else
        {
          LOG.warning("Oauth2 j2c alias is not defined!!!");
        }
        break;
      }
      default:
      {
        LOG.warning("Do not support OAuth2 grant type " + oauth2Granttype);
      }
      }
      oauth2Endpoint = (String) config.get(Constants.KEY_OAUTH2_ENDPOINT);
      if (oauth2Endpoint == null || oauth2Endpoint.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_endpoint !!!");
      }
      if (oauth2Client == null || oauth2Client.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_client_id !!!");
      }
      if (oauth2Secret == null || oauth2Secret.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing OAuth2 necessary parameters: oauth2_client_secret !!!");
      }

      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
      
      oauth2Util = new OAuth2Util(oauth2Endpoint, oauth2Client, oauth2Secret, docsEndpoint);
    }
    else if (Constants.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

      s2sTokenKey = (String) config.get(Constants.KEY_TOKEN_HEADER);
      s2sToken = (String) config.get(Constants.S2S_METHOD_S2STOKEN);
      onBehalfKey = (String) config.get(Constants.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "onBehalfKey is: {0}, token key is: ", new Object[] { onBehalfKey, s2sTokenKey });
      if (s2sTokenKey == null || s2sTokenKey.length() == 0)
      {
        s2sTokenKey = Constants.S2STOKEN_DEFAULT_KEY;
      }
      if (onBehalfKey == null || onBehalfKey.length() == 0)
      {
        onBehalfKey = Constants.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (s2sToken == null || s2sToken.length() <= 0)
      {
        LOG.log(Level.WARNING, "Missing s2s_token necessary parameters: s2s_token");
      }
    }
    else if (Constants.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

    }
    else
    {
      String clazz = (String) config.get(Constants.CUSTOMIZED_HTTP_CLIENT);
      if (clazz == null || clazz.length() <= 0)
      {
        LOG.log(Level.WARNING, "No customized http client defined for customized s2sMethod!");
      }
      else 
      {
	      try
	      {
	        client = (HttpClient) Class.forName(clazz).newInstance();
	      }
	      catch (IllegalAccessException e)
	      {
	        LOG.log(Level.WARNING, "error loading httpclient: " + clazz, e);
	      }
	      catch (InstantiationException e)
	      {
	        LOG.log(Level.WARNING, "error loading httpclient: " + clazz, e);
	      }
	      catch (ClassNotFoundException e)
	      {
	        LOG.log(Level.WARNING, "error loading httpclient: " + clazz, e);
	      }
	      catch (Throwable e)
	      {
	        LOG.log(Level.WARNING, "error loading httpclient: " + clazz, e);
	      }
      }
    }
  }
  // use config JSONObject to pass the user defined parameters rather than add parameters for this method
  public void setRequestHeaders(HttpMethod method, UserBean requester, String docUri, JSONObject config)
  {
    if (Constants.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {
      if (requester != null)
      {
        method.setRequestHeader(onBehalfKey, requester.getEmail());
      }
    }
    else if (Constants.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      method.setRequestHeader(s2sTokenKey, s2sToken);
      if (requester != null)
      {
        method.setRequestHeader(onBehalfKey, requester.getEmail());
      }
    }
    else if (Constants.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
    {

      Cookie[] cookies = CookieHelper.getAllCookies();
      if (cookies != null && cookies.length > 0)
      {
        StringBuilder cookieBuilder = new StringBuilder("");
        String split = "";
        for (Cookie cookie : cookies)
        {
          if (cookie != null)
          {
            cookieBuilder.append(split);
            cookieBuilder.append(cookie.toString());
            split = "; ";
          }
        }
        method.setRequestHeader("Cookie", cookieBuilder.toString());
        if (requester != null)
        {
          requester.setObject("Cookie", cookieBuilder.toString());
        }
      }
      else if (requester != null)
      {
        String cookieStr = (String) requester.getObject("Cookie");
        method.setRequestHeader("Cookie", cookieStr);
      }
    }
    else if (Constants.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      switch (oauth2Granttype)
        {
          case PASSWORD :
          {
            boolean bAdminToken = false;
            if (config != null)
            {
              bAdminToken = Boolean.parseBoolean((String) config.get(OAuth2Util.ADMIN_ROLE));
            }
            String accessToken = null;
            if (!bAdminToken)
            {
              if (requester != null)
                accessToken = (String) requester.getProperty(Constants.AUTH_CODE);
              else
                accessToken = URLConfig.getRequestCode();
              if (accessToken == null)
              {
                LOG.log(Level.WARNING, "Have to use admin access token due to user's access token is not passed!");
              }
            }
            if (accessToken == null) {
              String adminUser = (String)oauth2Config.get(OAuth2Util.KEY_OAUTH2_FUNCTIONAL_ID);
              if (adminUser != null) {
                OAuth2Helper helper = oauthPasswordUserMap.get(adminUser);
                if (helper == null) {
                  helper = new OAuth2Helper(oauth2Util, adminUser, repoId, "", "", oauth2Granttype, oauth2Config);
                  oauthPasswordUserMap.put(adminUser, helper);
                }
                accessToken = helper.getAccessToken();
              } else {
                LOG.log(Level.WARNING, "Can not get admin/functional id for oauth2 password grant type.");
              }
            }
            break;
          }
          case IMPLICIT :
          {
            OAuth2Helper helper = null;
            String fileId = getFileId(requester);
            String helperID = getOAuthHelperId(requester);
            if (requester != null)
            {
              helper = (OAuth2Helper) requester.getObject(helperID);
            }

            if (helper == null)
            {
              if (requester != null)
              {
                String authCode = (String) requester.getProperty(Constants.AUTH_CODE);
                helper = new OAuth2Helper(oauth2Util, requester.getId(), repoId, fileId, authCode, oauth2Granttype, oauth2Config);            
                requester.setObject(helperID, helper);
              }
              else
              {
                String authCode = URLConfig.getRequestCode();
                if (authCode != null)
                {
                  helper = new OAuth2Helper(oauth2Util, null, repoId, fileId, authCode, oauth2Granttype, oauth2Config);
                  t_oauthhelper.set(helper);
                }
                else
                {
                  LOG.log(Level.WARNING,
                      "The server to server call method is oauth2, but there is no OAuth code passed in via ThreadLocal!!");
                }
              }
            }
            String accessToken = null;
            if (helper != null)
            {
              accessToken = helper.getAccessToken();
            }
            if (accessToken != null)
            {
              LOG.log(Level.FINEST, "Got accessToken!");
              method.setRequestHeader("Authorization", "Bearer " + helper.getAccessToken());
            }
            else if (requester != null)
            {
              LOG.log(Level.FINEST, "Did not got accessToken!");
              requester.setObject(helperID, null);
            }
            break;
          }
          default:
          {
            LOG.log(Level.WARNING, "Do not support OAuth grant type " + oauth2Granttype);
          }
        }
    }
    else
    {
      LOG.log(Level.INFO, "Customized http client should handle the auth staff itself.");
    }
  }

  public String getDocsEndPoint()
  {
    return this.docsEndpoint;
  }

  public String getJ2CAlias()
  {
    return this.j2cAlias;
  }

  public String getOAuth2Client()
  {
    return this.oauth2Client;
  }

  public String getOAuth2Endpoint()
  {
    return this.oauth2Endpoint;
  }

  public String getOAuth2Secret()
  {
    return this.oauth2Secret;
  }

  public String getOnBehalfKey()
  {
    return this.onBehalfKey;
  }

  public String getRepoHomeUrl()
  {
    return this.repoHomeUrl;
  }

  public String getS2SMethod()
  {
    return this.s2sMethod;
  }

  public String getS2SToken()
  {
    return this.s2sToken;
  }

  public String getS2STokenKey()
  {
    return this.s2sTokenKey;
  }

  public String getServerGetUrl()
  {
    return this.serverGetUrl;
  }

  public String getServerMetaUrl()
  {
    return this.serverMetaUrl;
  }

  public String getServerSetUrl()
  {
    return this.serverSetUrl;
  }

  public HttpClient getHttpClient()
  {
    return this.client;
  }

  public ThreadLocal<OAuth2Helper> getOAuthThreadLocalHelper()
  {
    return this.t_oauthhelper;
  }

  public String getCacheHome()
  {
    return this.cacheHome;
  }

  public String getSharedDataName()
  {
    return this.sharedDataName;
  }
  
  public String getFileId(UserBean user)
  {
    String fileId = URLConfig.getRequestFile();
    if (fileId == null && user != null) 
        fileId = user.getProperty(ExternalParasHelper.FILE_ID);
    if (fileId == null)
        fileId = "";
    return fileId;
  }
  
  public String getOAuthHelperId(UserBean user)
  {
    String fileId = getFileId(user);
    
    return "oauth2helper" + "@" + fileId;
  }
}
