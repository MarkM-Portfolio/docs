/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.entitlement.gatekeeper;

import com.ibm.docs.entitlement.bean.DocEBean;
import com.ibm.json.java.JSONObject;

public class GateKeeperEntitlement
{
  private String levelId;

  private String levelName;

  private String features;

  public GateKeeperEntitlement()
  {
  }

  public GateKeeperEntitlement(DocEBean bean)
  {
    this.levelId = bean.getLevelid();
    this.levelName = bean.getLevelName();
    this.features = bean.getFeatures();
  }

  /**
   * To get the entitlement level id
   * 
   * @return
   */
  public String getLevelId()
  {
    return levelId;
  }

  /**
   * To set the entitlement level id
   * 
   * @param levelId
   */
  public void setLevelId(String levelId)
  {
    this.levelId = levelId;
  }

  /**
   * To get the entitlement level name
   * 
   * @return
   */
  public String getLevelName()
  {
    return levelName;
  }

  /**
   * To set the entitlement level name
   * 
   * @param levelName
   */
  public void setLevelName(String levelName)
  {
    this.levelName = levelName;
  }

  /**
   * To get the entitlement features
   * 
   * @return
   */
  public String getFeatures()
  {
    return features;
  }

  /**
   * To set the entitlement features
   * 
   * @param features
   */
  public void setFeatures(String features)
  {
    this.features = features;
  }

  /**
   * 
   * @return
   */
  public JSONObject toJson()
  {
    JSONObject json = new JSONObject();
    json.put("levelId", this.levelId);
    json.put("levelName", this.levelName != null ? this.levelName : "");
    json.put("features", this.features != null ? this.features : "");

    return json;
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.Object#toString()
   */
  public String toString()
  {
    return toJson().toString();
  }
}
