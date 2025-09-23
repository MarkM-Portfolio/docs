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

import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerStatus;
import com.ibm.json.java.JSONObject;

public class ActiveServerRoutingCriteria implements IRoutingCriteria
{

  @Override
  public boolean satisfy(MemberIdentity m, JSONObject criteriaData)
  {
    if(m == null)
      return false;
    
    if(m.isAvailable() && m.getStatus() == ServerStatus.ACTIVE)
    {
      if(criteriaData != null && criteriaData.get("build") != null)
      {
        String buildInfo = criteriaData.get("build").toString();
        if(buildInfo.equals(m.getBuildTimeStamp()))
          return true;
      } else
        return true;
    }
    
    return false;
  }

  @Override
  public boolean check(ConcordRoutingSelector selector, JSONObject criteriaData)
  {
    if(selector.isAvailable())
      return true;
    return false;
  }

}
