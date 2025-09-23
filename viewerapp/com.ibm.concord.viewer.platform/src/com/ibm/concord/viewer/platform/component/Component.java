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

import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
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
}
