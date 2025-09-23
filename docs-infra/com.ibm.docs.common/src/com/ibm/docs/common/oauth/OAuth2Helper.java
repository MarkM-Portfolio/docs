/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.oauth;

import java.io.IOException;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;


import com.ibm.docs.common.oauth.OAuth2Util.OAUTH2_GRANT_TYPE;
import com.ibm.json.java.JSONObject;

public class OAuth2Helper
{
  private static final Logger LOG = Logger.getLogger(OAuth2Helper.class.getName());

  private final ReentrantReadWriteLock lock;

  private OAuth2Util oauth2Util;
  
  private String user;
  
  private String repoId;
  
  private String fileId;
  
  private String code;

  private OAUTH2_GRANT_TYPE grantType;
  
  private JSONObject oauthConfig;
  
  private OAuthToken token;

  public OAuth2Helper(OAuth2Util util, String user, String repoId, String fileId, String code, OAUTH2_GRANT_TYPE type, JSONObject authConf)
  {
    LOG.log(Level.FINEST, "new OAuth2Helper instance with params [user:{0}, repoId:{1}, fileId:{2}, code:{3}, type:{4}, authConfig:{5} ]",
        new Object[]{user, repoId, fileId, code, type, authConf});
    lock = new ReentrantReadWriteLock();
    this.oauth2Util = util;
    this.user = user;
    this.repoId = repoId;
    this.fileId = fileId;
    this.code = code;
    if (type == null)
      this.grantType = OAUTH2_GRANT_TYPE.IMPLICIT;
    else
      this.grantType = type;
    if (authConf == null)
      authConf = new JSONObject();
    this.oauthConfig = authConf;
    
  }
  
  public void setTokenMeta(String user, String repoId, String fileId)
  {
    if (this.user == null || this.fileId == null || this.repoId == null)
    {
      switch(grantType)
      {
        case AUTHORIZATION_CODE:
        case IMPLICIT:
        {
          this.user = user;
          this.repoId = repoId;
          this.fileId = fileId;
          if (token != null)
          {
            token.setUser(user);
            token.setRepoId(repoId);
            token.setFileId(fileId);
            oauth2Util.updateOAuth2Token(token);
          }
          break;
        }
      }
    }    
  }
  
  public OAuthToken getToken()
  {
    this.lock.readLock().lock();
    try
    {
      OAuthToken localToken = this.token;
      return localToken;
    }
    finally
    {
      this.lock.readLock().unlock();
    }
  }

  public String getAccessToken()
  {
    this.lock.writeLock().lock();
    try
    {
      if (token == null)
      {
        if (user != null)
        {
          LOG.log(Level.INFO, "Try to get access code from db with user:{0}, repoId: {1}, fileId:{2}" , new Object[]{user, repoId, fileId});
          token = oauth2Util.getOAuth2Token(user, repoId, fileId);
        }
      }
      if (token == null) 
      {
        if (code != null || (grantType == OAUTH2_GRANT_TYPE.PASSWORD))
          requestToken();
        else
          LOG.log(Level.WARNING, "Could not get OAuthToken because authorization code is null and no record in token db!!!");
      }
      else if (this.token.isExpired())
      {
        refreshToken();
      }

      String str = this.token != null? this.token.getAccessToken() : null;
      return str;
    }
    catch (Exception e)
    {
      LOG.log(Level.FINEST, "Error to get accessToken: ", e);
    }
    finally
    {
      this.lock.writeLock().unlock();
    }

    LOG.log(Level.WARNING, "Did not get accessToken!!!");
    return null;
  }

  public boolean deleteToken()
  {
    this.lock.writeLock().lock();
    try 
    {
      return oauth2Util.deleteOAuth2Token(user, repoId, fileId);
    } 
    finally 
    {
      this.lock.writeLock().unlock();
    }
  }
  
  private void requestToken() throws IOException
  {
    LOG.log(Level.INFO, "Requesting new OAuth access token.");
    this.token = oauth2Util.makeRequest(user, repoId, fileId, grantType, code, oauthConfig);
    logToken(this.token);
  }

  private void refreshToken() throws IOException
  {
    LOG.log(Level.INFO, "Refreshing OAuth access token.");
    oauthConfig.put(OAuth2Util.REFRESH_TOKEN_KEY, this.token.getRefreshToken());
    this.token = oauth2Util.makeRequest(user, repoId, fileId, OAUTH2_GRANT_TYPE.REFRESH_TOKEN, code, oauthConfig);
    oauthConfig.remove(OAuth2Util.REFRESH_TOKEN_KEY);
    logToken(this.token);
  }

  private void logToken(OAuthToken token)
  {
    LOG.log(Level.FINEST, token != null ? token.toString() : null);
  }
}
