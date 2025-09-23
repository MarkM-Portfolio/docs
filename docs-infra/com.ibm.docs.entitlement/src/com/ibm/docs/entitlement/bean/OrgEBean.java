/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.entitlement.bean;

import com.ibm.json.java.JSONObject;

public class OrgEBean
{
  private String orgid;

  private String orgName;

  private String levelid;

  public OrgEBean()
  {

  }

  public OrgEBean(String orgid, String orgName, String levelid)
  {
    super();
    this.orgid = orgid;
    this.orgName = orgName;
    this.levelid = levelid;
  }

  public String getOrgid()
  {
    return orgid;
  }

  public void setOrgid(String orgid)
  {
    this.orgid = orgid;
  }

  public String getOrgName()
  {
    return orgName;
  }

  public void setOrgName(String orgName)
  {
    this.orgName = orgName;
  }

  public String getLevelid()
  {
    return levelid;
  }

  public void setLevelid(String levelid)
  {
    this.levelid = levelid;
  }

  @Override
  public String toString()
  {
    return "OrgEntitlementBean [orgid=" + orgid + ", orgName=" + orgName + ", levelid=" + levelid + "]";
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();

    json.put("orgid", this.orgid);
    json.put("orgName", this.orgName);
    json.put("levelid", this.levelid);

    return json;
  }
}
