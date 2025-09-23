/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.task;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class TaskComponentImpl extends Component
{
  private static final Logger LOG = Logger.getLogger(TaskComponentImpl.class.getName());
  
  public static final String COMPONENT_ID = "com.ibm.concord.platform.task";
  
  private IActivityAdapter activityAdapter;

  protected void init(JSONObject config) throws InitializationException
  {
    try
    {
      JSONObject activity = (JSONObject)config.get("adapter");
      String clazz = (String)activity.get("class");
      activityAdapter = (IActivityAdapter)Class.forName(clazz).newInstance();
      JSONObject activityConfig = (JSONObject)activity.get("config");
      activityAdapter.init(activityConfig);
    }
    catch(Throwable e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.INIT_DIR_COMPONENT_ERROR, "component " + COMPONENT_ID
          + " initialization failed", e);
    }
  }
  
  public Object getService(Class<?> clazz)
  {
    if(clazz == IActivityAdapter.class)
    {
      return activityAdapter;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }

}
