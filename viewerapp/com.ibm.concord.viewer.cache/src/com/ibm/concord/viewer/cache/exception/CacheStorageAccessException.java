/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache.exception;

import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;


public class CacheStorageAccessException extends Exception
{
  private static final long serialVersionUID = -5559106388346989239L;
  /**
   * Exception code(1602) indicates that cannot access to the storage server(This is a general error for cache storage access exception).
   *  
   */
  public static final int EC_CACHESTORAGE_ACCESS_ERROR = 1602;
  
  private int nErrorCode = EC_CACHESTORAGE_ACCESS_ERROR;
  
  private String docId;
  private ICacheDescriptor cacheDesc;
  private Throwable nestedExp;

  protected CacheStorageAccessException(Throwable nestedExp)
  {
    this.cacheDesc = null;
    this.docId = null;
    this.nestedExp = nestedExp;
  }

  public CacheStorageAccessException(ICacheDescriptor cacheDesc, Throwable nestedExp)
  {
    this(nestedExp);
    this.docId = null;
    this.cacheDesc = cacheDesc;
  }

  public CacheStorageAccessException(String docId, Throwable nestedExp)
  {
    this(nestedExp);
    this.docId = docId;
    this.cacheDesc = null;
  }

  public Throwable getNestedException()
  {
    return nestedExp;
  }

  public ICacheDescriptor getCacheDescriptor()
  {
    return cacheDesc;
  }

  public String getDocId()
  {
    return docId;
  }
  
  public int getErrorCode()
  {
    return nErrorCode;
  }
}
