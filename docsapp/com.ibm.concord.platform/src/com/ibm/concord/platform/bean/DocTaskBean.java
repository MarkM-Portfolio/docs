/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.bean;

import java.sql.Timestamp;

import com.ibm.json.java.JSONObject;

public class DocTaskBean
{
  private String taskid;

  private String uri;
  
  private String repoid;

  private String author;
  
  private String state;
  
  private Timestamp createDate;
  
  private Timestamp duedate;
  
  private Timestamp lastModify;

  private String associationid;
  
  private String title;

  private String assignee;

  private String reviewer;  
  
  private String content;  
  
  private String versionid;

  private String fragid;
  
  private String changeset;

  public String getTaskid()
  {
    return taskid;
  }

  public void setTaskid(String taskid)
  {
    this.taskid = taskid;
  }

  public String getUri()
  {
    return uri;
  }

  public void setUri(String uri)
  {
    this.uri = uri;
  }

  public String getRepoid()
  {
    return repoid;
  }

  public void setRepoid(String repoid)
  {
    this.repoid = repoid;
  }

  public String getAuthor()
  {
    return author;
  }

  public void setAuthor(String author)
  {
    this.author = author;
  }

  public String getState()
  {
    return state;
  }

  public void setState(String state)
  {
    this.state = state;
  }

  public Timestamp getCreateDate()
  {
    return createDate;
  }

  public void setCreateDate(Timestamp createDate)
  {
    this.createDate = createDate;
  }

  public Timestamp getDuedate()
  {
    return duedate;
  }

  public void setDuedate(Timestamp duedate)
  {
    this.duedate = duedate;
  }

  public Timestamp getLastModify()
  {
    return lastModify;
  }

  public void setLastModify(Timestamp lastModify)
  {
    this.lastModify = lastModify;
  }

  public String getAssociationid()
  {
    return associationid;
  }

  public void setAssociationid(String associationid)
  {
    this.associationid = associationid;
  }

  public String getTitle()
  {
    return title;
  }

  public void setTitle(String title)
  {
    this.title = title;
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

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
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
    return fragid;
  }

  public void setFragid(String fragid)
  {
    this.fragid = fragid;
  }

  public String getChangeset()
  {
    return changeset;
  }

  public void setChangeset(String changeset)
  {
    this.changeset = changeset;
  }

  public String toString()
  {
    return "DocTaskBean [taskid=" + taskid + ", uri=" + uri + ", repoid=" + repoid + ", author=" + author + ", state=" + state
        + ", createDate=" + createDate + ", duedate=" + duedate + ", lastModify=" + lastModify + ", associationid=" + associationid
        + ", title=" + title + ", assignee=" + assignee + ", reviewer=" + reviewer + ", content=" + content + ", versionid=" + versionid
        + ", fragid=" + fragid + ", changeset=" + changeset + "]";
  }  
  
  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();    

    json.put("taskId", this.taskid);
    json.put("repoId", this.repoid);
    json.put("uri", this.uri);
    json.put("author", this.author);
    json.put("state", this.state);
    json.put("createDate", this.createDate.getTime());
    json.put("dueDate", this.duedate.getTime());
    json.put("lastModify", this.lastModify.getTime());
    json.put("title", this.title);
    json.put("assignee", this.assignee);
    json.put("reviewer", this.reviewer);
    json.put("content", this.content);
    json.put("versionid", this.versionid);
    json.put("fragid", this.fragid);
    json.put("changeset", this.changeset);
    
    return json;
  }
}
