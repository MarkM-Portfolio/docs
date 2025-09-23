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


public class CacheDataAccessException extends Exception
{
  private static final long serialVersionUID = -3038416414599248293L;
  
  /**
   * Exception code(1601) indicates that cannot access to the storage server(This is a general error for cache data access exception).
   *  
   */
  public static final int EC_CACHEDATA_ACCESS_ERROR = 1601;
  
  private int nErrorCode = EC_CACHEDATA_ACCESS_ERROR;

  private ICacheDescriptor cacheDesc;

  private Throwable nestedExp;

  public CacheDataAccessException(ICacheDescriptor cacheDesc)
  {
    this.cacheDesc = cacheDesc;
    this.nestedExp = null;
  }

  public CacheDataAccessException(ICacheDescriptor cacheDesc, Throwable nestedExp)
  {
    this(cacheDesc);
    this.nestedExp = nestedExp;
  }

  public Throwable getNestedException()
  {
    return nestedExp;
  }

  public ICacheDescriptor getCache()
  {
    return cacheDesc;
  }
  
  public int getErrorCode()
  {
    return nErrorCode;
  }
}
