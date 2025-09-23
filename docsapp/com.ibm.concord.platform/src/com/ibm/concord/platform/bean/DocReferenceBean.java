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

public class DocReferenceBean
{
  private String parentRepo;
  private String parentUri;
  private String childRepo;
  private String childUri;
  private String creatorOrgId;
  private String creatorUserId;
  private Timestamp creationDate;
  private String taskid;
  private Timestamp submittime;
  private Timestamp canceltime;
  
  public String getTaskid()
  {
    return taskid;
  }
  public void setTaskid(String taskid)
  {
    this.taskid = taskid;
  }
  public Timestamp getSubmittime()
  {
    return submittime;
  }
  public void setSubmittime(Timestamp submittime)
  {
    this.submittime = submittime;
  }
  public Timestamp getCanceltime()
  {
    return canceltime;
  }
  public void setCanceltime(Timestamp canceltime)
  {
    this.canceltime = canceltime;
  }

  
  public String getParentRepository()
  {
    return parentRepo;
  }
  public void setParentRepository(String parentRepo)
  {
    this.parentRepo = parentRepo;
  }
  
  public String getParentUri()
  {
    return parentUri;
  }
  
  public void setParentUri(String parentUri)
  {
    this.parentUri = parentUri;
  }
  
  public String getChildRepository()
  {
    return childRepo;
  }
  
  public void setChildRepository(String childRepo)
  {
    this.childRepo = childRepo;
  }
  
  public String getChildUri()
  {
    return childUri;
  }
  
  public void setChildUri(String childUri)
  {
    this.childUri = childUri;
  }
  
  public String getCreatorOrgId()
  {
    return creatorOrgId;
  }
  
  public void setCreatorOrgId(String creatorOrgId)
  {
    this.creatorOrgId = creatorOrgId;
  }
  
  public String getCreatorUserId()
  {
    return creatorUserId;
  }
  
  public void setCreatorUserId(String creatorUserId)
  {
    this.creatorUserId = creatorUserId;
  }
  
  public Timestamp getCreationDate()
  {
    return creationDate;
  }
  
  public void setCreationDate(Timestamp creationDate)
  {
    this.creationDate = creationDate;
  }

}
