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

import java.io.File;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.housekeeping.HouseKeepingPolicy;

/**
 * 
 * 1> The specific big org will be handled by one server if there are only two available Docs servers. 2> If there are more than two Docs
 * servers, docs1a/docs1b and docs2a/docs2b will be used to handle the specific org 3> Other Docs servers will handle remainder
 * organizations except the specific org.
 * 
 */
public class BigOrgPolicy extends HouseKeepingPolicy
{
  private static final Logger LOG = Logger.getLogger(BigOrgPolicy.class.getName());

  public String specificOrg;

  public BigOrgPolicy(String specificOrg)
  {
    this.specificOrg = specificOrg;
  }

  public boolean isFirstLevelHashEnabled()
  {
    String hostNumber = this.getLocalHostSerialNumber();
    if (hostNumber == null)
    {
      return false;
    }
    int host = Integer.parseInt(hostNumber);
    int servers = this.getServerNumber();
    // Currently on A3, the server number is 4. At least, the value is 2.(Never happened yet)
    return (servers > 2 && (host == 1 || host == 2));
  }

  /**
   * 
   * @param theOrg
   *          the specific organization
   * @param orgList
   *          all organizations to be housekeepinged
   * @return the assigned organizations for this Docs server
   */
  public List<String> applyPolicy(File theOrg, List<String> orgList)
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
    // No such a case on production environments currently
    if (servers == 2)
    {
      switch (host)
        {
          case 1 :
            theList.add(this.specificOrg);
            break;
          case 2 :
            this.getRemainder(this.specificOrg, orgList);
            theList = orgList;
            break;
        }
    }
    else if (servers > 2)
    {
      switch (host)
        {
          case 1 :
          case 2 :
            theList = getFirstLevelHash(theOrg, host);
            break;
          default:
            this.getRemainder(this.specificOrg, orgList);
            theList = getPartitionOrgList(orgList, host);
            break;
        }
    }
    return theList;
  }

  /**
   * 
   * @param orgList
   *          the remainder organization list
   * @param host
   *          the current host server
   * @return the partitioned organization list
   */
  private List<String> getPartitionOrgList(List<String> orgList, int host)
  {
    List<String> result = new ArrayList<String>();
    int servers = this.getServerNumber();
    // Only three servers, don't need to partition any more
    if (servers == 3)
    {
      return orgList;
    }
    // remainder servers will used to handle assigned organizations
    int remainServers = servers - 2;
    Iterator<String> ito = orgList.iterator();
    while (ito.hasNext())
    {
      String theOrg = ito.next();
      boolean isDigit = this.isDigit(theOrg);
      switch (host)
        {
          case 3 :
            if (!isDigit)
            {
              result.add(theOrg);
              break;
            }
            int intOrg = Integer.parseInt(theOrg);
            if (intOrg % remainServers == 0)
            {
              result.add(theOrg);
            }
            break;
          default:
            if (!isDigit)
            {
              break;
            }
            intOrg = Integer.parseInt(theOrg);
            if (intOrg % remainServers == (host - 3))
            {
              result.add(theOrg);
            }
            break;
        }
    }
    return result;
  }

  /**
   * Two Docs servers will be used to handle this big organization. docs1a or docs1b will handle drafts whose first level hash value is even
   * number. docs2a or docs2b will handle the remainder
   * 
   * @param theOrg
   * @param host
   * @return
   */
  private List<String> getFirstLevelHash(File theOrg, int host)
  {
    File[] files = theOrg.listFiles();
    if (files == null)
    {
      LOG.log(Level.SEVERE, "No first level hash directories have been found!");
      return new ArrayList<String>(0);
    }
    List<String> result = new ArrayList<String>();
    for (int i = 0; i < files.length; i++)
    {
      String flName = files[i].getName();
      int fl = Integer.parseInt(flName);
      switch (host)
        {
          case 1 :
            if (fl % 2 == 0)
            {
              result.add(flName);
            }
            break;
          case 2 :
            if (fl % 2 == 1)
            {
              result.add(flName);
            }
        }
    }
    return result;
  }
}
