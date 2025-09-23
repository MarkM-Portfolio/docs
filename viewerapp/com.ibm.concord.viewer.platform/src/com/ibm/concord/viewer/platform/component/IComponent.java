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

import com.ibm.concord.viewer.platform.exceptions.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public interface IComponent
{

  public void setId(String id);

  public String getId();

  public void initialize(JSONObject config) throws InitializationException;

  public Object getService(String id);

  public Object getService(Class<?> clazz);

  public JSONObject getConfig();
}
