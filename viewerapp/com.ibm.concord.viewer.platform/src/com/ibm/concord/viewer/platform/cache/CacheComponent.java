/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.cache;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.concord.viewer.spi.cache.ICacheStorageAdapter;
import com.ibm.json.java.JSONObject;

public class CacheComponent extends Component
{
  private static final Logger LOGGER = Logger.getLogger(CacheComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.cache";

  private static final String RECYCLE_LATENCY_KEY = "recycle_latency_in_min";

  public static int recycleLatency = 15;

  private ICacheStorageAdapter cacheRepositoryProvider;

  protected void init(JSONObject config) throws InitializationException
  {
    try
    {
      JSONObject obj = (JSONObject) config.get("adapter");
      String className = (String) obj.get("class");
      cacheRepositoryProvider = (ICacheStorageAdapter) Class.forName(className).newInstance();

      if (config.get(RECYCLE_LATENCY_KEY) != null)
      {
        int recycleLatency = Integer.parseInt((String) config.get(RECYCLE_LATENCY_KEY));
        if (recycleLatency < 0)
        {
          throw new IllegalArgumentException("recycle_latency_in_min for CacheComponent must be greater than zero.");
        }
        else
        {
          CacheComponent.recycleLatency = recycleLatency;
        }
      }

      LOGGER.log(Level.CONFIG, "recycle_latency_in_min: " + CacheComponent.recycleLatency);

    }
    catch (Exception e)
    {
      throw new IllegalStateException(e);
    }
  }

  public Object getService(Class<?> clazz)
  {
    if (clazz == ICacheStorageAdapter.class)
    {
      return cacheRepositoryProvider;
    }
    else if (clazz == Class.class)
    {
      return cacheRepositoryProvider.getClass();
    }
    return null;
  }

  public Object getService(String id)
  {
    throw new UnsupportedOperationException("Not implemented yet.");
  }
}
