/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.task;

import java.util.ArrayList;

import com.ibm.concord.platform.notification.ActivityEntry;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskAction;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class TaskMonitor
{

  /**
   * When a task is added into IBM Docs, we post an event to ActivityStream in order to send email notification
   * 
   * @param caller
   *          the person who is taking this action
   * @param taskBean
   *          object of TaskBean
   * @throws AccessException
   */
  public static ArrayList<IEmailNoticeEntry> getAddedNotifyEntries(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry)
  {

    String assignee = taskBean.getAssignee();
    String reviewer = taskBean.getReviewer();
    String actionOwner = caller.getId();
    ArrayList<IEmailNoticeEntry> entryList = new ArrayList<IEmailNoticeEntry>();
    ActivityEntry entry = null;

    // Send email notification to assignee
    if (assignee != null && !assignee.equals(actionOwner))
    {
      entry = notifyPerson(assignee, ActivityEntry.ASSIGN, caller, taskBean, docEntry);
      entryList.add(entry);
    }
    // Send email notification to reviewer
    if (reviewer != null && !reviewer.equals(actionOwner) && !reviewer.equals(assignee))
    {
      entry = notifyPerson(reviewer, ActivityEntry.REVIEW_TO_TARGET, caller, taskBean, docEntry);
      entryList.add(entry);
    }
    return entryList;

  }

  public static ArrayList<IEmailNoticeEntry> getUpdatedNotifyEntries(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry, String type)
  {
    String assignee = taskBean.getAssignee();
    String reviewer = taskBean.getReviewer();
    String actionOwner = caller.getId();
    ArrayList<IEmailNoticeEntry> entryList = new ArrayList<IEmailNoticeEntry>();
    ActivityEntry entry = null;
    if (TaskAction.ACTION_REJECT.equals(type))
    {
      // reject action by reviewer
      if (assignee != null && !assignee.equals(actionOwner))
      {
        entry = notifyPerson(assignee, ActivityEntry.REJECT_TARGET, caller, taskBean, docEntry);
        entryList.add(entry);
      }
    }
    else if (TaskAction.ACTION_APPROVE.equals(type))
    {
      // approve action by reviewer
      if (assignee != null && !assignee.equals(actionOwner))
      {
        entry = notifyPerson(assignee, ActivityEntry.APPROVE_TARGET, caller, taskBean, docEntry);
        entryList.add(entry);
      }
    }
    else if (TaskBean.COMPLETE.equals(taskBean.getState()))
    {
      // complete action by assignee
      if (reviewer != null && !reviewer.equals(actionOwner) && !reviewer.equals(assignee))
      {
        entry = notifyPerson(reviewer, ActivityEntry.COMPLETE_TARGET, caller, taskBean, docEntry);
        entryList.add(entry);
      }
    }
    else
    {
      // common update action
      return notifyAll(caller, taskBean, ActivityEntry.UPDATE_TARGET, docEntry);
    }
    return entryList;
  }

  public static ArrayList<IEmailNoticeEntry> getDeletedNotifyEntries(UserBean caller, TaskBean taskBean, IDocumentEntry docEntry)
  {
    return notifyAll(caller, taskBean, ActivityEntry.DELETE_TARGET, docEntry);
  }

  private static ArrayList<IEmailNoticeEntry> notifyAll(UserBean caller, TaskBean taskBean, String title, IDocumentEntry docEntry)
  {
    String assignee = taskBean.getAssignee();
    String reviewer = taskBean.getReviewer();
    String actionOwner = caller.getId();
    ArrayList<IEmailNoticeEntry> entryList = new ArrayList<IEmailNoticeEntry>();
    ActivityEntry entry = null;
    
    if (assignee != null && !assignee.equals(actionOwner))
    {
      entry = notifyPerson(assignee, title, caller, taskBean, docEntry);
      entryList.add(entry);
    }
    if (reviewer != null && !reviewer.equals(actionOwner) && !reviewer.equals(assignee))
    {
      entry = notifyPerson(reviewer, title, caller, taskBean, docEntry);
      entryList.add(entry);
    }
    return entryList;
  }

  private static ActivityEntry notifyPerson(String person, String title, UserBean caller, TaskBean data, IDocumentEntry docEntry)
  {
    if (person == null)
      return null;

    ActivityEntry entry = getCommonEntry(title, caller, data, docEntry);
    entry.setMailTo(person); // the person to be notified
    entry.setPersonUrl(person);
    
    return entry;
  }

  private static ActivityEntry getCommonEntry(String title, UserBean caller, TaskBean data, IDocumentEntry docEntry)
  {
    ActivityEntry entry = new ActivityEntry();
    entry.setActor(caller.getId());
    entry.setTitle(title); // template title
    // entry.setContent(data.getTitle()); // content
    entry.setUpdated();// date time
    entry.setObject(createObject(data));// assignment information as event
    entry.setTarget(createTarget(data, docEntry));// document information as file

    return entry;
  }

  /*
   * 
   * "object": { "summary": "A relatively unimportant notice", "objectType": "event", "id": "todo1", "displayName": "First Assignment",
   * "author": "test2@cn.ibm.com","startTime":"task.getDueDate()","endTime","task.getCreateDate()" }
   */
  private static JSONObject createObject(TaskBean taskBean)
  {
    JSONObject task = new JSONObject();
    task.put(ActivityEntry.ID, taskBean.getId());
    task.put(ActivityEntry.DISPLAY_NAME, taskBean.getTitle());
    task.put(ActivityEntry.OBJECT_TYPE, ActivityEntry.OBJECT_TYPE_EVENT);
    task.put(ActivityEntry.SUMMARY, taskBean.getContent());
    if (taskBean.getDuedate() != null)
      task.put(ActivityEntry.ENDTIME, taskBean.getDuedate().toGMTString());
    if (taskBean.getCreateDate() != null)
      task.put(ActivityEntry.STARTTIME, taskBean.getCreateDate().toGMTString());
    return task;
  }

  /*
   * target: { url: "http://docs03.cn.ibm.com/docs/app/doc/lcfiles/2f9363a6-4612-4ac5-ac3a-3d94d6f39db2/edit/content", id:
   * "2f9363a6-4612-4ac5-ac3a-3d94d6f39db2", displayName: "document's title", objectType: "file" }
   * 
   * @param taskBean
   * 
   * @return target JSONObject
   */
  private static JSONObject createTarget(TaskBean taskBean, IDocumentEntry docEntry)
  {
    String docId = taskBean.getDocid();
    String elements[] = docId.split("/");
    String uri = elements[1];
    String path = URLConfig.getContextPath() + "/app/doc/" + docId + "/edit/content";
    JSONObject actor = new JSONObject();
    actor.put(ActivityEntry.URL, path);
    actor.put(ActivityEntry.ID, uri);
    actor.put(ActivityEntry.DISPLAY_NAME, docEntry.getTitle());
    actor.put(ActivityEntry.OBJECT_TYPE, ActivityEntry.OBJECT_TYPE_FILE);
    return actor;
  }
}
