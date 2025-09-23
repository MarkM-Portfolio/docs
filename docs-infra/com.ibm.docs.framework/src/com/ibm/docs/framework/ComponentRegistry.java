/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.framework;

import java.io.FileReader;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */

public class ComponentRegistry
{
  private static final Logger LOG = Logger.getLogger(ComponentRegistry.class.getName());
  
  public static final String COMPONENT_KEY = "component";

  public static final String COMPONENT_LIST_KEY = "components";

  public static final String COMPONENT_ID_KEY = "id";

  public static final String COMPONENT_CLASS_KEY = "class";

  public static final String COMPONENT_CONFIG_KEY = "config";

  private static final ComponentRegistry _instance = new ComponentRegistry();
  
  private Map<String, IComponent> components = new ConcurrentHashMap<String, IComponent>();
  private Map<String, ComponentDescriptor> descriptors = new ConcurrentHashMap<String, ComponentDescriptor>();
  
  private ComponentRegistry()
  {
  }
  
  public void initialize(String filePath)
  {
    LOG.log(Level.INFO, "the configuration file path is located at " + filePath);
    JSONObject config = readConfig(filePath);
    JSONObject componentConfig = (JSONObject)config.get(COMPONENT_KEY);
    JSONArray array = (JSONArray)componentConfig.get(COMPONENT_LIST_KEY);
    for(int i = 0; i < array.size(); i++)
    {
      JSONObject obj = (JSONObject)array.get(i);
      ComponentDescriptor descriptor = new ComponentDescriptor();
      descriptor.id = (String)obj.get(COMPONENT_ID_KEY);
      descriptor.className = (String)obj.get(COMPONENT_CLASS_KEY);
      descriptor.config = (JSONObject)obj.get(COMPONENT_CONFIG_KEY);
      descriptors.put(descriptor.id, descriptor);
    }
  }
  
  private JSONObject readConfig(String filePath)
  {
    FileReader reader = null;
    try
    {
      reader = new FileReader(filePath);
      return JSONObject.parse(reader);  
    }
    catch(Exception e)
    {
      throw new InitializationException("failed to read config from " + filePath, e);
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
        LOG.info("loading component " + descriptor);
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
  
  public synchronized void destroy()
  {
    for (IComponent component : components.values())
    {
      component.destroy();
    }
  }

}
