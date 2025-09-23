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

import com.ibm.docs.framework.IComponent;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

public abstract class Component implements IComponent
{
  private String id;
  
  private JSONObject config;
  
  public void initialize(JSONObject config) throws InitializationException
  {
    this.config = config;
    init(config);
  }

  protected abstract void init(JSONObject config);

  public Object getService(Class<?> clazz)
  {
    return null;
  }
  
  public Object getService(Class<?> clazz, String adaptorId)
  {
    return null;
  }
  
  public void setId(String id)
  {
    this.id = id;
  }
  
  public String getId()
  {
    return id;
  }
  
  public JSONObject getConfig()
  {
    return config;
  }
  
  public void destroy()
  {
    
  }
}
