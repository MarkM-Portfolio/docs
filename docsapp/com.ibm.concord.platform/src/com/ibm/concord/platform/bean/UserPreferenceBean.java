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


/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class UserPreferenceBean
{
  private String user_id;
  private String prop_key;
  private String prop_value;
  private String org_id;
  private byte[] preference;


  public String getProp_key()
  {
    return prop_key;
  }

  public void setProp_key(String prop_key)
  {
    this.prop_key = prop_key;
  }

  public String getProp_value()
  {
    return prop_value;
  }

  public void setProp_value(String prop_value)
  {
    this.prop_value = prop_value;
  }

  public String getOrg_id()
  {
    return org_id;
  }

  public void setOrg_id(String org_id)
  {
    this.org_id = org_id;
  }

  public String getUserId()
  {
    return user_id;
  }

  public byte[] getPreference()
  {
    return preference;
  }

  public void setUserId(String id)
  {
    this.user_id=id;
  }

  public void setPreference(byte[] preference)
  {
    this.preference=preference;
  }
}
