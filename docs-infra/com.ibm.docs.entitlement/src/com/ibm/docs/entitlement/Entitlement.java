/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.entitlement;

import com.ibm.json.java.JSONObject;

/**
 * Presents the entitlement of the feature.
 *
 */
public class Entitlement
{
  // Specifies the feature name of this entitlement. Such as: "assignment", "coedit", this constant is 
  // defined in IEntitlementService.ENTITLE_NAME_ASSIGNMENT and IEntitlementService.ENTITLE_NAME_COEDIT.
  private String name;
  // Specifies whether this entitlement is enabled or not.
  private boolean booleanValue;
  
  /**
   * 
   * @param name
   * @param booleanValue
   */
  public Entitlement(String name, boolean booleanValue)
  {
    this.name = name;
    this.booleanValue = booleanValue;
  }
  
  /**
   * Gets the feature name of this entitlement.
   * 
   * @return
   */
  public String getName()
  {
    return this.name;
  }
  
  /**
   * Gets whether has the entitlement on specified feature or not.
   * 
   * @return
   */
  public boolean getBooleanValue()
  {
    return this.booleanValue;
  }
  
  /**
   * Sets whether has the entitlement on specified feature or not.
   * 
   * @param booleanValue
   */
  public void setBooleanValue(boolean booleanValue)
  {
    this.booleanValue = booleanValue;
  }
  
  /**
   * 
   * @return
   */
  public JSONObject toJson()
  {
    JSONObject json = new JSONObject();
    json.put("name", this.name != null ? this.name : "");
    json.put("booleanValue", this.booleanValue);
    return json;
  }
  
  /*
   * (non-Javadoc)
   * @see java.lang.Object#toString()
   */
  public String toString()
  {
    return toJson().toString();
  }
}
