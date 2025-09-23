package com.ibm.docs.common.oauth;

public class OAuthToken
{
  private String userId;
  
  private String fileId;
  
  private String repoId;

  private String accessToken;

  private String refreshToken;

  private long expirationTimestamp;

  public OAuthToken(String userId, String repoId, String fileId, String accessToken, String refreshToken, long expirationTimestamp)
  {
    this.userId = userId;
    this.repoId = repoId;
    this.fileId = fileId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expirationTimestamp = expirationTimestamp;
  }
  
  public void setUser(String user)
  {
    if (this.userId == null)
    {
      this.userId = user;
    }    
  }

  public String getUser()
  {
    return this.userId;
  }

  public void setRepoId(String id)
  {
    if (this.repoId == null)
      this.repoId = id;
  }
  
  public String getRepoId()
  {
    return this.repoId;
  }
  
  public void setFileId(String id)
  {
    if (this.fileId == null)
      this.fileId = id;
  }
  
  public String getFileId()
  {
    return this.fileId;
  }
  
  public String getAccessToken()
  {
    return this.accessToken;
  }

  public String getRefreshToken()
  {
    return this.refreshToken;
  }

  public long getExpirationTimestamp()
  {
    return this.expirationTimestamp;
  }

  public boolean isExpired()
  {
    return System.currentTimeMillis() >= this.expirationTimestamp;
  }

  public String toString()
  {
    return "Access token: " + this.accessToken + " / Refresh token: " + this.refreshToken + " / Expires : " + this.expirationTimestamp;
  }
}