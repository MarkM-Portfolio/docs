package com.ibm.concord.platform.bean;

public class UserDocCacheBean
{
  private String userId;
  private String docId;
  private String cacheKey;
  private String cacheValue;
  public String getUserId()
  {
    return userId;
  }
  public void setUserId(String userId)
  {
    this.userId = userId;
  }
  public String getDocId()
  {
    return docId;
  }
  public void setDocId(String docId)
  {
    this.docId = docId;
  }
  public String getCacheKey()
  {
    return cacheKey;
  }
  public void setCacheKey(String cacheKey)
  {
    this.cacheKey = cacheKey;
  }
  public String getCacheValue()
  {
    return cacheValue;
  }
  public void setCacheValue(String cacheValue)
  {
    this.cacheValue = cacheValue;
  }
}
