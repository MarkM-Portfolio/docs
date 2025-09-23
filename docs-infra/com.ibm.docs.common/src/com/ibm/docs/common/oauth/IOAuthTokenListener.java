package com.ibm.docs.common.oauth;

public interface IOAuthTokenListener
{
  public OAuthToken getOAuth2Token(String user, String repoId, String fileId);
  public boolean updateOAuth2Token(OAuthToken token);
  public boolean deleteOAuth2Token(String user, String repoId, String fileId);
}
