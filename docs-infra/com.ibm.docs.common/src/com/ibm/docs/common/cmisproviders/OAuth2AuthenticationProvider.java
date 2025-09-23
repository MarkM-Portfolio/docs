/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.cmisproviders;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.bindings.spi.BindingSession;
import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;
import org.apache.chemistry.opencmis.commons.SessionParameter;

import com.ibm.docs.common.oauth.IOAuthTokenListener;
import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.common.oauth.OAuth2Util;
import com.ibm.docs.common.oauth.OAuthToken;

public class OAuth2AuthenticationProvider extends StandardAuthenticationProvider
{
  private static final Logger LOG = Logger.getLogger(OAuth2AuthenticationProvider.class.getName());

  private static final long serialVersionUID = 1L;

  public static final String OAUTH_USERID = "oauth_user_id";
  
  public static final String OAUTH_TOKEN_LISTENER_CLASS = "oauth_listener_clazz";
  
  OAuth2Helper oauthHelper;
  
  IOAuthTokenListener listener = null;

  public OAuth2AuthenticationProvider()
  {

  }
  
//  public void setListener(IOAuthTokenListener listener)
//  {
//    this.listener = listener;
//    oauthHelper.setListener(listener);
//    oauthHelper.updateOAuth2RefreshToken();
//  }

  public void setSession(BindingSession session)
  {
    super.setSession(session);
  }

  public Map<String, List<String>> getHTTPHeaders(String url)
  {
    Map headers = super.getHTTPHeaders(url);
    if (headers == null)
    {
      headers = new HashMap();
    }

    headers.put("Authorization", Collections.singletonList("Bearer " + getAccessToken()));

    return headers;
  }

  public OAuthToken getToken()
  {
    if (oauthHelper != null)
    {
      LOG.log(Level.INFO, "Generate OAuth2Helper and getToken.");
      return oauthHelper.getToken();
    }
    
    return null;
  }


  protected boolean getSendBearerToken()
  {
    return false;
  }

  protected String getAccessToken()
  {
    if (oauthHelper == null)
    {
      String tokenEndpoint = (String) getSession().get(SessionParameter.OAUTH_TOKEN_ENDPOINT);
      String clientId = (String) getSession().get(SessionParameter.OAUTH_CLIENT_ID);
      String clientSecret = (String) getSession().get(SessionParameter.OAUTH_CLIENT_SECRET);
      String redirectUri = (String) getSession().get(SessionParameter.OAUTH_REDIRECT_URI);
      String code = (String) getSession().get(SessionParameter.OAUTH_CODE);
      String user = (String) getSession().get(OAUTH_USERID);
      String listenerClazz = (String) getSession().get(OAUTH_TOKEN_LISTENER_CLASS);
      String repoId = (String)getSession().get(SessionParameter.REPOSITORY_ID);
      if(repoId == null)
      {
        LOG.log(Level.WARNING, "Can not get repoId of CMIS repository");
        repoId = "";
      }
      OAuth2Util oauth2Util = new OAuth2Util(tokenEndpoint, clientId, clientSecret, redirectUri);
      oauthHelper = new OAuth2Helper(oauth2Util, user, repoId, "", code, OAuth2Util.OAUTH2_GRANT_TYPE.IMPLICIT, null);
      if(listenerClazz != null)
      {        
          try
          {
            Class<?> clazzS = Class.forName(listenerClazz);
            listener = (IOAuthTokenListener) clazzS.newInstance();
          }
          catch (ClassNotFoundException e)
          {
            LOG.log(Level.SEVERE, "Exception to instance listener: " + e);
          }
          catch (IllegalAccessException e)
          {
            LOG.log(Level.SEVERE, "Exception to instance listener: " + e);
          }
          catch (InstantiationException e)
          {
            LOG.log(Level.SEVERE, "Exception to instance listener: " + e);
          }        
      }

      oauth2Util.setListener(listener);
      LOG.log(Level.INFO, "Generate OAuth2Helper and getAccessToken.");
    }
    return oauthHelper.getAccessToken();
  }
}