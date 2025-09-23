/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.services.rest.handlers;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocTaskBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocTaskDAO;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.HeadHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NotificationMessageHandler implements GetHandler, HeadHandler, PostHandler, PutHandler
{
  
  private static final Logger LOG = Logger.getLogger(NotificationMessageHandler.class.getName());
  
  public static final int allMsgs = 0;
  
  public static final int assignmentsMsgs = 1;  

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    // TODO Auto-generated method stub

  }

  public void doHead(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doGet(request, response);
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject json = new JSONObject();
    String method = request.getParameter("method");
    if (method != null)
    {      
      if (method.equalsIgnoreCase("assignments"))
      {
        json = this.getAllMessages(this.assignmentsMsgs, request);
      }
      else
      {
        json = this.getAllMessages(this.allMsgs, request);        
      }
    }
    else
    {
      json = this.getAllMessages(this.allMsgs, request);
    }    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    json.serialize(response.getWriter());
    response.setStatus(HttpServletResponse.SC_OK);
    return;
  }
  
  public static JSONObject getAllMessages(int type, HttpServletRequest request)
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if (user != null)
    {
      JSONObject retJson = new JSONObject();
//      String msgType = null; // null is permitted
//      if(type == NotificationMessageHandler.assignmentsMsgs)
//      {
//        msgType = AdapterUtil.TASK_MSG; 
//      }        
//      String userId = user.getId();
//      IDocMessageDAO daoMessages = (IDocMessageDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
//          IDocMessageDAO.class);
//      try
//      {
//        List<DocMessageBean> list = daoMessages.getMessageByUserByType(userId, msgType);
//        JSONArray items = new JSONArray();
//        for(int i=0; i<list.size(); i++)
//        {
//          DocMessageBean bean = list.get(i);
//          JSONObject json = bean.toJSON();
//          items.add(json);
//        }
//        
//        retJson.put("items", items);
//        return retJson;
//      }
//      catch(AccessException e)
//      {
//        LOG.log(Level.WARNING, "Error to get notification messages: " + e);
//        return null;
//      }
      
      if(type == NotificationMessageHandler.assignmentsMsgs) {        
        String userId = user.getId();
        IDocTaskDAO daoMessages = (IDocTaskDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
            IDocTaskDAO.class);
        try
        {
          List<DocTaskBean> list = daoMessages.getTasksByOwner(userId);
          JSONArray items = new JSONArray();
          for(int i=0; i<list.size(); i++)
          {
            DocTaskBean bean = list.get(i);
            JSONObject json = bean.toJSON();
            items.add(json);
          }
          
          retJson.put("items", items);
          return retJson;
        }
        catch(AccessException e)
        {
          LOG.log(Level.WARNING, "Error to get notification messages: " + e);       
        }                
      }      
    }
    
    return null;
  }
}
