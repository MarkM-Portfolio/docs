/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.job.context;

import java.util.ArrayList;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.TaskBean;
import com.ibm.concord.spi.notification.IEmailNoticeEntry;
import com.ibm.docs.directory.beans.UserBean;

public class ASNotificationContext extends JobContext
{
  private IDocumentEntry docEntry;

  private UserBean caller;

  private TaskBean task;
  
  private String commentId;

  private ArrayList<IEmailNoticeEntry> entryList;

  public ASNotificationContext()
  {
    super();
    this.setHeadless(true);
  }

  protected String getJobIdString()
  {
    String id = (task != null) ? task.getId() : (commentId != null) ? commentId : "";
    return docEntry.getRepository() + docEntry.getDocId() + id + ASNotificationContext.class.getSimpleName();
  }

  public IDocumentEntry getDocEntry()
  {
    return docEntry;
  }

  public void setDocEntry(IDocumentEntry docEntry)
  {
    this.docEntry = docEntry;
  }

  public UserBean getCaller()
  {
    return caller;
  }

  public void setCaller(UserBean caller)
  {
    this.caller = caller;
  }

  public TaskBean getTask()
  {
    return task;
  }

  public void setTask(TaskBean task)
  {
    this.task = task;
  }

  public ArrayList<IEmailNoticeEntry> getActivityEntries()
  {
    return entryList;
  }

  public void setActivityEntries(ArrayList<IEmailNoticeEntry> entryList)
  {
    this.entryList = entryList;
  }

  public String getCommentId()
  {
    return commentId;
  }

  public void setCommentId(String commentId)
  {
    this.commentId = commentId;
  }

}
