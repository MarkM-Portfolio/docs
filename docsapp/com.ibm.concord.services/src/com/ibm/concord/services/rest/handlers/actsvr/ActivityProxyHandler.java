/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.actsvr;


import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.task.TaskComponentImpl;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.json.java.JSONArray;

public class ActivityProxyHandler implements GetHandler
{
	private static final Logger LOG = Logger.getLogger(ActivityProxyHandler.class.getName());
	
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");

    JSONArray activities = null;
    try
    {
      activities = getActivityAdapter().getAllActivities(user);
    }
    catch (AccessException e)
    {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      LOG.log(Level.WARNING, "AccessException when get all activities for" + user.getId(), e);
      return;
    }
    catch(Exception e2)
    {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      LOG.log(Level.WARNING, "Exception when get all activities for" + user.getId(), e2);
      return;
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    if ((activities!=null) && (activities.size()>0))
    {
      response.setStatus(HttpServletResponse.SC_OK);

      activities.serialize(response.getWriter(), true);
    }
    else
    {
      response.setStatus(HttpServletResponse.SC_OK);
    }
  }
 
  private IActivityAdapter getActivityAdapter()
  {
    IComponent component = Platform.getComponent(TaskComponentImpl.COMPONENT_ID);
    return ((IActivityAdapter) component.getService(IActivityAdapter.class));
  }
  
}
