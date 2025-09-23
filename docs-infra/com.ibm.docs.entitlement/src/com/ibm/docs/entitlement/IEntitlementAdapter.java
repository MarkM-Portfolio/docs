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

import javax.servlet.Filter;

import com.ibm.json.java.JSONObject;

public interface IEntitlementAdapter extends Filter
{
  public void init(JSONObject config);
}
