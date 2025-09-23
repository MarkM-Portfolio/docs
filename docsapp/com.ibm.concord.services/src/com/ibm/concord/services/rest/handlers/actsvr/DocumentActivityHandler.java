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
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.task.TaskComponentImpl;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.services.rest.handlers.tasksvr.TaskService;
import com.ibm.concord.services.rest.util.TaskHandlerHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class DocumentActivityHandler implements GetHandler,PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentActivityHandler.class.getName());
  
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    
    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    try
    {
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Could not find the entry of document {0} while getting activity.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in getting activity.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in getting activity.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
           
    TaskService service = new TaskService();
    String activityId = service.getActivityId(user, docRepo, docUri);

    JSONObject docAct = new JSONObject();
    if ((activityId!=null) && (activityId.length()>0))
    {
        docAct.put("activityId", activityId);
    }
    else
    {
    	docAct.put("activityId", "");
    }
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    docAct.serialize(response.getWriter(), true);
  }
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    
    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    
    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, docRepo, docUri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Could not find the entry of document {0} while adding members.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in adding members.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in adding members.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    
    try
    {
      JSONObject jsonBody = JSONObject.parse(request.getReader());
      String activityId = jsonBody.get("activityId").toString();
  
      if ((activityId!=null) && (activityId.length()>0))
      {
    	  IComponent component = Platform.getComponent(TaskComponentImpl.COMPONENT_ID);
    	  IActivityAdapter activityAdapter = (IActivityAdapter) component.getService(IActivityAdapter.class);
    	  
    	  if (activityAdapter.isActivityExist(activityId))
    	  {
    		  synchronized(this){   			  
    			  TaskService service = new TaskService();
    			  try{
    				  if (service.getActivityId(user, docRepo, docUri)==null)
    				  {
    					  service.addMembers(user, docEntry, activityId, null, null);
    					  service.addActLink(user, docRepo, docUri, activityId);
    				  
    					  String activityTitle = service.getActivityTitle(user, activityId);
    				  
    					  service.publishActLinkMsg(docRepo, docUri, activityId, activityTitle);
    					  
    					  JSONObject docAct = new JSONObject();
    					  docAct.put("activityId", activityId);
    					  docAct.put("activityName", activityTitle);

    					  response.setContentType("application/json");
    					  response.setCharacterEncoding("UTF-8");
    					  response.setStatus(HttpServletResponse.SC_OK);
    					  docAct.serialize(response.getWriter(), true);    				  
    				  }
    				  else
    				  {
    					  LOG.log(Level.WARNING, "Did not get the activity id of document {0} while adding members.", docUri);
    					  response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    					  return;
    				  }
    			  }
    			  catch(AccessException e)
    			  {
    			        JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");
    			        json.serialize(response.getWriter(), true);
    			        return;
    			  }
    		  }
    	  }
    	  else
    	  {
    	    LOG.log(Level.WARNING, "The activity of document {0} does not exist while adding members.", docUri);
    	    response.sendError(HttpServletResponse.SC_FORBIDDEN);
    	  }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while adding members.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;      
    }
  }
  
  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    
    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    
    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, docRepo, docUri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Could not find the entry of document {0} while adding activity.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in adding activity.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in adding activity.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    synchronized(this){    	
    	try
    	{
    		TaskService service = new TaskService();
    		
    		if (service.getActivityId(user, docRepo, docUri)!=null)
    		{
    			LOG.log(Level.WARNING, "Did not get the activity id of document {0} while adding activity.", docUri);
    			response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
    			return;
    		}
    		
    		JSONObject jsonBody = JSONObject.parse(request.getReader());
    		String activityName  = jsonBody.get("activityName").toString();
    		
    		if ((activityName!=null) && (activityName.length()>0))
    		{
    			IComponent component = Platform.getComponent(TaskComponentImpl.COMPONENT_ID);
    			IActivityAdapter activityAdapter = (IActivityAdapter) component.getService(IActivityAdapter.class);
    			
    			try
    			{
    				String activityId = activityAdapter.addActivity(user, activityName, activityName, "", null);
    				service.addMembers(user, docEntry, activityId, null, null);
    				service.addActLink(user, docRepo, docUri, activityId);
    				
    				JSONObject activity = new JSONObject();
    				
    				activity.put("activityName", activityName);
    				activity.put("activityId", activityId);
    				
    				service.publishActLinkMsg(docRepo, docUri, activityId, activityName);
    				
    				response.setContentType("application/json");
    				response.setCharacterEncoding("UTF-8");
    				response.setStatus(HttpServletResponse.SC_CREATED);
    				activity.serialize(response.getWriter(), true);
    			}
    			catch (AccessException e)
    			{
    		        JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
    		        json.serialize(response.getWriter(), true);
    		        return;
    			}
    		}
    		
    	}
    	catch(Exception e)
    	{
    		LOG.log(Level.WARNING, "Exception happens while adding activity.", e);
    		response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    		return;      
    	}
    }
  }
  
}
