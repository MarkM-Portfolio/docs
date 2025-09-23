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

import java.sql.Timestamp;
import java.util.UUID;

import com.ibm.json.java.JSONObject;

public class DocEBean
{
  private String levelid;

  private String levelName;

  private String features;

  private Timestamp createDate;

  public DocEBean()
  {

  }

  public DocEBean(String levelName, String features)
  {
    UUID uuid = UUID.randomUUID();
    this.levelid = uuid.toString();
    this.levelName = levelName;
    this.features = features;
  }

  public DocEBean(String levelId, String levelName, String features)
  {
    this.levelid = levelId;
    this.levelName = levelName;
    this.features = features;
  }

  public String getLevelid()
  {
    return levelid;
  }

  public void setLevelid(String levelid)
  {
    this.levelid = levelid;
  }

  public String getLevelName()
  {
    return levelName;
  }

  public void setLevelName(String levelName)
  {
    this.levelName = levelName;
  }

  public String getFeatures()
  {
    return features;
  }

  public void setFeatures(String features)
  {
    this.features = features;
  }

  public Timestamp getCreateDate()
  {
    return createDate;
  }

  public void setCreateDate(Timestamp createDate)
  {
    this.createDate = createDate;
  }

  @Override
  public String toString()
  {
    return "DocEntitlementBean [levelid=" + levelid + ", levelName=" + levelName + ", features=" + features + ", createDate=" + createDate
        + "]";
  }

  public JSONObject toJSON()
  {
    JSONObject json = new JSONObject();

    json.put("levelId", this.levelid);
    json.put("levelName", this.levelName);
    json.put("features", this.features);
    json.put("createDate", this.createDate.getTime());

    return json;
  }
}
