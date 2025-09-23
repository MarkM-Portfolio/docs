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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

public class OnpremiseRoutingPolicy implements IRoutingPolicy
{
  private static Logger LOG = Logger.getLogger(OnpremiseRoutingPolicy.class.getName());
  
  public OnpremiseRoutingPolicy()
  {
    LOG.log(Level.INFO, "Initialize On-premise routing policy");
  }
  
  @Override
  public Map<String, String> doRoute(HttpProxyServiceContext serviceContext)
  {
    Map<String, String> descMap = ConcordRequestParser.getRoutingSrvDescMap(serviceContext);
    if(descMap != null)
    {
      serviceContext.setAttribute("routeByCookie", "true");
    }
    return descMap;
  }

}
