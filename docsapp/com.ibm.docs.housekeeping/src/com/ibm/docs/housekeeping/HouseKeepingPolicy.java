/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.lotusLive.registry.RegistryParser;

public class HouseKeepingPolicy
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingPolicy.class.getName());

  private static RegistryParser registryParser = new RegistryParser();

  /**
   * 
   * @return the name of the data center
   */
  public static String getDataCenter()
  {
    String dc = registryParser.getBaseTopologyName();
    LOG.log(Level.INFO, "The data center is {0}", new Object[] { dc });
    return dc;
  }

  /**
   * 
   * @return the serial number of the server's name. It is 2 when the server is docs2a or docs2b.
   */
  protected String getLocalHostSerialNumber()
  {
    String shortHostName = getLocalHostName();
    return (shortHostName != null) ? this.getNumbers(shortHostName) : null;
  }

  /**
   * 
   * @return the the server's name
   */
  protected String getLocalHostName()
  {
    String hostName = null;
    try
    {
      hostName = InetAddress.getLocalHost().getHostName();
      if (hostName == null)
      {
        LOG.log(Level.WARNING, "Zookeeper: Could not get docs server's host name");
        return null;
      }
    }
    catch (UnknownHostException e)
    {
      LOG.log(Level.WARNING, "Failed to get the host of Docs Server", e);
      return null;
    }
    String[] names = hostName.split("\\.");
    String shortHostName = names[0];
    LOG.log(Level.INFO, "server short name is " + shortHostName);
    return shortHostName;
  }

  /**
   * 
   * @return how many Docs servers have been deployed on the environment
   */
  protected int getServerNumber()
  {
    int nodeNumber = 1;
    try
    {

      String nodes = registryParser.getSetting("Docs", "num_docs_nodes");
      int definedNum = Integer.parseInt(nodes); // usually >= 2
      if (definedNum > 1)
      {
        nodeNumber = definedNum;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not get server number", e);
    }
    return nodeNumber;
  }

  protected boolean isDigit(String strNum)
  {
    if (strNum == null)
    {
      throw new IllegalArgumentException("isDigit: The input parameter can not be null");
    }
    return strNum.matches("[0-9]{1,}");
  }

  protected String getNumbers(String content)
  {
    String regEx = "[^0-9]";
    Pattern p = Pattern.compile(regEx);
    Matcher m = p.matcher(content);
    return m.replaceAll("").trim();
  }

  protected void getRemainder(String specificOrg, List<String> orgList)
  {
    Iterator<String> ito = orgList.iterator();
    while (ito.hasNext())
    {
      String theOrg = ito.next();
      if (theOrg.equalsIgnoreCase(specificOrg))
      {
        ito.remove();
      }
    }
  }
}
