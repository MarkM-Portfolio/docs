/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

import com.ibm.docs.framework.Component;
import com.ibm.docs.framework.exception.InitializationException;
import com.ibm.json.java.JSONObject;

public class SessionManagerComponentImpl extends Component
{
  public static final String COMPONENT_ID = "com.ibm.concord.session.SessionManager";

  private SessionManager sessMgr;
  
  protected void init(JSONObject config) throws InitializationException
  {
    sessMgr = new SessionManager();
  }
  
  public Object getService(Class<?> clazz)
  {
    if(SessionManager.class == clazz)
    {
      return sessMgr;
    }
    return super.getService(clazz);
  }

  public Object getService(Class<?> clazz, String adaptorId)
  {
    return getService(clazz);
  }

}
