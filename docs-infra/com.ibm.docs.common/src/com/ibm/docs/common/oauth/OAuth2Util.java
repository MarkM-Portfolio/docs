package com.ibm.docs.common.oauth;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.httpclient.methods.PostMethod;

import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class OAuth2Util
{
  private static final Logger LOG = Logger.getLogger(OAuth2Util.class.getName());

  private String clientId;

  private String clientSecret;
  
  private String redirectUri;

  private String endPoint;

  private long defaultTokenLifetime = 3600L;

  private static HttpClient client;

  
  private IOAuthTokenListener listener;
  
  public enum OAUTH2_GRANT_TYPE {
    AUTHORIZATION_CODE, IMPLICIT, PASSWORD, CLIENT_CREDENTIALS, REFRESH_TOKEN
  }
  
  public final static String KEY_OAUTH2_FUNCTIONAL_ID = "oauth2_functional_id";
  
  public final static String KEY_OAUTH2_FUNCTIONAL_SECRET = "oauth2_functional_secret";
  
  public final static String REFRESH_TOKEN_KEY = "refresh_token";
  
  public final static String ADMIN_ROLE = "admin_role";
  
  public OAuth2Util(String endPoint, String clientId, String clientSecret, String redirectUri)
  {
    this.endPoint = endPoint;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    
    if (client == null)
    {
      JSONObject config = new JSONObject();
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
      client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
    }
  }
  
  public OAuthToken makeRequest(String oauthUser, String repoId, String fileId, OAUTH2_GRANT_TYPE type, String code, JSONObject oauthConfig) throws IOException
  {
    if (oauthConfig == null)
      oauthConfig = new JSONObject();
    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    List<NameValuePair> headers = new ArrayList<NameValuePair>();
    switch (type) {
      case REFRESH_TOKEN:
      {
        parameters.add(new NameValuePair("grant_type", "refresh_token"));
        String refreshToken = (String)oauthConfig.get(REFRESH_TOKEN_KEY);
        parameters.add(new NameValuePair("refresh_token", refreshToken));
        if (clientId != null)
        {
          parameters.add(new NameValuePair("client_id", clientId));
        }
        if (clientSecret != null)
        {
          parameters.add(new NameValuePair("client_secret", clientSecret));
        }
        break;
      }
      case IMPLICIT:
      {
        parameters.add(new NameValuePair("grant_type", "authorization_code"));
        
        if (code != null)
        {
          parameters.add(new NameValuePair("code", code));
        }
        if (clientId != null)
        {
          parameters.add(new NameValuePair("client_id", clientId));
        }
        if (clientSecret != null)
        {
          parameters.add(new NameValuePair("client_secret", clientSecret));
        }
        if (redirectUri != null)
        {
          parameters.add(new NameValuePair("redirect_uri", redirectUri));
        }
        break;
      }
      case PASSWORD:
      {
        parameters.add(new NameValuePair("grant_type", "password"));
        oauthUser = (String)oauthConfig.get(KEY_OAUTH2_FUNCTIONAL_ID);
        String password = (String)oauthConfig.get(KEY_OAUTH2_FUNCTIONAL_SECRET);
        parameters.add(new NameValuePair("username", oauthUser));
        parameters.add(new NameValuePair("password", password));
        
        String functionalStr = clientId + ":" + clientSecret;
        String authCode = null;
        try
        {
          authCode = new BASE64Encoder().encode(functionalStr.getBytes("UTF-8"));
          authCode = authCode.replace("\n", "").replace("\r", "");
        }
        catch (UnsupportedEncodingException e)
        {
          LOG.log(Level.WARNING, "Exception when encoding function auth");
        }
        headers.add(new NameValuePair("Authorization", "Basic " + authCode));
        break;
      }
      default:
      {
        LOG.log(Level.WARNING, "Do not support OAuth2 grant type " + type + " yet");
        return null;
      }
    }
    
    OAuthToken token = createTokenByRequest(oauthUser, repoId, fileId, parameters, headers);
    updateOAuth2Token(token);
    return token;
  }
  
  
  public OAuthToken createTokenByRequest(String user, String repoId, String fileId, List<NameValuePair> parameters, List<NameValuePair> headers)
  {
    OAuthToken token = null;
    JSONObject jsonResponse = null;
    PostMethod postMethod = new PostMethod(endPoint);
    try
    {
      if (parameters != null)
      {
        NameValuePair[] paras = new NameValuePair[parameters.size()];
        paras = parameters.toArray(paras);
        postMethod.addParameters(paras);
      }
      if (headers != null)
      {
        for(int i = 0; i < headers.size(); i++)
        {
          NameValuePair pair = headers.get(i);
          postMethod.setRequestHeader(pair.getName(), pair.getValue());
        }
      }
      HttpState state = new HttpState();
      client.executeMethod(null, postMethod, state);
      int statusCode = postMethod.getStatusCode();
      if (statusCode == 200)
      {
        String tokenStr = postMethod.getResponseBodyAsString();
        jsonResponse = JSONObject.parse(tokenStr);
      }
      else
      {
        String errorBody = postMethod.getResponseBodyAsString();
        LOG.log(Level.SEVERE, "Did not get the oauth code from: " + endPoint + ", status code: " + statusCode + ", error message: " + errorBody);
      }
    }
    catch (SocketTimeoutException e)
    {
      LOG.log(Level.SEVERE, "Socket connection is timed out.", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "IO error happened.", e);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Unknown error happened.", e);
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }

    if (jsonResponse != null) {
      Object tokenType = jsonResponse.get("token_type");
      if ((!(tokenType instanceof String)) || (!"bearer".equalsIgnoreCase((String) tokenType)))
      {
        LOG.log(Level.WARNING, "Unsupported OAuth token type: " + tokenType);
      }
  
      Object jsonAccessToken = jsonResponse.get("access_token");
      if (!(jsonAccessToken instanceof String))
      {
        LOG.log(Level.WARNING, "Invalid OAuth access_token!");
      }
  
      Object jsonRefreshToken = jsonResponse.get("refresh_token");
      if ((jsonRefreshToken != null) && (!(jsonRefreshToken instanceof String)))
      {
        LOG.log(Level.WARNING, "Invalid OAuth refresh_token!");
      }
  
      long expiresIn = this.defaultTokenLifetime;
      Object jsonExpiresIn = jsonResponse.get("expires_in");
      if (jsonExpiresIn != null)
      {
        if ((jsonExpiresIn instanceof Number))
          expiresIn = ((Number) jsonExpiresIn).longValue();
        else if ((jsonExpiresIn instanceof String))
          try
          {
            expiresIn = Long.parseLong((String) jsonExpiresIn);
          }
          catch (NumberFormatException nfe)
          {
            LOG.log(Level.WARNING, "Invalid OAuth expires_in value!");
          }
        else
        {
          LOG.log(Level.WARNING, "Invalid OAuth expires_in value!");
        }
      }
  
      token = new OAuthToken(user, repoId, fileId, jsonAccessToken.toString(), jsonRefreshToken == null ? null : jsonRefreshToken.toString(), expiresIn
          * 1000L + System.currentTimeMillis());
  
    }
    else {
      LOG.log(Level.WARNING, "json response is null when get access token!");
    }
    
    return token;
  }

  public void setListener(IOAuthTokenListener l)
  {
    listener = l;
  }
  
  public void updateOAuth2Token(OAuthToken token)
  {
    if (listener != null)
    {
      if (token.getFileId() != null)
        listener.updateOAuth2Token(token);
    }
  }

  public static String getRefreshTokenUserId(String customerId, String userId)
  {
    return userId + "@" + customerId;
  }

  public OAuthToken getOAuth2Token(String user, String repoId, String fileId)
  {
    OAuthToken token = null;
    if (listener != null)
    {
      token = listener.getOAuth2Token(user, repoId, fileId);
      LOG.log(Level.FINEST, "Get OAuth token {0} from db with user:{1}, repoId: {2}, fileId: {3} " , new Object[]{token, user, repoId, fileId});
    }
    return token;
  }
  
  public boolean deleteOAuth2Token(String user, String repoId, String fileId)
  {
    if (listener != null)
    {
      return listener.deleteOAuth2Token(user, repoId, fileId);
    }
    return true;
  }

}
