/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.cache;

import java.util.logging.Level;
import java.util.logging.Logger;

public class CacheStorageAdapterFactory
{
  private static final Logger LOGGER = Logger.getLogger(CacheStorageAdapterFactory.class.getName());

  public static ICacheStorageAdapter newCacheAdapter(String pathname, Class<?> aClass)
  {
    try
    {
      ICacheStorageAdapter cacheFile = (ICacheStorageAdapter) Class.forName(aClass.getName()).newInstance();
      cacheFile.init(pathname);
      return cacheFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    return null;
  }

  public static ICacheStorageAdapter newCacheAdapter(String parent, String child, Class<?> aClass)
  {
    try
    {
      ICacheStorageAdapter cacheFile = (ICacheStorageAdapter) Class.forName(aClass.getName()).newInstance();
      cacheFile.init(parent, child);
      return cacheFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    return null;
  }

  public static ICacheStorageAdapter newCacheAdapter(ICacheStorageAdapter parent, String child, Class<?> aClass)
  {
    try
    {
      ICacheStorageAdapter cacheFile = (ICacheStorageAdapter) Class.forName(aClass.getName()).newInstance();
      cacheFile.init(parent, child);
      return cacheFile;
    }
    catch (IllegalAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (InstantiationException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    catch (ClassNotFoundException e)
    {
      LOGGER.log(Level.SEVERE, "Can not initialize ICacheStorageAdapter implementation.", e);
    }
    return null;
  }

}
