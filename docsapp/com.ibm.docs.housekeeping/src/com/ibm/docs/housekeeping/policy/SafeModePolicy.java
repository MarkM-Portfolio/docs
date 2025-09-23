/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.policy;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.housekeeping.HouseKeepingPolicy;

/**
 * 
 * In safe mode policy, specific org will be handle by docs1a or docs1b. Other organizations will be handled by docs2a or docs2b. If there
 * is no specific organization, docs1a or docs1b will handle all housekeeping task.
 * 
 */
public class SafeModePolicy extends HouseKeepingPolicy
{
  private static final Logger LOG = Logger.getLogger(BigOrgPolicy.class.getName());

  public String specificOrg;

  public SafeModePolicy(String specificOrg)
  {
    this.specificOrg = specificOrg;
  }

  private boolean isBigOrgApplied()
  {
    return (this.specificOrg != null);
  }

  public List<String> applyPolicy(List<String> orgList)
  {
    List<String> theList = new ArrayList<String>();
    String hostNumber = this.getLocalHostSerialNumber();
    if (hostNumber == null)
    {
      LOG.log(Level.SEVERE, "Failed to parse local Docs server name! Stop HouseKeeping Service");
      return new ArrayList<String>(0);
    }
    String name = getLocalHostName();
    int host = Integer.parseInt(hostNumber);
    switch (host)
      {
        case 0 :
          return orgList; // for local test
        case 1 :
          if (isBigOrgApplied())
          {
            LOG.log(Level.INFO, "Due to safe mode housekeeping policy, the server {0} will handle housekeeping task for organization {1}.",
                new Object[] { name, this.specificOrg });
            theList.add(this.specificOrg);
          }
          else
          {
            LOG.log(Level.INFO, "Due to safe mode housekeeping policy, the server {0} will handle all housekeeping task.",
                new Object[] { name });
            return orgList;
          }
          break;
        case 2 :
          if (isBigOrgApplied())
          {
            LOG.log(Level.INFO,
                "Due to safe mode housekeeping policy, the server {0} will handle housekeeping task except organization {1}.",
                new Object[] { name, this.specificOrg });
            this.getRemainder(this.specificOrg, orgList);
            return orgList;
          }
          else
          {
            LOG.log(Level.INFO, "Due to safe mode housekeeping policy, the server {0} will not take part in housekeeping task.",
                new Object[] { name });
          }
          break;
        default:
          LOG.log(Level.INFO, "Due to safe mode housekeeping policy, the server {0} will not take part in housekeeping task.",
              new Object[] { name });
          break;
      }

    return theList;
  }

}
