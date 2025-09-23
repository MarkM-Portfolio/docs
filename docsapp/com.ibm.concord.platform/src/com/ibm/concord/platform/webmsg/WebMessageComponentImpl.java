/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.webmsg;

import com.ibm.concord.spi.webmessage.IWebMessageAdapter;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class WebMessageComponentImpl extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.platform.webmsg";
  
  private IWebMessageAdapter adapter;
  
  protected void init(JSONObject config) throws InitializationException
  {
    try
    {
      JSONObject adapterJson = (JSONObject)config.get("adapter");
      String clazz = (String) adapterJson.get("class");
      JSONObject adapterCfg = (JSONObject)adapterJson.get("config");
      adapter = (IWebMessageAdapter)Class.forName(clazz).newInstance();
      adapter.init(adapterCfg);
    }
    catch(Throwable e)
    {
      e.printStackTrace();
    }    
  }

  public Object getService(Class<?> clazz)
  {
    if(clazz == IWebMessageAdapter.class)
    {
      return adapter;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }
}
