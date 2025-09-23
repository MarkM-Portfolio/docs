/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.tasksvr;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.task.TaskMonitor;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.services.rest.util.TaskHandlerHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TaskHandler implements PostHandler, PutHandler, GetHandler, DeleteHandler
{
  private static final Logger LOG = Logger.getLogger(TaskHandler.class.getName());
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPut(request, response);
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    final String taskId = getTaskId(pathMatcher);
    String docRepo = getDocRepoId(pathMatcher);
    String docUri = getDocUri(pathMatcher);
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while executing task action.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in executing task action.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch(Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in executing task action.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }   
    //'Edit' right validation
    boolean canAccess = TaskHandlerHelper.hasEditAccessRight(docEntry);
    if (!canAccess)
    {
      LOG.log(Level.WARNING, "Did not have edit permission on document {0} while executing task action.", docUri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    int validStatus = validateParameters(user, docRepo, docUri);
    if (validStatus != HttpServletResponse.SC_OK)
    {
      LOG.log(Level.WARNING, "Validating parameters failed while executing task action. Status code is {0}", validStatus);
      response.sendError(validStatus);
      return;
    }

    TaskService service = new TaskService();
        
    final String activityId = service.getActivityId(user, docRepo, docUri);
    if (activityId == null)
    {
      LOG.log(Level.WARNING, "Did not find any activity of document {0} while executing task action.", docUri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    JSONObject jsonBody = JSONObject.parse(request.getReader());
    TaskAction action = TaskAction.fromJSON(jsonBody);
    List<String> taskIdList = action.getTaskIdList();

    TaskBean task = null;
    TaskBean taskNotified = null;
    List<TaskBean> taskList = new ArrayList<TaskBean>();

    try
    {
      if (taskIdList.size() > 0)
      {
        Iterator<String> idt = taskIdList.iterator();
        while (idt.hasNext())
        {
          String id = idt.next();
          TaskBean bean = service.doAction(user, docEntry, activityId, id, action);
          taskList.add(bean);
        }
        taskNotified = taskList.get(0);
      }
      else
      {
        task = service.doAction(user, docEntry, activityId, taskId, action);
        taskNotified = task;
      }
    }
    catch (AccessException e)
    {
      JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }
    if (taskNotified != null)
    {
      ArrayList<IEmailNoticeEntry> entryList = TaskMonitor.getUpdatedNotifyEntries(user, taskNotified, docEntry, action.getType());
      if (entryList != null)
      {
        service.notifyActStream(entryList, user, taskNotified, docEntry);
      }
    }
      
    if (task != null)
    {
      JSONObject jo = task.toJSON();
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter(), true);
    }
    else if (taskList.size() > 0)
    {
      JSONArray array = new JSONArray();
      Iterator<TaskBean> itt = taskList.iterator();
      while (itt.hasNext())
      {
        TaskBean bean = itt.next();
        JSONObject jsonTask = bean.toJSON();
        array.add(jsonTask);
      }
      JSONObject jo = new JSONObject();
      jo.put("tasks", array);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter(), true);
    }
    else
    {
      LOG.log(Level.WARNING, "Failed to execute task action {0} of activity {1}.", new Object[]{taskId, activityId});
      response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String taskId = getTaskId(pathMatcher);
    String docRepo = getDocRepoId(pathMatcher);
    String docUri = getDocUri(pathMatcher);
    try
    {
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting task.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in getting task.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in getting task.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    int validStatus = validateParameters(user, docRepo, docUri);
    if (validStatus != HttpServletResponse.SC_OK)
    {
      LOG.log(Level.WARNING, "Validating parameters failed while getting task. Status code is {0}", validStatus);
      response.sendError(validStatus);
      return;
    }
    
    TaskService service = new TaskService();
   
    String activityId = service.getActivityId(user, docRepo, docUri);
    
    if (activityId == null)
    {
      LOG.log(Level.WARNING, "Did not find any activity of document {0} while getting task.", docUri);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    TaskBean task = null;
    try{
        task = service.getTask(user, activityId, taskId);
    }catch(AccessException e){
        JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        return;
    }
    if (task != null)
    {
      JSONObject jo = task.toJSON();
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);

      jo.serialize(response.getWriter(), true);
    }
    else
    {
      LOG.log(Level.WARNING, "Did not find any task of activity {0} while getting task.", activityId);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String taskId = getTaskId(pathMatcher);
    String docRepo = getDocRepoId(pathMatcher);
    String docUri = getDocUri(pathMatcher);
    
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while deleting task.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Repository access exception happens while getting the entry of document " + docUri + " in deleting task.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in deleting task.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    //'Edit' right validation
    boolean canAccess = TaskHandlerHelper.hasEditAccessRight(docEntry);
    if (!canAccess)
    {
      LOG.log(Level.WARNING, "Did not have edit permission on document {0} while deleting task.", docUri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    
    int validStatus = validateParameters(user, docRepo, docUri);
    if (validStatus != HttpServletResponse.SC_OK)
    {
      LOG.log(Level.WARNING, "Validating parameters failed while deleting task. Status code is {0}", validStatus);
      response.sendError(validStatus);
      return;
    }
        
    TaskService service = new TaskService();
   
    String activityId = service.getActivityId(user, docRepo, docUri);
    
    if (activityId == null)
    {
      LOG.log(Level.WARNING, "Did not find any activity of document {0} while deleting task.", docUri);
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }
    TaskBean taskNotified = null;
    try
    {
      taskNotified = service.getTask(user, activityId, taskId);
    }
    catch (AccessException e)
    {
    }
    
    try
    {
    	service.deleteTask(user, activityId, taskId, docEntry);
    }catch(AccessException e){
        JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        return;
    }
    if (taskNotified != null)
    {
      ArrayList<IEmailNoticeEntry> entryList = TaskMonitor.getDeletedNotifyEntries(user, taskNotified, docEntry);
      if (entryList != null)
      {
        service.notifyActStream(entryList, user, taskNotified, docEntry);
      }
    }
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

  }

  private String getDocRepoId(Matcher pathMatcher)
  {
    return pathMatcher.group(1);
  }
  
  private String getDocUri(Matcher pathMatcher)
  {
    return pathMatcher.group(2);
  }
  
  private String getTaskId(Matcher pathMatcher)
  {
    return pathMatcher.group(3);
  }
  
  private int validateParameters(UserBean user, String docRepo, String docUri)
  {
    try
    {
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        return HttpServletResponse.SC_NOT_FOUND;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, e.getErrMsg(), e);
      return HttpServletResponse.SC_FORBIDDEN;
    }
    catch(Exception e2)
    {
      LOG.log(Level.SEVERE, e2.getMessage(), e2);
      return HttpServletResponse.SC_BAD_REQUEST;
    }
    
    return HttpServletResponse.SC_OK;
  }
  
}
