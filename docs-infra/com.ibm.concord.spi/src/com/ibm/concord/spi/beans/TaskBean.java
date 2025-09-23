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

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import com.ibm.json.java.JSONObject;

public class TaskBean
{
  private String id;

  private String title;

  private String content;

  private String tag;

  private String assignee;

  private String reviewer;

  private String author;

  private Date duedate;

  private Date createDate;

  private Date lastModify;

  private String activity;

  private String owner;

  private String state;

  private String docid;

  private String versionid;

  private String fragid;

  public static final String NEW = "new";

  public static final String WORKING = "working";

  public static final String REJECTED = "rejected";

  public static final String WAITINGREVIEW = "waitingReview";

  public static final String COMPLETE = "complete";

  // private boolean isMsgNotify = false; //for notification

  private String msgOwner; // Store the original message owner

  public TaskBean()
  {

  }

  public TaskBean(String id, String title, String content, String tag, String assignee, String reviewer, String owner, String author,
      Date duedate, Date createDate, String state, String docid, String activityId, String fragId)
  {
    this.setId(id);
    this.setTitle(title);
    this.setContent(content);
    this.setTag(tag);
    this.setAssignee(assignee);
    this.setReviewer(reviewer);
    this.setOwner(owner);
    this.setAuthor(author);
    this.setDuedate(duedate);
    this.setCreateDate(createDate);
    this.setState(state);
    this.setDocid(docid);
    this.setActivity(activityId);
  }

  public String getId()
  {
    return id;
  }

  public void setId(String id)
  {
    this.id = id;
  }

  public String getTitle()
  {
    return title;
  }

  public void setTitle(String title)
  {
    this.title = title;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

  public String getTag()
  {
    return tag;
  }

  public void setTag(String tag)
  {
    this.tag = tag;
  }

  public String getAssignee()
  {
    return assignee;
  }

  public void setAssignee(String assignee)
  {
    this.assignee = assignee;
  }

  public String getReviewer()
  {
    return reviewer;
  }

  public void setReviewer(String reviewer)
  {
    this.reviewer = reviewer;
  }

  public String getAuthor()
  {
    return author;
  }

  public void setAuthor(String author)
  {
    this.author = author;
  }

  public Date getDuedate()
  {
    return duedate;
  }

  public void setDuedate(Date duedate)
  {
    this.duedate = duedate;
  }

  public String getActivity()
  {
    return activity;
  }

  public void setActivity(String activity)
  {
    this.activity = activity;
  }

  public String getOwner()
  {
    return owner;
  }

  public void setOwner(String owner)
  {
    this.owner = owner;
  }

  public String getState()
  {
    return state;
  }

  public void setState(String state)
  {
    this.state = state;
  }

  public String getDocid()
  {
    return docid;
  }

  public void setDocid(String docid)
  {
    this.docid = docid;
  }

  public Date getCreateDate()
  {
    return createDate;
  }

  public void setCreateDate(Date createDate)
  {
    this.createDate = createDate;
  }

  public Date getLastModify()
  {
    return lastModify;
  }

  public void setLastModify(Date lastModify)
  {
    this.lastModify = lastModify;
  }

  public String getVersionid()
  {
    return versionid;
  }

  public void setVersionid(String versionid)
  {
    this.versionid = versionid;
  }

  public String getFragid()
  {
    return this.fragid;
  }

  public void setFragid(String fragid)
  {
    this.fragid = fragid;
  }

  // public boolean isMsgNotify()
  // {
  // return isMsgNotify;
  // }
  //
  // public void setMsgNotify(boolean isMsgNotify)
  // {
  // this.isMsgNotify = isMsgNotify;
  // }
  //
  public String getMsgOwner()
  {
    return msgOwner;
  }

  public void setMsgOwner(String msgOwner)
  {
    this.msgOwner = msgOwner;
  }

  public String toString()
  {
    StringBuffer taskStr = new StringBuffer();
    taskStr.append('{');
    taskStr.append("id=" + this.id + ", ");
    taskStr.append("title=" + this.title + ", ");
    taskStr.append("content=" + this.content + ", ");
    taskStr.append("tag=" + this.tag + ", ");
    taskStr.append("assignee=" + this.assignee + ", ");
    taskStr.append("reviewer=" + this.reviewer + ", ");
    taskStr.append("duedate=" + this.duedate + ", ");
    taskStr.append("lastModify=" + this.lastModify + " ");
    taskStr.append("activity=" + this.activity + ", ");
    taskStr.append("author=" + this.author + ", ");
    taskStr.append("owner=" + this.owner + ", ");
    taskStr.append("state=" + this.state + ", ");
    taskStr.append("docid=" + this.docid + ",");
    taskStr.append("versionid=" + this.versionid + " ");
    taskStr.append("fragid=" + this.fragid + ", ");
    taskStr.append("owner=" + this.owner + ", ");
    taskStr.append("createDate=" + this.createDate + " ");
    taskStr.append('}');
    return taskStr.toString();
  }

  public JSONObject toJSON()
  {
    JSONObject taskJSON = new JSONObject();
    if (this.id != null)
      taskJSON.put("id", this.id);
    if (this.title != null)
      taskJSON.put("title", this.title);
    if (this.content != null)
    {
      // strip the last reference added by TaskService
      String content = this.content.replaceAll("\\s*(<br/*>)*\\s*(<a[^>]*>).*(</a>)\\s*$", "");
      taskJSON.put("content", content);
    }
    if (this.tag != null)
      taskJSON.put("tag", this.tag);
    if (this.assignee != null)
      taskJSON.put("assignee", this.assignee);
    if (this.reviewer != null)
      taskJSON.put("reviewer", this.reviewer);
    if (this.author != null)
      taskJSON.put("author", this.author);
    if (this.duedate != null)
      taskJSON.put("duedate", this.duedate.toGMTString());
    if (this.createDate != null)
      taskJSON.put("createDate", this.createDate.toGMTString());
    if (this.lastModify != null)
      taskJSON.put("lastModify", this.lastModify.toGMTString());
    if (this.activity != null)
      taskJSON.put("activity", this.activity);
    if (this.owner != null)
      taskJSON.put("owner", this.owner);
    if (this.state != null)
      taskJSON.put("state", this.state);
    if (this.docid != null)
      taskJSON.put("docid", this.docid);
    if (this.versionid != null)
      taskJSON.put("versionid", this.versionid);
    if (this.fragid != null)
      taskJSON.put("fragid", this.fragid);
    return taskJSON;
  }

  public static TaskBean fromJSON(JSONObject taskJSON)
  {
    TaskBean task = new TaskBean();
    task.setId((String) taskJSON.get("id"));
    task.setTitle((String) taskJSON.get("title"));
    task.setContent((String) taskJSON.get("content"));
    task.setActivity((String) taskJSON.get("activity"));
    task.setTag((String) taskJSON.get("tag"));
    task.setAssignee((String) taskJSON.get("assignee"));
    task.setReviewer((String) taskJSON.get("reviewer"));
    task.setAuthor((String) taskJSON.get("author"));
    String strDate = (String) taskJSON.get("duedate");
    Date duedate = null;
    if (strDate != null)
    {
      try
      {
        duedate = new SimpleDateFormat("d MMM yyyy HH:mm:ss z", Locale.ENGLISH).parse(strDate);
      }
      catch (ParseException e)
      {
        e.printStackTrace();
      }
    }
    task.setDuedate(duedate);

    String strCreateDate = (String) taskJSON.get("createDate");
    Date createdate = null;
    if (strCreateDate != null)
    {
      try
      {
        createdate = new SimpleDateFormat("d MMM yyyy HH:mm:ss z", Locale.ENGLISH).parse(strCreateDate);
      }
      catch (ParseException e)
      {
        e.printStackTrace();
      }
    }
    task.setCreateDate(createdate);

    String strLastModifyDate = (String) taskJSON.get("lastModify");
    Date lastModifyDate = null;
    if (strLastModifyDate != null)
    {
      try
      {
        lastModifyDate = new SimpleDateFormat("d MMM yyyy HH:mm:ss z", Locale.ENGLISH).parse(strLastModifyDate);
      }
      catch (ParseException e)
      {
        e.printStackTrace();
      }
    }
    task.setLastModify(lastModifyDate);

    task.setOwner((String) taskJSON.get("owner"));
    task.setState((String) taskJSON.get("state"));
    task.setDocid((String) taskJSON.get("docid"));
    task.setVersionid((String) taskJSON.get("versionid"));
    task.setFragid((String) taskJSON.get("fragid"));
    return task;
  }
}
