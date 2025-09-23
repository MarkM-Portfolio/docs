/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TaskAction
{
  private static final Logger LOG = Logger.getLogger(TaskAction.class.getName());

  private String id;

  private String creator;

  private String type;

  private String taskid;

  private String summary;

  private String description;

  private Map<String, Object> prop;

  private Date datetime;
  
  private Date createDate;
  
  private int multiple;
  
  private List<String> taskIdList;

  public final static String ACTION_CREATE = "create";

  public final static String ACTION_EDIT = "edit";

  public final static String ACTION_WORKING = "working";

  public final static String ACTION_WORKDONE = "workdone";
  
  public final static String ACTION_AUTOWORKDONE = "autoworkdone";  //added to support presentation, for the system (regardless of userId) to move write to-do state to complete

  public final static String ACTION_APPROVE = "approve";

  public final static String ACTION_REJECT = "reject";
  
  public final static String ACTION_REVIEWDONE = "reviewdone";  //added to support presentation, for the system on behalf of the reviewer to move review to-do state to complete, regardless of it was approved or rejected
  
  public final static String ACTION_AUTOREVIEWDONE = "autoreviewdone";  //added to support presentation, for the system (regardless of userId) to move review to-do state to complete
  
  public final static String ACTION_SUBMIT_PRIVATE = "submitprivate";
  
  public final static String ACTION_CANCEL_PRIVATE = "cancelprivate";
  
  public final static String ACTION_REASSIGN = "reassign";
  
  public final static String ACTION_REOPEN = "reopen";
  
  public final static String ACTION_RESTORE = "restore";

  public final static String KEY_ASSIGNEE = "assignee";
  
  public final static String KEY_OLDASSIGNEE = "oldassignee";

  public final static String KEY_REVIEWER = "reviewer";
  
  public final static String KEY_OLDREVIEWER = "oldreviewer";

  public final static String KEY_DUEDATE = "duedate";
  
  public final static String KEY_OLDDUEDATE = "oldduedate";

  public final static String KEY_TASKTITLE = "tasktitle";
  
  public final static String KEY_OLDTASKTITLE = "oldtasktitle";

  public final static String KEY_TASKDESC = "taskdesc";
  
  public final static String KEY_OLDTASKDESC = "oldtaskdesc";
  
  public final static String KEY_TASKCREATEDATE = "createDate";
  
  public final static String KEY_FRAGID = "fragid";
  
  public final static String KEY_OLDFRAGID = "oldfragid";
  
  public final static String KEY_ACTIVITYID = "activityId";
  
  public final static String KEY_ACTIVITYNAME = "activityName";

  public TaskAction()
  {

  }

  public TaskAction(String id, String creator, String type, String taskid, String summary, String description, Date datetime,
      Map<String, Object> prop)
  {
    this.setId(id);
    this.setCreator(creator);
    this.setType(type);
    this.setTaskid(taskid);
    this.setDescription(description);
    this.setSummary(summary);
    if (datetime == null)
    {
      datetime = new Date();
    }
    this.setDatetime(datetime);
    this.setProp(prop);
  }

  public String getId()
  {
    return id;
  }

  public void setId(String id)
  {
    this.id = id;
  }

  public String getCreator()
  {
    return creator;
  }

  public void setCreator(String creator)
  {
    this.creator = creator;
  }

  public String getType()
  {
    return type;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public String getTaskid()
  {
    return taskid;
  }

  public void setTaskid(String taskid)
  {
    this.taskid = taskid;
  }

  public String getSummary()
  {
    return summary;
  }

  public void setSummary(String summary)
  {
    this.summary = summary;
  }

  public String getDescription()
  {
    return description;
  }

  public void setDescription(String comment)
  {
    this.description = comment;
  }

  public Date getDatetime()
  {
    return datetime;
  }

  public void setDatetime(Date datetime)
  {
    this.datetime = datetime;
  }
  
  public void setCreateDate(Date createDate)
  {
    this.createDate = createDate;
  }

  public Date getCreateDate()
  {
    return this.createDate;
  }
  
  public int getMultiple()
  {
    return multiple;
  }
  
  public void setMultiple(int multiple)
  {
    this.multiple = multiple;
  }
  
  public Map<String, Object> getProp()
  {
    return prop;
  }

  public void setProp(Map<String, Object> prop)
  {
    this.prop = prop;
  }

  public List<String> getTaskIdList()
  {
    return taskIdList;
  }
  
  public void setTaskIdList(List<String> taskIdList)
  {
    this.taskIdList = taskIdList;
  }
  
  public String toString()
  {
    return "TaskAction [id=" + id + ", creator=" + creator + ", type=" + type + ", taskid=" + taskid + ", summary=" + summary
        + ", description=" + description + ", prop=" + prop + ", datetime=" + datetime + ", createDate=" + createDate + "]";
  }
  public static TaskAction fromJSON(JSONObject actionJSON)
  {
    TaskAction action = null;
    String id = (String) actionJSON.get("id");
    String creator = (String) actionJSON.get("creator");
    String type = (String) actionJSON.get("type");
    String taskid = (String) actionJSON.get("taskid");
    String summary = (String) actionJSON.get("summary");
    String description = (String) actionJSON.get("description");
    Map<String, Object> prop = (Map<String, Object>) actionJSON.get("prop");
    String strDate = (String) actionJSON.get("datetime");
    Date datetime = null;
    if (strDate != null)
    {
      try
      {
        datetime = DateFormat.getInstance().parse(strDate);
      }
      catch (ParseException e)
      {
        LOG.warning("fromJSON failed to parse datetime " + strDate);
      }
    }
    Long multiObj = (Long) actionJSON.get("multiple");
    int multiple = -1;
    if (multiObj != null)
    {
      multiple = multiObj.intValue();
    }
    
    JSONArray ids = (JSONArray) actionJSON.get("idsArray");
    List<String> idsList = new ArrayList<String>();
    if (ids != null)
    {
      Iterator idt = ids.iterator();
      while(idt.hasNext())
      {
        idsList.add((String) idt.next());
      }
    }
    action = new TaskAction(id, creator, type, taskid, summary, description, datetime, prop);
    action.setTaskIdList(idsList);
    action.setMultiple(multiple);
    
    return action;
  }

  public JSONObject toJSON()
  {
    JSONObject actionJSON = new JSONObject();
    if (id != null)
      actionJSON.put("id", this.id);
    if (creator != null)
      actionJSON.put("creator", this.creator);
    if (type != null)
      actionJSON.put("type", this.type);
    if (taskid != null)
      actionJSON.put("taskid", this.taskid);
    if (summary != null)
      actionJSON.put("summary", this.summary);
    if (description != null)
      actionJSON.put("description", this.description);
    if (datetime != null)
      actionJSON.put("datetime", this.datetime.toGMTString());
    if(prop != null){
      Iterator<String> itProp = prop.keySet().iterator();
      JSONObject obj = new JSONObject();
      while (itProp.hasNext())
      {
        String key = itProp.next();
        obj.put(key, prop.get(key));
      } 
      actionJSON.put("prop", obj);
    }

    return actionJSON;
  }
}
