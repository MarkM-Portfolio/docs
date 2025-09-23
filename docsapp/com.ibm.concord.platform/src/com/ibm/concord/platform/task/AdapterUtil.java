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

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocMessageBean;
import com.ibm.concord.platform.bean.DocTaskBean;
import com.ibm.concord.platform.bean.DocTaskHistoryBean;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AdapterUtil
{
  private static final String logName = AdapterUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(logName);

  private static final String MSGS = "msgs";

  private static final String MSGS_ID = "id";

  private static final String MSGS_TIME = "time";

  public static final String TASK_MSG = "TASK";

  /**
   * Convert task to DAO bean
   * 
   * @param task
   * @return DAO bean
   */
  public static DocTaskBean convertToDAOBean(TaskBean task)
  {
    DocTaskBean bean = new DocTaskBean();
    bean.setTaskid(task.getId());
    String docId = task.getDocid();
    String elements[] = docId.split("/");
    String repo = elements[0];
    String uri = elements[1];
    bean.setUri(uri);
    bean.setRepoid(repo);
    bean.setAuthor(task.getAuthor());
    bean.setState(task.getState());
    if (task.getCreateDate() != null)
      bean.setCreateDate(new Timestamp(task.getCreateDate().getTime()));
    if (task.getDuedate() != null)
      bean.setDuedate(new Timestamp(task.getDuedate().getTime()));
    else
      bean.setDuedate(new Timestamp((new Date().getTime())));
    if (task.getLastModify() != null)
      bean.setLastModify(new Timestamp(task.getLastModify().getTime()));
    bean.setAssociationid(task.getActivity());
    bean.setTitle(task.getTitle());
    bean.setAssignee(task.getAssignee());
    bean.setReviewer(task.getReviewer());
    bean.setContent(task.getContent());
    bean.setVersionid(task.getVersionid());
    bean.setFragid(task.getFragid());
    return bean;
  }

  /**
   * Convert DAO bean to task
   * 
   * @param task
   * @return task bean
   */
  public static TaskBean convertFromDAOBean(DocTaskBean task)
  {
    TaskBean bean = new TaskBean();
    String state = task.getState();
    String assignee = task.getAssignee();
    String reviewer = task.getReviewer();
    
    bean.setId(task.getTaskid());
    bean.setDocid(task.getRepoid() + "/" + task.getUri());
    bean.setAuthor(task.getAuthor());
    bean.setState(state);
    if (task.getCreateDate() != null)
      bean.setCreateDate(new Date(task.getCreateDate().getTime()));
    if (task.getDuedate() != null)
      bean.setDuedate(new Date(task.getDuedate().getTime()));
    if (task.getLastModify() != null)
      bean.setLastModify(new Date(task.getLastModify().getTime()));
    bean.setActivity(task.getAssociationid());
    bean.setTitle(task.getTitle());
    bean.setAssignee(assignee);
    bean.setReviewer(reviewer);

    // deal with owner (task: review, write; state: new, working, waitingReview, rejected, complete)
    if (reviewer != null && reviewer.length() > 0 && state.equalsIgnoreCase(TaskBean.COMPLETE))
    {
      // if have reviewer and in complete state
      bean.setOwner(reviewer);
    }
    else if (assignee != null && assignee.length() > 0 && !state.equalsIgnoreCase(TaskBean.WAITINGREVIEW))
    {
      // if have assignee and not in waitingReview state, the owner is assignee
      bean.setOwner(assignee);
    }
    else if (reviewer != null && reviewer.length() > 0)
    {
      // otherwise, the owner is reviewer.
      bean.setOwner(reviewer);
    }
    else
    {
      LOG.warning("Can not get the task owner: task_id: " + task.getTaskid());
    }
    bean.setContent(task.getContent());
    bean.setVersionid(task.getVersionid());
    bean.setFragid(task.getFragid());
    return bean;
  }

  /**
   * Convert to Task History's DAO bean
   * 
   * @param action
   * @return
   */
  public static DocTaskHistoryBean convertToDAOHistory(TaskAction action)
  {
    DocTaskHistoryBean bean = new DocTaskHistoryBean();
    bean.setTaskid(action.getTaskid());
    bean.setCreator(action.getCreator());
    bean.setActiontype(action.getType());
    // action time is set when executing SQL insert statement
    JSONObject obj = new JSONObject();
    Map<String, Object> map = action.getProp();
    if (map != null)
    {
      Iterator<String> itProp = map.keySet().iterator();
      while (itProp.hasNext())
      {
        String key = itProp.next();
        obj.put(key, map.get(key));
      }
    }
    bean.setChangeset(obj.toString());
    return bean;
  }

  /**
   * Convert from Task history's DAO bean to object of TaskAction
   * 
   * @param bean
   * @return object of TaskAction
   */
  public static TaskAction convertFromDAOHistory(DocTaskHistoryBean bean)
  {
    TaskAction action = new TaskAction();
    action.setId(bean.getHistoryid());
    action.setTaskid(bean.getTaskid());
    action.setCreator(bean.getCreator());
    action.setType(bean.getActiontype());
    action.setDatetime(new Date(bean.getActiontimestamp().getTime()));
    String changeset = bean.getChangeset();
    if (changeset != null)
    {
      Map<String, Object> map = new HashMap<String, Object>();
      try
      {
        JSONObject obj = JSONObject.parse(changeset);
        if (obj != null)
        {
          Iterator<String> itProp = obj.keySet().iterator();
          while (itProp.hasNext())
          {
            String key = itProp.next();
            map.put(key, obj.get(key));
          }
        }
        action.setProp(map);
      }
      catch (IOException e)
      {
        LOG.warning("failed to parse task history actions: task_id: " + bean.getTaskid());
      }
    }
    return action;
  }

  /**
   * Convert task bean to message bean. (Task is the data source for message)
   * 
   * @param task
   * @return
   */
  public static DocMessageBean convertMessageBean(TaskBean task)
  {
    DocMessageBean mBean = new DocMessageBean();
    String docId = task.getDocid();
    String elements[] = docId.split("/");
    String repo = elements[0];
    String uri = elements[1];
    mBean.setUri(uri);
    mBean.setRepoid(repo);
    mBean.setUserid(task.getOwner());
    mBean.setMessageType(TASK_MSG);

    JSONArray array = new JSONArray();
    JSONObject taskObj = new JSONObject();
    taskObj.put(MSGS_ID, task.getId());
    taskObj.put(MSGS_TIME, task.getDuedate().getTime());
    array.add(taskObj);

    JSONObject root = new JSONObject();
    root.put(MSGS, array);
    // message
    mBean.setBytesMessage(root.toString());
    // expiration
    Date now = new Date();
    int epiDays = 365;
    mBean.setExpiration(new Timestamp(now.getTime() + epiDays * 24 * 60 * 60 * 1000));
    // duedate
    if (task.getDuedate() != null)
      mBean.setDuedate(new Timestamp(task.getDuedate().getTime()));
    return mBean;
  }

  /**
   * Update message bean according to task bean
   * 
   * @param bean
   * @param task
   * @return
   */
  public static void updateMessageBean(DocMessageBean bean, TaskBean task)
  {
    // update task ids
    String message = bean.getBytesMessage();
    long minDuedate = Long.MAX_VALUE;
    try
    {
      JSONObject obj = JSONObject.parse(message);
      JSONArray array = (JSONArray) obj.get(MSGS);
      Iterator it = array.iterator();
      JSONObject theObj = null;
      while (it.hasNext())
      {
        JSONObject id = (JSONObject) it.next();
        long duedate = 0;
        if (task.getId().equals(id.get(MSGS_ID)))
        {
          theObj = id;
          theObj.put(MSGS_TIME, task.getDuedate().getTime());
          duedate = task.getDuedate().getTime();          
        }
        else
        {
          duedate = (Long) id.get(MSGS_TIME);
        }
        if (duedate < minDuedate)
        {
          minDuedate = duedate;
        }
      }
      if (theObj == null)
      {
        JSONObject taskObj = new JSONObject();
        taskObj.put(MSGS_ID, task.getId());
        taskObj.put(MSGS_TIME, task.getDuedate().getTime());
        array.add(taskObj);
      }
      obj.put(MSGS, array);
      bean.setBytesMessage(obj.toString());
    }
    catch (Exception e)
    {
      LOG.warning("failed to parse message : " + bean.getBytesMessage());
    }
    // update duedate
    if (minDuedate != Long.MAX_VALUE)
      bean.setDuedate(new Timestamp(minDuedate));
  }

  /**
   * Update or remove the message
   * 
   * @param bean
   * @param task
   * @return left task ids
   */
  public static boolean removeMessageBean(DocMessageBean bean, TaskBean task)
  {
    String message = bean.getBytesMessage();
    boolean remove = false;
    long minDuedate = Long.MAX_VALUE;
    try
    {
      JSONObject obj = JSONObject.parse(message);
      JSONArray array = (JSONArray) obj.get(MSGS);
      Iterator it = array.iterator();
      while (it.hasNext())
      {
        JSONObject id = (JSONObject) it.next();
        if (task.getId().equals(id.get(MSGS_ID)))
        {
          it.remove();
        }
        else
        {
          long duedate = (Long) id.get(MSGS_TIME);
          if (duedate < minDuedate)
          {
            minDuedate = duedate;
          }
        }
      }
      if (!array.isEmpty())
      {
        obj.put(MSGS, array);
        bean.setBytesMessage(obj.toString());
        bean.setDuedate(new Timestamp(minDuedate));
      }
      else
      {
        remove = true;
      }
    }
    catch (Exception e)
    {
      LOG.warning("failed to parse message : " + bean.getBytesMessage());
    }
    return remove;
  }
}
