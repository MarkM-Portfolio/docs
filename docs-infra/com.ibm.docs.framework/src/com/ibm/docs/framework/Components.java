package com.ibm.docs.framework;

public class Components
{
  public static IComponent getComponent(String id)
  {
    return ComponentRegistry.getInstance().getComponent(id);
  }
  
  public static void initialize(String filePath)
  {
    ComponentRegistry.getInstance().initialize(filePath);
  }
}
