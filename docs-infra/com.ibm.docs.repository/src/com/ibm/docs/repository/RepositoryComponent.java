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

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RepositoryComponent extends Component
{
  private static final Logger LOG = Logger.getLogger(RepositoryComponent.class.getName());
  
  public static final String COMPONENT_ID = "com.ibm.docs.repository";

  protected void init(JSONObject config) throws InitializationException
  {
    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);

      try
      {
        Class<?> clazz = Class.forName((String)adapterConfig.get("class"));
        IRepositoryAdapter provider = (IRepositoryAdapter)clazz.newInstance();
        String id = (String)adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject)adapterConfig.get("config");
        providerConfig.put("id", id);

        provider.init(providerConfig);
        RepositoryProviderRegistry.getInstance().registerProvider(id, provider);
        if (id.equalsIgnoreCase((String) config.get("default")))
        {
          RepositoryProviderRegistry.getInstance().setDefault(provider);
        }
      }
      catch(Exception e)
      {
        LOG.log(Level.SEVERE, "failed to initialize adapter " + "initialization failed ", e);
        throw new IllegalStateException(e);
      }
    }
  }
  
  public Object getService(Class<?> clazz)
  {
    if(clazz == RepositoryProviderRegistry.class)
    {
      return RepositoryProviderRegistry.getInstance();
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
