/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.proxy.filter.routing;

import java.util.List;

import com.ibm.json.java.JSONObject;

public interface IRoutingCriteria
{
  /**
   * check if the member satisfy the routing criteria
   * @param m
   * @param criteriaData
   * @return
   */
  public boolean satisfy(MemberIdentity m, JSONObject criteriaData);
  
  /**
   * check if should select members from given routing selector which usually contains the members in one data center
   * @param selector routing selector which contains a list of members in one data center
   * @return
   */
  public boolean check(ConcordRoutingSelector selector, JSONObject criteriaData);
}
