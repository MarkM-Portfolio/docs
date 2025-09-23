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

public class DocActivityBean
{
  public static final String REPO_ID="repo_id";
  public static final String URI = "uri";
  public static final String ACTIVITY_ID = "activity_id";
  public static final String ORGID = "orgid";
  public static final String CERATEDBY = "createdby";
  public static final String CREATIONDATE = "creationdate";

  private String repo_id;
  private String uri;
  private String activity_id;
  private String orgid;
  private String createdby;
  private Timestamp creationdate;

  public DocActivityBean()
  {
    ;
  }

  public DocActivityBean(String repoId, String uri, DocActivityBean dab)
  {
    this.repo_id = repoId;
    this.uri = uri;
    this.activity_id = dab.getActivity_id();
    this.orgid = dab.getOrgid();
    this.createdby = dab.getCreatedby();
    this.creationdate = dab.getCreationdate();
  }
  
  public String getRepo_id()
  {
    return repo_id;
  }
  public void setRepo_id(String repo_id)
  {
    this.repo_id = repo_id;
  }
  public String getUri()
  {
    return uri;
  }
  public void setUri(String uri)
  {
    this.uri = uri;
  }
  public String getActivity_id()
  {
    return activity_id;
  }
  public void setActivity_id(String activity_id)
  {
    this.activity_id = activity_id;
  }
  public String getOrgid()
  {
    return orgid;
  }
  public void setOrgid(String orgid)
  {
    this.orgid = orgid;
  }
  public String getCreatedby()
  {
    return createdby;
  }
  public void setCreatedby(String createdby)
  {
    this.createdby = createdby;
  }
  public Timestamp getCreationdate()
  {
    return creationdate;
  }
  public void setCreationdate(Timestamp creationdate)
  {
    this.creationdate = creationdate;
  }

}
