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

public class DocTaskHistoryBean
{
  private String historyid;

  private String taskid;

  private String creator;

  private String changeset;

  private String actiontype;

  private Timestamp actiontimestamp;

  public DocTaskHistoryBean()
  {

  }

  public String getHistoryid()
  {
    return historyid;
  }

  public void setHistoryid(String historyid)
  {
    this.historyid = historyid;
  }

  public String getTaskid()
  {
    return taskid;
  }

  public void setTaskid(String taskid)
  {
    this.taskid = taskid;
  }

  public String getCreator()
  {
    return creator;
  }

  public void setCreator(String creator)
  {
    this.creator = creator;
  }

  public String getChangeset()
  {
    return changeset;
  }

  public void setChangeset(String changeset)
  {
    this.changeset = changeset;
  }

  public String getActiontype()
  {
    return actiontype;
  }

  public void setActiontype(String actiontype)
  {
    this.actiontype = actiontype;
  }

  public Timestamp getActiontimestamp()
  {
    return actiontimestamp;
  }

  public void setActiontimestamp(Timestamp actiontimestamp)
  {
    this.actiontimestamp = actiontimestamp;
  }

  public String toString()
  {
    return "DocTaskHistoryBean [historyid=" + historyid + ", taskid=" + taskid + ", creator=" + creator + ", changeset=" + changeset
        + ", actiontype=" + actiontype + ", actiontimestamp=" + actiontimestamp + "]";
  }
}
