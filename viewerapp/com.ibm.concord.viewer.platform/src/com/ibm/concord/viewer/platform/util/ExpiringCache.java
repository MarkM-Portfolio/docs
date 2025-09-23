package com.ibm.concord.viewer.platform.util;

public class ExpiringCache
{
  private long creatingTimeStamp;

  private long expiration;

  private volatile String value;

  private final static long DEFAULT_EXPIRATION = 3000;

  public ExpiringCache(String value)
  {
    this(value, DEFAULT_EXPIRATION);
  }

  public ExpiringCache(String value, long expiration)
  {
    this.value = value;
    this.expiration = expiration;
    this.creatingTimeStamp = System.currentTimeMillis();
  }

  public ExpiringCache(int expiration)
  {
    this(null, expiration);
  }

  public String getValue()
  {
    long timeStamp = System.currentTimeMillis();
    if ((timeStamp - creatingTimeStamp) > expiration)
    {
      return null;
    }
    else
    {
      return value;
    }
  }

  public synchronized void setValue(String value)
  {
    this.value = value;
    creatingTimeStamp = System.currentTimeMillis();
  }
}
