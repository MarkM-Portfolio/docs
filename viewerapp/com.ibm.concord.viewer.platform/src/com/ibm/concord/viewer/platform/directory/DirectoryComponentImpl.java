/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.directory;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.component.Component;
import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class DirectoryComponentImpl extends Component
{
  private static final Logger LOG = Logger.getLogger(DirectoryComponentImpl.class.getName());

  public static final String COMPONENT_ID = "com.ibm.concord.viewer.platform.directory";

  private Map<String, IDirectoryAdapter> providersMap = new HashMap<String, IDirectoryAdapter>();

  protected void init(JSONObject config) throws InitializationException
  {
    JSONArray adapters = (JSONArray) config.get("adapters");
    for (int i = 0; i < adapters.size(); i++)
    {
      JSONObject adapterConfig = (JSONObject) adapters.get(i);
      try
      {
        Class<?> clazz = Class.forName((String) adapterConfig.get("class"));
        IDirectoryAdapter provider = (IDirectoryAdapter) clazz.newInstance();
        String id = (String) adapterConfig.get("id");
        JSONObject providerConfig = (JSONObject) adapterConfig.get("config");
        providerConfig.put("id", id);
        provider.init(providerConfig);
        providersMap.put(id, provider);
      }
      catch (Exception e)
      {
        LOG.severe("component " + COMPONENT_ID + " initialization failed" + e);
      }
    }
  }

  public Object getService(String id)
  {
    IDirectoryAdapter adapter = providersMap.get(id);
    return adapter;
  }

  public Object getService(Class<?> clazz)
  {
    throw new UnsupportedOperationException("Use getService(String id) instead.");
  }
}
