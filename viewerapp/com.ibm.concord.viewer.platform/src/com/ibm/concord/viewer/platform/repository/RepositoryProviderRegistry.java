/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.repository;

import java.util.HashMap;
import java.util.Map;

import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;

public class RepositoryProviderRegistry
{
  private static RepositoryProviderRegistry instance = new RepositoryProviderRegistry();

  private Map<String, IRepositoryAdapter> providersMap;

  private RepositoryProviderRegistry()
  {
    providersMap = new HashMap<String, IRepositoryAdapter>();
  }

  public static RepositoryProviderRegistry getInstance()
  {
    return instance;
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
