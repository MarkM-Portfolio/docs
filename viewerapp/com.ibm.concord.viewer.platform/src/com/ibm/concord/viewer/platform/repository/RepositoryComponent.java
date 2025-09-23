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

import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RepositoryComponent extends Component
{
  private static final Logger LOG = Logger.getLogger(RepositoryComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.repository";

  protected void init(JSONObject config) throws InitializationException
  {
    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);

      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IRepositoryAdapter provider = (IRepositoryAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);

        provider.init(providerConfig);
        RepositoryProviderRegistry.getInstance().registerProvider(id, provider);
      }
      catch (Exception e)
      {
        LOG.severe("adapter " + "initialization failed " + e);
      }
    }
  }

  public Object getService(Class<?> clazz)
  {
    throw new UnsupportedOperationException("Use getService(String id) instead.");
  }

  public Object getService(String id)
  {
    return RepositoryProviderRegistry.getInstance();
  }
}
