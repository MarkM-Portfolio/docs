/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class AuthenticationComponent extends Component
{
  private static final Logger LOG = Logger.getLogger(AuthenticationComponent.class.getName());

  public static final String COMPONENT_ID = "com.ibm.docs.authentication";

  private Map<String, IAuthenticationAdapter> providersMap = new HashMap<String, IAuthenticationAdapter>();

  private IAuthenticationAdapter defaultProvider;

  protected void init(JSONObject config) throws InitializationException
  {
    LOG.finer("entering( " + "init" + config + ")");

    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IAuthenticationAdapter provider = (IAuthenticationAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
        if (id.equalsIgnoreCase((String) config.get("default")))
        {
          defaultProvider = provider;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "component " + COMPONENT_ID
            + " initialization failed", e);
        throw new IllegalStateException(e);
      }
    }

    LOG.finer("exting( " + "init" + config + ")");
  }

  public Object getService(Class<?> clazz)
  {
    if (IAuthenticationAdapter.class == clazz)
    {
      return defaultProvider;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    if (IAuthenticationAdapter.class == clazz)
    {
      IAuthenticationAdapter adapter = providersMap.get(adaptorId);
      return adapter;
    }
    return super.getService(clazz);
  }
}
