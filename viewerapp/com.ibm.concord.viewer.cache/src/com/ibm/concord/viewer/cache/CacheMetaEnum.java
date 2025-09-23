/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache;

import java.util.Calendar;

import com.ibm.concord.viewer.cache.CacheMetaEnum;

public class CacheMetaEnum
{
  /**
   * Unmodifiable Cache Meta
   */
  public static final CacheMetaEnum CUSTOMER_ID = new CacheMetaEnum("CUSTOMER_ID", String.class);

  public static final CacheMetaEnum DOC_ID = new CacheMetaEnum("DOC_ID", String.class);
  
  public static final CacheMetaEnum ORI_DOC_ID = new CacheMetaEnum("ORI_DOC_ID", String.class);

  /**
   * Internal Managed Cache Meta
   */
  public static final CacheMetaEnum CACHE_LAST_BUILD = new CacheMetaEnum("CACHE_LAST_BUILD", Calendar.class);

  public static final CacheMetaEnum CACHE_BASE_VERSION = new CacheMetaEnum("CACHE_BASE_VERSION", String.class);

  /**
   * Public Managed Cache Meta
   */
  public static final CacheMetaEnum MIME = new CacheMetaEnum("MIME", String.class);

  public static final CacheMetaEnum TITLE = new CacheMetaEnum("TITLE", String.class);

  public static final CacheMetaEnum EXT = new CacheMetaEnum("EXT", String.class);
  
  public static final CacheMetaEnum PRINT = new CacheMetaEnum("PRINT", String.class);
  
  public static final CacheMetaEnum CACHE_CONTROL = new CacheMetaEnum("CACHE_CONTROL", String.class);
  
  public static final CacheMetaEnum CACHE_VERSION = new CacheMetaEnum("CACHE_VERSION", String.class);
  
  public static final CacheMetaEnum SHA_DIGEST = new CacheMetaEnum("SHADIGEST", String.class);
  
  public static final CacheMetaEnum SIZE = new CacheMetaEnum("SIZE", String.class);

  private String key;

  private Class<?> aClass;

  private CacheMetaEnum(String key, Class<?> aClass)
  {
    this.key = key;
    this.aClass = aClass;
  }

  public String getMetaKey()
  {
    return key;
  }

  public Class<?> getMetaValueType()
  {
    return aClass;
  }

  public String toString()
  {
    return key + ' ' + aClass;
  }
}
