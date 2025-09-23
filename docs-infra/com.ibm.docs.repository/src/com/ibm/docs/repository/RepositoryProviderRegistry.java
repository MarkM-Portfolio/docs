/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class RepositoryProviderRegistry
{
  private static RepositoryProviderRegistry instance = new RepositoryProviderRegistry();

  private Map<String, IRepositoryAdapter> providersMap;

  private IRepositoryAdapter defaultProvider;

  private RepositoryProviderRegistry()
  {
    providersMap = new HashMap<String, IRepositoryAdapter>();
  }

  public static RepositoryProviderRegistry getInstance()
  {
    return instance;
  }

  public IRepositoryAdapter getDefault()
  {
    return defaultProvider;
  }

  public String getDefaultId()
  {
    Iterator<String> iter = providersMap.keySet().iterator();
    while (iter.hasNext())
    {
      String adapterId = iter.next();
      if (providersMap.get(adapterId).equals(defaultProvider))
      {
        return adapterId;
      }
    }

    throw new IllegalStateException();
  }

  public void setDefault(IRepositoryAdapter defaultProvider)
  {
    this.defaultProvider = defaultProvider;
  }

  public IRepositoryAdapter getRepository(String adapterId)
  {
    if (adapterId == null)
    {
      throw new NullPointerException();
    }

    return providersMap.get(adapterId);
  }

  public void registerProvider(String adapterId, IRepositoryAdapter provider)
  {
    if (adapterId == null)
    {
      throw new NullPointerException();
    }
    providersMap.put(adapterId, provider);
  }

  public void unregisterProvider(String adapterId)
  {
    if (adapterId == null)
    {
      throw new NullPointerException();
    }

    providersMap.remove(adapterId);
  }
}

