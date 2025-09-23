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

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocAssociationBean;
import com.ibm.concord.platform.bean.DocTaskBean;
import com.ibm.concord.platform.bean.DocTaskHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocAssociationDAO;
import com.ibm.concord.platform.dao.IDocTaskDAO;
import com.ibm.concord.platform.dao.IDocTaskHistoryDAO;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ActivityAccessException;
import com.ibm.concord.spi.task.IActivityAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocsActivityAdapter implements IActivityAdapter
{
  private static final String logName = DocsActivityAdapter.class.getName();

  private static final Logger LOG = Logger.getLogger(logName);

  private static final String ASSOCITION_TYPE = "DB"; // db type

  private static final String USERS = "users";

  public void init(JSONObject config)
  {

  }

  public String addActivity(UserBean caller, String label, String content, String tag, Date dueDate) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActivity entering:" + ASSOCITION_TYPE + ", " + label + ", " + content + ", " + tag + ", " + dueDate + ", "
          + caller.getId());
    }
    // dueData is not used in the adapter
    UUID actId = UUID.randomUUID();
    String activity = actId.toString();
    DocAssociationBean bean = new DocAssociationBean(activity, ASSOCITION_TYPE, label, content, tag, null);
    IDocAssociationDAO associationDAO = this.getAssociationDAO();
    try
    {
      associationDAO.addAssociation(bean);
    }
    catch (Exception e)
    {
      LOG.warning("failed to add activity" + bean.toString() + ", " + caller.getId());
      activity = null;
      throw new ActivityAccessException("Unable to create Association", ActivityAccessException.EC_CREATE_ACTIVITY);
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActivity exiting: associationId=" + activity);
    }
    return activity;
  }

  public TaskBean addTodo(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addTodo2 entering: " + taskBean.toString());
    }
    UUID todoId = UUID.randomUUID();
    taskBean.setId(todoId.toString());
    taskBean.setCreateDate(new Date());

    DocTaskBean bean = AdapterUtil.convertToDAOBean(taskBean);
    IDocTaskDAO taskDAO = this.getDocTaskDAO();
    try
    {
      taskDAO.add(bean);
    }
    catch (Exception e)
    {
      LOG.warning("failed to addTodo" + taskBean.toString() + ", " + caller.getId());
      throw new ActivityAccessException("Unable to create Todo", ActivityAccessException.EC_ACTIVITY_CREATETODO);
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addTodo exiting: todoId=" + taskBean.getId());
    }
    // Notify a message
    // AbstactMessage msg = new TaskMessageImpl();
    // msg.createMessage(taskBean);
    return taskBean;
  }

  public boolean addPerson(UserBean caller, String associationId, String name, String id) throws AccessException
  {
    return addMember(caller, associationId, name, id, null);

  }

  public boolean addMember(UserBean caller, String associationId, String name, String id, String type) throws AccessException
  {
    // if (LOG.isLoggable(Level.FINER))
    // {
    // LOG.finer("addMember entering: " + associationId + ", " + name + ", " + id + ", " + caller.getId() + ", " + type);
    // }
    // IDocAssociationDAO dao = this.getAssociationDAO();
    // try
    // {
    // DocAssociationBean bean = dao.getAssociation(associationId);
    // String users = bean.getChangeset();
    // JSONObject obj = null;
    // JSONArray array = null;
    // if (users == null)
    // {
    // array = new JSONArray();
    // obj = new JSONObject();
    // array.add(id);
    // obj.put(USERS, array);
    // bean.setChangeset(obj.toString());
    // dao.updateAssociation(bean);
    // }
    // else
    // {
    // obj = JSONObject.parse(users);
    // array = (JSONArray) obj.get(USERS);
    // Iterator it = array.iterator();
    // boolean existed = false;
    // while (it.hasNext())
    // {
    // Object user = it.next();
    // if (user.toString().equals(id))
    // {
    // existed = true;
    // break;
    // }
    // }
    // if (!existed)
    // {
    // array.add(id);
    // obj.put(USERS, array);
    // bean.setChangeset(obj.toString());
    // dao.updateAssociation(bean);
    // }
    // }
    //
    // }
    // catch (Exception e)
    // {
    // throw new ActivityAccessException("Unable to add a member to activity owner list", ActivityAccessException.EC_ACTIVITY_ADDPERSON);
    // }
    // if (LOG.isLoggable(Level.FINER))
    // {
    // LOG.finer("addMember exiting");
    // }
    return true;
  }

  public boolean deleteTodo(UserBean caller, String associationid, String taskid, IDocumentEntry docEntry) throws AccessException
  {
    // Obtain task bean as to update message
    TaskBean bean = null;
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTask entering: " + associationid + ", " + taskid + ", " + caller.getId());
    }
    IDocTaskDAO taskDAO = this.getDocTaskDAO();
    try
    {
      bean = AdapterUtil.convertFromDAOBean(taskDAO.getTask(taskid));
      taskDAO.deleteByTaskID(taskid);
    }
    catch (Exception e)
    {
      LOG.warning("deleteTask: failed to deleteTask(" + associationid + ", " + taskid + ") " + caller.getId());
      throw new ActivityAccessException("Unable to delete task", ActivityAccessException.EC_ACTIVITY_DELETETODO);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTask exiting");
    }
    if (bean != null)
    {
      // Notify a message
      // AbstactMessage msg = new TaskMessageImpl();
      // msg.deleteMessage(bean);
    }

    return true;
  }

  public List<TaskBean> getTasks(UserBean caller, String associationId, String docId, boolean bSevere) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTasks entering: " + associationId);
    }
    List<TaskBean> tasks = new ArrayList<TaskBean>();
    String elements[] = docId.split("/");
    String repo = elements[0];
    String uri = elements[1];
    try
    {
      IDocTaskDAO taskDAO = this.getDocTaskDAO();
      List<DocTaskBean> beans = taskDAO.getTasks(repo, uri);
      for (DocTaskBean bean : beans)
      {
        tasks.add(AdapterUtil.convertFromDAOBean(bean));
      }
    }
    catch (Exception e)
    {
      throw new ActivityAccessException("Unable to get all tasks", ActivityAccessException.EC_ACTIVITY_GETALLTODOS);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTasks exiting: associationid=" + associationId + ", " + tasks.size() + " are found");
    }
    return tasks;
  }

  public List<TaskAction> getActions(UserBean caller, String associationId, String taskid)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActions entering: " + taskid);
    }
    List<TaskAction> actions = new ArrayList<TaskAction>();
    IDocTaskHistoryDAO taskHistoryDAO = this.getDocTaskHistoryDAO();
    try
    {
      List<DocTaskHistoryBean> beans = taskHistoryDAO.getTaskHistories(taskid);
      for (DocTaskHistoryBean bean : beans)
      {
        TaskAction action = AdapterUtil.convertFromDAOHistory(bean);
        actions.add(action);
      }
    }
    catch (Exception e)
    {

    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActions exiting: todoId=" + taskid + ", " + actions.size() + " actions are found");
    }
    return actions;
  }

  public TaskBean getTask(UserBean caller, String associationId, String todoId) throws AccessException
  {
    TaskBean task = null;
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask entering: " + todoId);
    }

    IDocTaskDAO taskDAO = this.getDocTaskDAO();
    try
    {
      DocTaskBean bean = taskDAO.getTask(todoId);
      task = AdapterUtil.convertFromDAOBean(bean);
    }
    catch (Exception e)
    {
      LOG.warning("failed to get task " + todoId + ", " + caller.getId());
      throw new ActivityAccessException("Unable to get Todo", ActivityAccessException.EC_ACTIVITY_GETTODO);
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getTask exiting: " + todoId);
    }
    return task;
  }

  public TaskBean updateTask(UserBean caller, TaskBean task, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("updateTask entering: " + task.toString());
    }

    DocTaskBean bean = AdapterUtil.convertToDAOBean(task);
    IDocTaskDAO taskDAO = this.getDocTaskDAO();
    try
    {
      taskDAO.update(bean);
    }
    catch (Exception e)
    {
      LOG.warning("failed to updateTask" + task.toString() + ", " + caller.getId());
      throw new ActivityAccessException("Unable to update Todo", ActivityAccessException.EC_ACTIVITY_CHANGETODO);
    }
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("updateTask exiting");
    }
    // if (task.isMsgNotify())
    // {
    // Notify a message
    // AbstactMessage msg = new TaskMessageImpl();
    // msg.createMessage(task);
    // }
    return task;
  }

  public void addActionHistory(UserBean caller, TaskAction action, String associationId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("addActionHistory entering: " + action.toString());
    }
    DocTaskHistoryBean bean = AdapterUtil.convertToDAOHistory(action);
    UUID historyUUID = UUID.randomUUID();
    bean.setHistoryid(historyUUID.toString());
    IDocTaskHistoryDAO taskHistoryDAO = this.getDocTaskHistoryDAO();
    try
    {
      taskHistoryDAO.addTaskHistory(bean);
    }
    catch (Exception e)
    {
      LOG.warning("failed to add task history" + action.toString() + ", " + caller.getId());
      throw new ActivityAccessException("Unable to create action history", ActivityAccessException.EC_ACTIVITY_ADDTODOHISTORY);
    }
  }

  public JSONArray getAllActivities(UserBean caller) throws AccessException
  {
    JSONArray activities = new JSONArray();
    IDocAssociationDAO associationDAO = this.getAssociationDAO();
    try
    {
      List<DocAssociationBean> beanList = associationDAO.getAssociations();
      for (DocAssociationBean bean : beanList)
      {
        String users = bean.getChangeset();
        if (users != null)
        {
          try
          {
            JSONObject obj = JSONObject.parse(users);
            JSONArray array = (JSONArray) obj.get(USERS);
            JSONObject activity = null;
            Iterator it = array.iterator();
            while (it.hasNext())
            {
              Object user = it.next();
              if (user.toString().equals(caller.getId()))
              {
                activity = new JSONObject();
                activity.put("activityId", bean.getAssociationid());
                activity.put("activityName", bean.getLabel());
                activities.add(activity);
                break;
              }
            }
          }
          catch (Exception e)
          {
            LOG.warning("failed to get user list (association id: " + bean.getAssociationid() + ") ");
            break;
          }
        }
      }
    }
    catch (Exception e)
    {
      throw new ActivityAccessException("Unable to get all activities", ActivityAccessException.EC_GET_ACTIVITY);
    }
    return activities;
  }

  public String getActivityTitle(UserBean caller, String associationId) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActivityTitle entering: associationId=" + associationId);
    }

    String title = null;
    IDocAssociationDAO associationDAO = this.getAssociationDAO();
    try
    {
      DocAssociationBean bean = associationDAO.getAssociation(associationId);
      title = bean.getLabel();
    }
    catch (Exception e)
    {
      throw new ActivityAccessException("Unable to get activity's title", ActivityAccessException.EC_ACTIVITY_GETTITLE);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("getActivityTitle exiting: associationId=" + associationId + ", title=" + title);
    }

    return title;
  }

  public List<String> deleteTasks(UserBean caller, String associationid, String docId, String state, IDocumentEntry docEntry) throws AccessException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks entering: " + associationid);
    }

    List<String> deletedEntries = new ArrayList<String>();
    try
    {
      List<TaskBean> list = this.getTasks(caller, associationid, docId, true);
      for (TaskBean task : list)
      {
        if ((task != null) && (task.getDocid() != null))
        {
          if (((docId == null) || (docId.equals(task.getDocid()))) && (state == null) || (state.equals(task.getState())))
          {
            boolean bSucc = false;
            try
            {
              bSucc = deleteTodo(caller, associationid, task.getId(), docEntry);
            }
            catch (AccessException e)
            {
              bSucc = false;
            }
            if (bSucc)
              deletedEntries.add(task.getId());
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.warning("failed to deleteTasks(" + associationid + ") ");
      throw new ActivityAccessException("Unable to delete tasks", ActivityAccessException.EC_ACTIVITY_DELETETODO);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer("deleteTasks exiting: associationid=" + associationid + ", state =" + state);
    }
    return deletedEntries;
  }

  public boolean isActivityExist(String associationId) throws AccessException
  {
    boolean exist = false;
    IDocAssociationDAO associationDAO = this.getAssociationDAO();
    try
    {
      DocAssociationBean bean = associationDAO.getAssociation(associationId);
      if (bean != null)
      {
        exist = true;
      }
    }
    catch (Exception e)
    {
    }
    return exist;
  }

  public String getPersonRole(String associationId, String userId) throws AccessException
  {
    return "owner";
  }

  private IDocTaskDAO getDocTaskDAO()
  {
    return (IDocTaskDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocTaskDAO.class);
  }

  private IDocTaskHistoryDAO getDocTaskHistoryDAO()
  {
    return (IDocTaskHistoryDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocTaskHistoryDAO.class);
  }

  private IDocAssociationDAO getAssociationDAO()
  {
    return (IDocAssociationDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocAssociationDAO.class);
  }

}
