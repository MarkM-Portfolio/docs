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

import java.util.Date;

public class DocHistoryBean
{
  public static final long UPLOAD_DOCUMENT_WITHOUT_EDIT_STATUS = -1;

  public static final long NEW_DOCUMENT_WITHOUT_PUBLISH_STATUS = -2;

  public static final long TRANSFER_FAILED_WITH_OLD_DIRTY_DRAFT_STATUS = -3;

  public static final long TRANSFER_FAILED_WITHOUT_NEW_DRAFT_STATUS = -4;

  private String repoId;

  private String docUri;

  private long lastModified;

  private String orgId;

  private String docId;

  private String versionSeriesId;

  private String libraryId;

  private String communityId;

  private boolean autoPublish;

  private long lastAutoPublished = -1;

  private Date dLastVisit;

  private Date sLastVisit;

  private Date uploadCreated;

  private int status;

  public DocHistoryBean(String repoId, String docUri)
  {
    if (repoId == null || docUri == null)
    {
      throw new IllegalArgumentException();
    }

    this.repoId = repoId;
    this.docUri = docUri;
  }

  public DocHistoryBean(String repoId, String docUri, DocHistoryBean dhb)
  {
    if (repoId == null || docUri == null)
    {
      throw new IllegalArgumentException();
    }

    this.repoId = repoId;
    this.docUri = docUri;
    this.lastModified = dhb.lastModified;
    this.orgId = dhb.orgId;
    this.docId = dhb.docId;
    this.versionSeriesId = dhb.versionSeriesId;
    this.libraryId = dhb.libraryId;
    this.communityId = dhb.communityId;
    this.autoPublish = dhb.autoPublish;
    this.lastAutoPublished = dhb.lastAutoPublished;
    this.dLastVisit = dhb.dLastVisit;
    this.sLastVisit = dhb.sLastVisit;
    this.uploadCreated = dhb.uploadCreated;
    this.status = dhb.status;
  }

  public String getRepoId()
  {
    return repoId;
  }

  public String getDocUri()
  {
    return docUri;
  }

  public long getLastModified()
  {
    return lastModified;
  }

  public void setLastModified(long lastModified)
  {
    this.lastModified = lastModified;
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

  public void setDocId(String id)
  {
    docId = id;
  }

  public String getVersionSeriesId()
  {
    return versionSeriesId;
  }

  public void setVersionSeriesId(String id)
  {
    versionSeriesId = id;
  }

  public String getLibraryId()
  {
    return libraryId;
  }

  public void setLibraryId(String id)
  {
    libraryId = id;
  }

  public String getCommunityId()
  {
    return communityId;
  }

  public void setCommunityId(String id)
  {
    communityId = id;
  }

  public boolean getAutoPublish()
  {
    return autoPublish;
  }

  public void setAutoPublish(boolean enable)
  {
    autoPublish = enable;
  }

  public long getLastAutoPublished()
  {
    return lastAutoPublished;
  }

  public void setLastAutoPublished(long published)
  {
    lastAutoPublished = published;
  }

  public Date getDLastVisit()
  {
    return dLastVisit;
  }

  public void setDLastVisit(Date dLastVisit)
  {
    this.dLastVisit = dLastVisit;
  }

  public Date getSLastVisit()
  {
    return sLastVisit;
  }

  public void setSLastVisit(Date sLastVisit)
  {
    this.sLastVisit = sLastVisit;
  }

  public Date getUploadCreated()
  {
    return uploadCreated;
  }

  public void setUploadCreated(Date uploadCreated)
  {
    this.uploadCreated = uploadCreated;
  }

  public int getStatus()
  {
    return status;
  }

  public void setStatus(int status)
  {
    this.status = status;
  }

}
