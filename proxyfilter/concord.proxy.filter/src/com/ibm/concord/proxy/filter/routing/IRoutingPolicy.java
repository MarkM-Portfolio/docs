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

import java.util.Map;

import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

public interface IRoutingPolicy
{
  /**
   * Route the request to the specified cluster member
   * @return map contains the key with CELLNAME, NODENAME, MEMBERNAME
   */
  public Map<String, String> doRoute(HttpProxyServiceContext serviceContext);
}
