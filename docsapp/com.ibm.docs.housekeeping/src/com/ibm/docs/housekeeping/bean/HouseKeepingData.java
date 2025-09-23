/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.bean;

import java.util.Date;

public class HouseKeepingData
{
  private String repoId;

  private String orgId;

  private String docId;

  private Date snapshotLastVisit;

  private Date draftLastVisit;

  private Date uploadCreated;

  public HouseKeepingData(String repoId, String orgId, String docId)
  {
    super();
    this.repoId = repoId;
    this.orgId = orgId;
    this.docId = docId;
  }

  public String getRepoId()
  {
    return repoId;
  }

  public void setRepoId(String repoId)
  {
    this.repoId = repoId;
  }

  public String getOrgId()
  {
    return orgId;
  }

  public void setOrgId(String orgId)
  {
    this.orgId = orgId;
  }

  public String getDocId()
  {
    return docId;
  }

  public void setDocId(String docId)
  {
    this.docId = docId;
  }

  public Date getSnapshotLastVisit()
  {
    return snapshotLastVisit;
  }

  public void setSnapshotLastVisit(Date snapshotLastVisit)
  {
    this.snapshotLastVisit = snapshotLastVisit;
  }

  public Date getDraftLastVisit()
  {
    return draftLastVisit;
  }

  public void setDraftLastVisit(Date draftLastVisit)
  {
    this.draftLastVisit = draftLastVisit;
  }

  public Date getUploadCreated()
  {
    return uploadCreated;
  }

  public void setUploadCreated(Date uploadCreated)
  {
    this.uploadCreated = uploadCreated;
  }

}
