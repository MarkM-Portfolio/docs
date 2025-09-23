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

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.concord.platform.task.TaskMonitor;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
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

public class DocumentTaskHandler implements GetHandler, PostHandler, DeleteHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentTaskHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");

    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, docRepo, docUri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting task list.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in getting task list.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in getting task list.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    TaskService service = new TaskService();
    JSONObject jsonResponse = new JSONObject();
    DocReferenceBean parentReference = service.getParentReference(user, docEntry);
    if (parentReference != null)
    {
      String masterDoc = parentReference.getParentRepository() + "/" + parentReference.getParentUri();
      String masterTask = parentReference.getTaskid();
      if ((parentReference.getCanceltime() == null) && (parentReference.getSubmittime() == null) && (masterTask != null))
      {
        String masterActivity = service.getActivityId(user, parentReference.getParentRepository(), parentReference.getParentUri());
        TaskBean parentTask = null;
        try
        {
          parentTask = service.getTask(user, masterActivity, masterTask);
        }
        catch (AccessException e)
        {
          parentTask = null;
        }
        String theDocId = docEntry.getRepository() + "/" + docEntry.getDocUri();
        if (parentTask != null)
        {
          if ((parentTask.getState().equalsIgnoreCase(TaskBean.WORKING)) && (parentTask.getAssignee().equals(user.getId()))
              && (theDocId.equals(parentTask.getFragid())))
          {
            jsonResponse.put("masterDoc", masterDoc);
            jsonResponse.put("masterTask", masterTask);
          }
          else
          {
            parentReference.setCanceltime(new Timestamp(System.currentTimeMillis()));
            service.updateParentReference(user, parentReference);
          }
        }
      }
    }
    String bStrictStr = request.getParameter("bStrict");
    // By default, tasks form activity server must consist of 'docid' property.
    boolean bStrict = true;
    if (bStrictStr != null)
    {
      try
      {
        bStrict = Boolean.valueOf(bStrictStr);
      }
      catch (Exception e)
      {
      }
    }

    List<TaskBean> tasks = null;
    try
    {
      tasks = service.getTasks(user, docRepo, docUri, bStrict);
    }
    catch (AccessException e)
    {
      JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }

    JSONArray tasksJson = new JSONArray();
    if ((tasks != null) && (tasks.size() > 0))
    {
      for (TaskBean task : tasks)
      {
        tasksJson.add(task.toJSON());
      }
    }

    jsonResponse.put("tasklist", tasksJson);

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);

    jsonResponse.serialize(response.getWriter(), true);

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
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while creating task.", docUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in creating task.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in creating task.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    // 'Edit' right validation
    boolean canAccess = TaskHandlerHelper.hasEditAccessRight(docEntry);
    if (!canAccess)
    {
      LOG.log(Level.WARNING, "Did not have edit permission on document {0} while creating task.", docUri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    try
    {
      JSONObject jsonBody = JSONObject.parse(request.getReader());
      TaskAction createAction = TaskAction.fromJSON(jsonBody);
      int multiple = createAction.getMultiple();

      TaskService service = new TaskService();
      JSONObject jsonActivity = null;
      String activityId = service.getActivityId(user, docRepo, docUri);
      String activityName = null;

      if (activityId != null)
      {
        activityName = service.getActivityTitle(user, activityId);
        if (activityName == null)
        {
          service.removeActLink(user, docRepo, docUri);
          activityId = null;
        }
      }

      if ((activityId == null) || (activityName == null))
      {
        // create or link an activity
        Map<String, Object> prop = createAction.getProp();
        activityName = (String) prop.get(TaskAction.KEY_ACTIVITYNAME);
        activityId = (String) prop.get(TaskAction.KEY_ACTIVITYID);
        jsonActivity = service.createOrLinkActivity(user, docEntry, activityId, activityName);
        if (jsonActivity != null)
          activityId = (String) jsonActivity.get("activityId");
      }
      else
      {
        jsonActivity = new JSONObject();
        jsonActivity.put("activityId", activityId);
        jsonActivity.put("activityName", activityName);
      }

      if (jsonActivity != null)
      {
        if (multiple == -1)
        {
          this.doSinglePost(response, service, user, docEntry, createAction, activityId, jsonActivity);
        }
        else
        {
          this.doMultiplePost(response, service, user, docEntry, createAction, activityId, jsonActivity);
        }

      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while creating task for document: " + docUri, e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
  }

  private void doSinglePost(HttpServletResponse response, TaskService service, UserBean user, IDocumentEntry docEntry,
      TaskAction createAction, String activityId, JSONObject jsonActivity) throws Exception
  {

    TaskBean task = null;
    try
    {
      task = service.createTask(user, docEntry, createAction, activityId);
    }
    catch (AccessException e)
    {
      JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }
    if (task != null)
    {
      ArrayList<IEmailNoticeEntry> entryList = TaskMonitor.getAddedNotifyEntries(user, task, docEntry);
      if (entryList != null)
      {
        service.notifyActStream(entryList, user, task, docEntry);
      }

      JSONObject jsonTask = task.toJSON();
      JSONObject jo = new JSONObject();
      jo.put("activity", jsonActivity);
      jo.put("task", jsonTask);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter(), true);
    }
    else
    {
      LOG.log(Level.WARNING, "Failed to create task in activity {0}.", activityId);
      response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }
  }

  private void doMultiplePost(HttpServletResponse response, TaskService service, UserBean user, IDocumentEntry docEntry,
      TaskAction createAction, String activityId, JSONObject jsonActivity) throws Exception
  {
    int multiple = createAction.getMultiple();
    List<TaskBean> taskList = new ArrayList<TaskBean>();
    try
    {
      for (int i = 0; i < multiple; i++)
      {
        TaskBean aTask = service.createTask(user, docEntry, createAction, activityId);
        taskList.add(aTask);
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
    if (taskList.size() > 0)
    {
      TaskBean task = taskList.get(0);
      ArrayList<IEmailNoticeEntry> entryList = TaskMonitor.getAddedNotifyEntries(user, task, docEntry);
      if (entryList != null)
      {
        service.notifyActStream(entryList, user, task, docEntry);
      }

      JSONArray array = new JSONArray();
      Iterator<TaskBean> itt = taskList.iterator();
      while (itt.hasNext())
      {
        TaskBean bean = itt.next();
        JSONObject jsonTask = bean.toJSON();
        array.add(jsonTask);
      }
      JSONObject jo = new JSONObject();
      jo.put("activity", jsonActivity);
      jo.put("tasks", array);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      jo.serialize(response.getWriter(), true);
    }
    else
    {
      LOG.log(Level.WARNING, "Failed to create task in activity {0}.", activityId);
      response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    }
  }
  
  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute("request.user");
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");

    String docRepo = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);

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
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in deleting task.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e2)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + docUri + " in deleting task.", e2);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    // 'Edit' right validation
    boolean canAccess = TaskHandlerHelper.hasEditAccessRight(docEntry);
    if (!canAccess)
    {
      LOG.log(Level.WARNING, "Did not have edit permission on document {0} while deleting task.", docUri);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    TaskService service = new TaskService();
    String activityId = service.getActivityId(user, docRepo, docUri);
    if (activityId == null)
    {
      LOG.log(Level.WARNING, "Did not find any activity of document {0} while deleting task.", docUri);
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    String state = request.getParameter("state");

    List<String> deletedTasks = null;
    try
    {
      deletedTasks = service.deleteTasks(user, docRepo, docUri, state, docEntry);
    }
    catch (AccessException e)
    {
      JSONObject json = TaskHandlerHelper.getErrorJSONObjec(e.getCode());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }

    JSONArray jsResponse = new JSONArray();
    if ((deletedTasks != null) && (deletedTasks.size() > 0))
    {
      jsResponse.addAll(deletedTasks);
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    jsResponse.serialize(response.getWriter(), true);

  }

}
