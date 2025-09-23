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

public class UserEBean
{
  private String userid;

  private String orgid;

  private String levelid;

  public UserEBean()
  {

  }

  public UserEBean(String userid, String orgid, String levelid)
  {
    super();
    this.userid = userid;
    this.orgid = orgid;
    this.levelid = levelid;
  }

  public String getUserid()
  {
    return userid;
  }

  public void setUserid(String userid)
  {
    this.userid = userid;
  }

  public String getOrgid()
  {
    return orgid;
  }

  public void setOrgid(String orgid)
  {
    this.orgid = orgid;
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
    return "UserEntilementBean [userid=" + userid + ", orgid=" + orgid + ", levelid=" + levelid + "]";
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();

    json.put("userid", this.userid);
    json.put("orgid", this.orgid);
    json.put("levelid", this.levelid);

    return json;
  }
}
