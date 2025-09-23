package com.ibm.docs.directory.external.util;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.cookie.CookiePolicy;

import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.common.oauth.IOAuthTokenListener;
import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.common.oauth.OAuth2Util;
import com.ibm.docs.common.oauth.OAuth2Util.OAUTH2_GRANT_TYPE;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.dao.ICustomerCredentialDAO;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class ConfigHelper
{
  private static final Logger LOG = Logger.getLogger(ConfigHelper.class.getName());
  
  private final String FILE_ID = "file_id";
  
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
  
  private String repoId;

  private ICustomerCredentialDAO ccDAO;  
  
  private OAuth2Util oauth2Util;
  
  private ThreadLocal<OAuth2Helper> t_oauthhelper = new ThreadLocal<OAuth2Helper>();
  
  private String notificationUrl = null;

  public String getRepoId()
  {
    return repoId;
  }
  
  
  public ConfigHelper(JSONObject config)
  {
    s2sMethod = (String) config.get(ExternalConstant.KEY_S2SMETHOD);
    docsEndpoint = (String) config.get(ExternalConstant.KEY_DOCS_CALLBACK_URL);
    serverMetaUrl = (String) config.get(ExternalConstant.KEY_REST_MEDIA_META_URL);
    serverGetUrl = (String) config.get(ExternalConstant.KEY_REST_MEDIA_GET_URL);
    serverSetUrl = (String) config.get(ExternalConstant.KEY_REST_MEDIA_SET_URL);
    repoHomeUrl = (String) config.get(ExternalConstant.KEY_REPOSITORY_HOME_URL);
    repoId = (String) config.get("id");
    notificationUrl = (String) config.get(ExternalConstant.KEY_NOTIFICATION_URL);
    if (notificationUrl != null && !"".equals(notificationUrl))
    {
      try
      {
        new URL(notificationUrl);
      }
      catch (Exception e)
      {
        LOG.log(Level.INFO, "Invalid notification URL in repositry " + repoId + " configuration! If you don't want to use notification, set notification_url to empty string.", e);
        notificationUrl = null;
      }
    }
    LOG.log(
        Level.INFO,
        "s2sMethod is: {0}, docsEndpoint is: {1}, serverMetaUrl is: {2}, serverGetUrl is: {3}, serverSetUrl is: {4}, Repository home is: {5}",
        new Object[] { s2sMethod, docsEndpoint, serverMetaUrl, serverGetUrl, serverSetUrl, repoHomeUrl });

    if (ExternalConstant.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {// Sonata J2C_ALIAS only support WebSphere server
      j2cAlias = (String) config.get(ExternalConstant.S2S_METHOD_J2CALIAS);
      onBehalfKey = (String) config.get(ExternalConstant.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "j2cAlias is: {0}, onBehalfKey is: {1}", new Object[] { j2cAlias, onBehalfKey });
      if (onBehalfKey == null)
      {
        onBehalfKey = ExternalConstant.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (j2cAlias == null || j2cAlias.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing j2c_alias necessary parameters: j2c_alias");
      }
      client = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
    else if (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      oauth2Config = new JSONObject();
      String granttype = (String)config.get(ExternalConstant.KEY_OAUTH2_GRANT_TYPE);
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
        //TODO: should get oauth client id and client secret from db
        oauth2Client = (String)config.get(ExternalConstant.KEY_OAUTH2_CLIENT_ID);
        oauth2Secret = (String)config.get(ExternalConstant.KEY_OAUTH2_CLIENT_SECRET);
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
        String customerId = (String) config.get(ExternalConstant.KEY_OAUTH2_CUSTOMER_ID);
        LOG.log(Level.INFO, "customerId is: {0}", new Object[] { customerId });
        if (customerId == null)
        {
          LOG.severe("customer_id is not defined!!!");
        }
        oauth2Client = getCustomerCredentialDAO().get(customerId, ExternalConstant.KEY_OAUTH2_CLIENT_ID);
        oauth2Secret = getCustomerCredentialDAO().get(customerId, ExternalConstant.KEY_OAUTH2_CLIENT_SECRET);
        break;
      }
      default:
      {
        LOG.warning("Do not support OAuth2 grant type " + oauth2Granttype);
      }
      }
      
      oauth2Endpoint = (String) config.get(ExternalConstant.KEY_OAUTH2_ENDPOINT);
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
      IOAuthTokenListener listener = (IOAuthTokenListener) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID)
          .getService(IOAuthTokenListener.class);
      oauth2Util.setListener(listener);
    }

    else if (ExternalConstant.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

      s2sTokenKey = (String) config.get(ExternalConstant.KEY_TOKEN_HEADER);
      s2sToken = (String) config.get(ExternalConstant.S2S_METHOD_S2STOKEN);
      onBehalfKey = (String) config.get(ExternalConstant.KEY_ONBEHALFOF_HEADER);
      LOG.log(Level.INFO, "onBehalfKey is: {0}, token key is: ", new Object[] { onBehalfKey, s2sTokenKey });
      if (s2sTokenKey == null || s2sTokenKey.length() ==0)
      {
        s2sTokenKey = ExternalConstant.S2STOKEN_DEFAULT_KEY;
      }
      if (onBehalfKey == null || onBehalfKey.length() == 0)
      {
        onBehalfKey = ExternalConstant.ON_BEHALF_OF_DEFAULT_KEY;
      }
      if (s2sToken == null || s2sToken.length() <= 0)
      {
        LOG.log(Level.SEVERE, "Missing s2s_token necessary parameters: s2s_token");
      }
    }
    else if (ExternalConstant.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
    {
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
    }
    else
    {
      String clazz = (String) config.get(ExternalConstant.CUSTOMIZED_HTTP_CLIENT);
      if (clazz == null || clazz.length() <= 0)
      {
        LOG.log(Level.SEVERE, "No customized http client defined for customized s2sMethod!");
        return;
      }

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
  
  private synchronized ICustomerCredentialDAO getCustomerCredentialDAO()
  {
    if (ccDAO == null)
    {
      ccDAO = (ICustomerCredentialDAO) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID)
          .getService(ICustomerCredentialDAO.class);
    }

    return ccDAO;
  }
  
  
  public void setRequestHeaders(HttpMethod method, UserBean requester, String docUri)
  {
    if (ExternalConstant.S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {
      if (requester != null)
      {
        method.setRequestHeader(onBehalfKey, requester.getEmail());
      }
    }
    else if (ExternalConstant.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      method.setRequestHeader(s2sTokenKey, s2sToken);
      if (requester != null)
      {
        method.setRequestHeader(onBehalfKey, requester.getEmail());
      }
    }
    else if (ExternalConstant.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod))
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
    else if (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      OAuth2Helper helper = null;
//      String fileId = getFileId(requester);
      String helperID = "oauth2helper" + "@" + docUri;
      LOG.log(Level.FINEST, "Get helper id " + helperID);
      if (requester != null) {    	  
        helper = (OAuth2Helper) requester.getObject(helperID);    	
      }
      if (helper == null)
      {
        LOG.log(Level.INFO, "Have not find OAuthHelper instance with id " + helperID);
        if (requester != null)
        {
          String authCode = (String) requester.getProperty(ExternalConstant.AUTH_CODE);
          helper = new OAuth2Helper(oauth2Util, requester.getId(), repoId, docUri, authCode, OAUTH2_GRANT_TYPE.IMPLICIT, null);            
          requester.setObject(helperID, helper); 
        }
        else
        {
          String authCode = URLConfig.getRequestCode();
          if (authCode != null)
          {
            helper = new OAuth2Helper(oauth2Util, null, repoId, docUri, authCode, OAUTH2_GRANT_TYPE.IMPLICIT, null);
            t_oauthhelper.set(helper);
          }
          else
          {
            LOG.log(Level.WARNING, "The server to server call method is oauth2, but there is no OAuth code passed in via ThreadLocal!!");
          }
        }
      }
      String accessToken = null;      
      if( helper != null )
      {
        accessToken = helper.getAccessToken();
      }
      if (accessToken != null)
      {
        LOG.log(Level.FINEST, "Got accessToken!");
        method.setRequestHeader("Authorization", "Bearer " + helper.getAccessToken());
      }
      else if (requester != null) {
        LOG.log(Level.FINEST, "Did not got accessToken!");
        requester.setObject(helperID, null); 
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
  
  public String getNotificationUrl()
  {
    return this.notificationUrl;
  }
  
  public String getFileId(UserBean user)
  {
    String fileId = URLConfig.getRequestFile();
    LOG.log(Level.FINEST, "Get current file id " + fileId + " from thread local");
    if (fileId == null && user != null) 
    {
      fileId = user.getProperty(FILE_ID);
      LOG.log(Level.FINEST, "Get current file id " + fileId + " from userbean");
    }
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
