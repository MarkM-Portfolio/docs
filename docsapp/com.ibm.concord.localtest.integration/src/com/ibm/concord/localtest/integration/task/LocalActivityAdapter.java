/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.localtest.integration.task;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalActivityAdapter implements IActivityAdapter
{
  private static final String FAKE_FOLDER = "fake_folder";
  private static final String ASSOCITION_TYPE = "Project"; // Association type

  private String activityDir;

  private HashMap<String, Object> LOCKS = new HashMap<String, Object>();

  public LocalActivityAdapter()
  {
  }

  public String addActivity(UserBean caller, String label, String content, String tag, Date dueDate) throws AccessException
  {
    UUID actId = UUID.randomUUID();
    String activityPath = activityDir + actId.toString() + ".json";

    JSONObject activityJSON = new JSONObject();
    JSONObject actMetaJSON = new JSONObject();
    actMetaJSON.put("label", label);
    actMetaJSON.put("content", content);
    actMetaJSON.put("tag", "");
    actMetaJSON.put("duedate", new Date().toString());
    activityJSON.put("meta", actMetaJSON);
    
    storeActivity(activityJSON, activityPath);
    return actId.toString();
  }
  
  public boolean isActivityExist(String activityId) throws AccessException
  {
	  
	  
	  return true;
  }
  
  public JSONArray getAllActivities(UserBean caller) throws AccessException
  {
	  JSONArray activities = new JSONArray();
	  
	  File activityPath = new File(activityDir);
	  File[] activitiesFiles = activityPath.listFiles();
	  
	  for (int i = 0; i < activitiesFiles.length; i++ )
	  {
		  File activityFile = activitiesFiles[i];
		  if (activityFile.exists() && activityFile.isFile())
		  {
			  JSONObject activityObject = getActivity(activityDir + activityFile.getName());
			  JSONObject activity = new JSONObject();
			     
			  String fileName = activityFile.getName();
			  int v = fileName.indexOf('.');
			  activity.put("activityId", fileName.substring(0, v));
			  JSONObject actMeta = (JSONObject)activityObject.get("meta");
			  activity.put("activityName", actMeta.get("label") );
			  
			  activities.add(activity);
		  }
	  }
	  
	  return activities;
  }

  private void storeActivity(JSONObject activityJSON, String path)
  {
    File activityFile = new File(path);
    if (!activityFile.exists())
      try
      {
        activityFile.createNewFile();
      }
      catch (IOException e1)
      {
        e1.printStackTrace();
      }
    
    try
    {
      FileOutputStream out = new FileOutputStream(activityFile);
      activityJSON.serialize(out, true);
      out.close();
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }

  public boolean addPerson(UserBean caller, String activityId, String name, String email) throws AccessException
  {
    return true;
  }
  
  public boolean addMember(UserBean caller, String activityId, String name, String id, String type) throws AccessException
  {
    return true;
  }
  
  public String getPersonRole(String activityId, String userId) throws AccessException
  {
	  return "owner";
  }

  public boolean deleteTodo(UserBean caller, String activityId, String todoId, IDocumentEntry docEntry) throws AccessException
  {     
    try
    {
      Object lock = getLock(activityId);
      synchronized (lock)
      {
        String activityPath = activityDir + activityId + ".json";
        JSONObject activityJSON = getActivity(activityPath);

        if (activityJSON.get("todos") == null)
        {
          // throw Exception
          return false;
        }
        JSONArray todos = (JSONArray) activityJSON.get("todos");
        for (Object todo : todos)
        {
          JSONObject todoJSON = (JSONObject) todo;
          if (todoJSON.get("id").equals(todoId))
          {
            todos.remove(todoJSON);
            break;
          }
        }
        storeActivity(activityJSON, activityPath);
        return true;
      }
    }
    finally
    {
      releaseLock(activityId);
    }
  
  }

  public Map<String, Object> doAction(UserBean caller, String activityId, String todoId, boolean finish, IDocumentEntry docEntry) throws AccessException
  {
    if (finish){
      TaskBean task = getTask(caller, activityId, todoId);
      task.setState(TaskBean.COMPLETE);
      updateTask(caller, task, docEntry);
    }else{
    
      try
      {
        Object lock = getLock(activityId);
        synchronized (lock)
        {
          String activityPath = activityDir + activityId + ".json";
          JSONObject activity = getActivity(activityPath);
          JSONObject targetTodo = findTodo(activity, todoId);
          if (finish)
          {
            targetTodo.put("state", "done");
          }
          else
          {
            targetTodo.put("state", "undone");
          }
          storeActivity(activity, activityPath);
        }
      }
      finally
      {
        releaseLock(activityId);  
      }
    }
    return getState(caller, activityId, todoId);

  }

  public JSONArray getAllTodos(UserBean caller, String assignedTo, String state)
  {
    File dir = new File(activityDir);
    JSONArray actArray = new JSONArray();
    if (!dir.exists() || !dir.isDirectory())
    {
      return actArray;
    }
    
    File[] files = dir.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.exists() && f.isFile())
      {
        try {
          JSONObject actJSON = getActivity(f.getAbsolutePath());
          JSONArray todos = (JSONArray) actJSON.get("todos");
          for (Object todo : todos)
          {
            JSONObject todoJSON = (JSONObject) todo;
            if (todoJSON.get("assignee").equals(assignedTo) && todoJSON.get("state").equals(state))
            {
              String fileName = f.getName();
              String activityId = fileName.substring(0, fileName.indexOf("."));
              todoJSON.put("activityId", activityId);
              actArray.add(todoJSON);
            }
          }
        }
        catch (Exception e)
        {
          
        }
      }
    }
    
    return actArray;
  }

  public Map<String, Object> getState(UserBean caller, String activityId, String todoId) throws AccessException
  {
    TaskBean task = getTask(caller, activityId, todoId);
    Map<String, Object> props = new HashMap<String, Object>();
    if (task != null)
    {
      if (task.getState().equals(TaskBean.COMPLETE))
      {
        props.put("state", "done");
      }
      else
      {
        props.put("state", "undone");
      }

      if (task.getOwner() != null)
      {
        props.put("assignee", task.getOwner());
      }
    }

    return props;
  }

  public boolean updateTodoState(UserBean caller, String activityId, String todoId, String state)
  {
    try
    {
      Object lock = getLock(activityId);
      synchronized(lock)
      {
        try
        {
          String activityPath = activityDir + activityId + ".json";
          JSONObject activityJSON = getActivity(activityPath);
          JSONArray todos = (JSONArray) activityJSON.get("todos");
          for (Object todo : todos)
          {
            JSONObject todoJSON = (JSONObject) todo;
            if (todoJSON.get("id").equals(todoId))
            {
              todoJSON.put("state", state);
              break;
            }
          }
          
          storeActivity(activityJSON, activityPath);
        }
        catch (RuntimeException e)
        {
          return false;
        }
      }
      return true;
    }
    finally
    {
      releaseLock(activityId);
    }
  }

  private Object getLock(String activityId)
  {
    Object lock = null;
    synchronized (LOCKS)
    {
      lock = LOCKS.get(activityId);
      if (lock == null)
      {
        lock = new Object();
        LOCKS.put(activityId, lock);
      }
    }

    return lock;
  }

  private void releaseLock(String activityId)
  {
    synchronized (LOCKS)
    {
      LOCKS.remove(activityId);
    }
  }

  private JSONObject getActivity(String activityPath)
  {
    File activityFile = new File(activityPath);
    JSONObject activityJSON = new JSONObject();
    try
    {
      if (!activityFile.exists())
      {
        // throw Exception
        return null;
      }
      FileInputStream in = new FileInputStream(activityFile);
      activityJSON = JSONObject.parse(in);
      in.close();
      return activityJSON;
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return null;
    }
  }

  private JSONObject findTodo(JSONObject activityJSON, String todoId)
  {
    if (activityJSON.get("todos") == null)
    {
      // throw Exception
      return null;
    }

    JSONArray todos = (JSONArray) activityJSON.get("todos");
    JSONObject targetTodo = null;
    for (Object todo : todos)
    {
      JSONObject todoJSON = (JSONObject) todo;
      if (todoJSON.get("id").equals(todoId))
      {
        targetTodo = todoJSON;
        break;
      }
    }
    if (targetTodo == null)
    {
      return null;
    }
    else
    {
      return targetTodo;
    }
  }
  

  public void init(JSONObject config)
  {
    activityDir = (String) config.get(FAKE_FOLDER) + File.separator;
    File dir = new File(activityDir);
    if (!dir.exists())
      dir.mkdirs();
  }

public void addActionHistory(UserBean caller, TaskAction action,
		String activityId) throws AccessException {
  try
  {
    Object lock = getLock(activityId);
    synchronized (lock)
    {
      String activityPath = activityDir + activityId + ".json";
      JSONObject activityJSON = getActivity(activityPath);
      JSONObject todoJSON = findTodo(activityJSON, action.getTaskid());
      if (todoJSON !=null )
      {
        JSONArray actions = (JSONArray) todoJSON.get("actions");
        if (actions == null)
        {
          actions = new JSONArray();
        }
        actions.add(0,action.toJSON());
        todoJSON.put("actions", actions);
        storeActivity(activityJSON, activityPath);
        return;
      }
    }
  }
  finally
  {
    releaseLock(activityId);  
  }
}

public List<TaskAction> getActions(UserBean caller, String activityId, String todoId) {
    String activityPath = activityDir + activityId + ".json";
    JSONObject activityJSON = getActivity(activityPath);
    JSONObject todoJSON = findTodo(activityJSON, todoId);
    if (todoJSON != null){
      JSONArray actionsJSON = (JSONArray) todoJSON.get("actions");
      List<TaskAction> list = new ArrayList<TaskAction>();
      for (Object actionJSON : actionsJSON)
      {
        TaskAction action = TaskAction.fromJSON((JSONObject)actionJSON);
        if (action != null)
          list.add(action);
      }
      return list;
    }
	return new ArrayList<TaskAction>();
}

public List<TaskBean> getTasks(UserBean caller, String activityId, String docId, boolean bSevere) {
    String activityPath = activityDir + activityId + ".json";
    JSONObject activity = getActivity(activityPath);
    JSONArray todosJSON = (JSONArray) activity.get("todos");
    if (todosJSON != null){
      List<TaskBean> list = new ArrayList<TaskBean>();
      for (Object todoJSON : todosJSON)
      {
        TaskBean todo = TaskBean.fromJSON((JSONObject)todoJSON);
        if ((todo != null) && (todo.getDocid()!=null))
        {
          if ((docId == null) || (docId.equals(todo.getDocid())))
            list.add(todo);
        }
       }
      return list;
    }
	return new ArrayList<TaskBean>();
}

public TaskBean addTodo(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry)
		throws AccessException {
  UUID todoId = UUID.randomUUID();
  taskBean.setId(todoId.toString());
  String activityId = taskBean.getActivity();
  try
  {
    Object lock = getLock(activityId);
    synchronized (lock)
    {
      String activityPath = activityDir + activityId + ".json";
      JSONObject activityJSON = getActivity(activityPath);
      taskBean.setCreateDate(new Date());
      JSONObject todoJSON = taskBean.toJSON();
      JSONArray todos =  (JSONArray) activityJSON.get("todos");
      if (todos == null)
      {
        todos = new JSONArray();
      }
      todos.add(todoJSON);
      activityJSON.put("todos", todos);
      storeActivity(activityJSON, activityPath);
      return taskBean;
    }
  }
  finally
  {
    releaseLock(activityId);  
  }
}

public TaskBean getTask(UserBean caller, String activityId, String todoId) {
  String activityPath = activityDir + activityId + ".json";
  JSONObject activity = getActivity(activityPath);
  JSONObject todoJSON = findTodo(activity, todoId);
  
  return TaskBean.fromJSON(todoJSON);
}

public TaskBean updateTask(UserBean caller, TaskBean task, IDocumentEntry docEntry)
		throws AccessException {
  String activityId = task.getActivity();
  String todoId = task.getId();
  try
  {
    Object lock = getLock(activityId);
    synchronized(lock)
    {
      try
      {
        String activityPath = activityDir + activityId + ".json";
        JSONObject activityJSON = getActivity(activityPath);
        JSONArray todos = (JSONArray) activityJSON.get("todos");
        for (Object todo : todos)
        {
          JSONObject todoJSON = (JSONObject) todo;
          if (todoJSON.get("id").equals(todoId))
          {         
            updateJSON(todoJSON, task);
            break;
          }
        }
        
        storeActivity(activityJSON, activityPath);
      }
      catch (RuntimeException e)
      {
        return null;
      }
    }
    return task;
  }
  finally
  {
    releaseLock(activityId);
  }

}

  private void updateJSON(JSONObject todoJSON, TaskBean task)
  {
    if (task.getId() != null)
    {
      todoJSON.put("id", task.getId());
    }
    else
    {
      todoJSON.remove("id");
    }

    if (task.getTitle() != null)
    {
      todoJSON.put("title", task.getTitle());
    }
    else
    {
      todoJSON.remove("title");
    }

    if (task.getContent() != null)
    {
      // strip the last reference added by TaskService
      String content = task.getContent().replaceAll("\\s*(<br/*>)*\\s*(<a[^>]*>).*(</a>)\\s*$", "");
      todoJSON.put("content", content);
    }
    else
    {
      todoJSON.remove("content");
    }

    if (task.getTag() != null)
    {
      todoJSON.put("tag", task.getTag());
    }
    else
    {
      todoJSON.remove("tag");
    }

    if (task.getAssignee() != null)
    {
      todoJSON.put("assignee", task.getAssignee());
    }
    else
    {
      todoJSON.remove("assignee");
    }

    if (task.getReviewer() != null)
    {
      todoJSON.put("reviewer", task.getReviewer());
    }
    else
    {
      todoJSON.remove("reviewer");
    }

    if (task.getAuthor() != null)
    {
      todoJSON.put("author", task.getAuthor());
    }
    else
    {
      todoJSON.remove("author");
    }

    if (task.getDuedate() != null)
    {
      todoJSON.put("duedate", task.getDuedate().toGMTString());
    }
    else
    {
      todoJSON.remove("duedate");
    }

    if (task.getCreateDate() != null)
    {
      todoJSON.put("createDate", task.getCreateDate().toGMTString());
    }
    else
    {
      todoJSON.remove("createDate");
    }

    if (task.getActivity() != null)
    {
      todoJSON.put("activity", task.getActivity());
    }
    else
    {
      todoJSON.remove("activity");
    }

    if (task.getOwner() != null)
    {
      todoJSON.put("owner", task.getOwner());
    }
    else
    {
      todoJSON.remove("owner");
    }

    if (task.getState() != null)
    {
      todoJSON.put("state", task.getState());
    }
    else
    {
      todoJSON.remove("state");
    }

    if (task.getDocid() != null)
    {
      todoJSON.put("docid", task.getDocid());
    }
    else
    {
      todoJSON.remove("docid");
    }

    if (task.getFragid() != null)
    {
      todoJSON.put("fragid", task.getFragid());
    }
    else
    {
      todoJSON.remove("fragid");
    }
  }

public String getActivityTitle(UserBean caller, String activityId) throws AccessException
{
  String activityPath = activityDir + activityId + ".json";
  JSONObject activityObject = this.getActivity(activityPath);
  String title = null;
  if (activityObject != null)
  {
    JSONObject actMeta = (JSONObject)activityObject.get("meta");
    title = actMeta.get("label").toString();
  }
  return title;
}

public List<String> deleteTasks(UserBean caller, String activityId, String docId, String state, IDocumentEntry docEntry) throws AccessException
{  
  List<String> deletedEntries = new ArrayList<String>();
  String activityPath = activityDir + activityId + ".json";
  JSONObject activity = getActivity(activityPath);
  JSONArray todosJSON = (JSONArray) activity.get("todos");
  if (todosJSON != null){
    List<TaskBean> list = new ArrayList<TaskBean>();
    for (Object todoJSON : todosJSON)
    {
      TaskBean todo = TaskBean.fromJSON((JSONObject)todoJSON);
      if ((todo != null) && (todo.getDocid()!=null))
      {
        if (((docId == null) || (docId.equals(todo.getDocid()))) 
            && (state == null) || (state.equals(todo.getState())))
        {
          boolean bSucc = false;
          try
          {
            bSucc = deleteTodo(caller, activityId, todo.getId(), docEntry);
          }
          catch (AccessException e)
          {
            bSucc = false;
          }
          if (bSucc)
            deletedEntries.add(todo.getId());
        }
      }
     }
  }

  return deletedEntries;
  
}
}
