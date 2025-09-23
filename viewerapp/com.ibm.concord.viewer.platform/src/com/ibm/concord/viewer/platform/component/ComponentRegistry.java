/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.component;

import java.util.HashMap;
import java.util.Map;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */

public class ComponentRegistry
{
  private static final Logger LOG = Logger.getLogger(ComponentRegistry.class.getName());
  private static final ComponentRegistry _instance = new ComponentRegistry();
  
  private Map<String, IComponent> components = new HashMap<String, IComponent>();
  private Map<String, ComponentDescriptor> descriptors = new HashMap<String, ComponentDescriptor>();
  
  private ComponentRegistry()
  {
    JSONObject componentConfig = Platform.getViewerConfig().getSubConfig("component");
    JSONArray array = (JSONArray)componentConfig.get("components");
    for(int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject)array.get(i);
      ComponentDescriptor descriptor = new ComponentDescriptor();
      descriptor.id = (String)obj.get("id");
      descriptor.className = (String)obj.get("class");
      descriptor.config = (JSONObject)obj.get("config");
      descriptors.put(descriptor.id, descriptor);
    }
  }
  
  public static ComponentRegistry getInstance()
  {
    return _instance;
  }
  
  public void register(String name, IComponent comp)
  {
    components.put(name, comp);
  }
  
  public synchronized IComponent getComponent(String id)
  {
    IComponent component = components.get(id);
    if(component == null)
    {
      try
      {
        ComponentDescriptor descriptor = descriptors.get(id);
        LOG.log(Level.FINEST, "loading component " + descriptor);
        component = (IComponent)Class.forName(descriptor.className).newInstance();
        component.setId(id);
        register(id, component);
        component.initialize(descriptor.config);
      }
      catch(Throwable e)
      {
        LOG.log(Level.WARNING, "error loading component: " + id, e);
      }
      
    }
    return component;
  }

}
