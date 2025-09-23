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
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.housekeeping.HouseKeepingPolicy;

/**
 * 
 * Assign the organizations to each Docs server due to the organization's name. All Docs servers will be used to take part in housekeeping
 * service.
 * 
 */
public class DefaultPolicy extends HouseKeepingPolicy
{
  private static final Logger LOG = Logger.getLogger(BigOrgPolicy.class.getName());

  public List<String> applyPolicy(List<String> orgList)
  {
    List<String> theList = new ArrayList<String>();
    int servers = this.getServerNumber();
    String hostNumber = this.getLocalHostSerialNumber();
    if (hostNumber == null)
    {
      LOG.log(Level.SEVERE, "Failed to parse local Docs server name! Stop HouseKeeping Service");
      return new ArrayList<String>(0);
    }
    int host = Integer.parseInt(hostNumber);

    Iterator<String> ito = orgList.iterator();
    while (ito.hasNext())
    {
      String theOrg = ito.next();
      boolean isDigit = this.isDigit(theOrg);
      switch (host)
        {
          case 0 :
            theList.add(theOrg);
            break;
          case 1 :
            if (!isDigit)
            {
              theList.add(theOrg);
              break;
            }
            int intOrg = Integer.parseInt(theOrg);
            if (intOrg % servers == 0)
            {
              theList.add(theOrg);
            }
            break;
          default:
            if (!isDigit)
            {
              break;
            }
            intOrg = Integer.parseInt(theOrg);
            if (intOrg % servers == (host - 1))
            {
              theList.add(theOrg);
            }
            break;
        }
    }
    return theList;
  }

}
