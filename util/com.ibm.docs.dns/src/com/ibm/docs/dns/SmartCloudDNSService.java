/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.dns;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import sun.net.spi.nameservice.NameService;
import sun.net.spi.nameservice.NameServiceDescriptor;
import sun.net.util.IPAddressUtil;

public class SmartCloudDNSService implements NameService
{

  private static Logger LOG = Logger.getLogger(SmartCloudDNSService.class.getName());

  // ip -> hostname
  private static Map<String, String> ipStore = new ConcurrentHashMap<String, String>();
  // hostname -> ip
  private static Map<String, String> nameStore = new ConcurrentHashMap<String, String>();
  
  public SmartCloudDNSService()
  {
	  LOG.log(Level.INFO, "construct SmartCloudDNSService");
//	  addHostAddrEntry("127.0.0.1", "localhost");
//	  addHostAddrEntry("10.1.1.68", "docsrp1.jupiter.docssandbox.cn.ibm.com");
//	  addHostAddrEntry("10.1.1.66", "base.jupiter.docssandbox.cn.ibm.com");
//      nameStore.put("localhost.localdomain", "127.0.0.1");
//      nameStore.put("docsrp1", "10.1.1.68");
  }

  public static boolean addHostAddrEntry(String addr, String hostname)
  {
    ipStore.put(addr, hostname);
    nameStore.put(hostname, addr);
    return true;
  }

  public static boolean removeHostAddrByAddr(String addr)
  {
    String name = ipStore.remove(addr);
    if (name != null)
      nameStore.remove(name);
    return true;
  }

  public static boolean removeHostAddrByHostName(String hostname)
  {
    if (hostname == null)
      return false;
    String ip = nameStore.remove(hostname);
    if (ip != null)
      ipStore.remove(ip);
//    Iterator<String> addrIter = ipStore.keySet().iterator();
//    while (addrIter.hasNext())
//    {
//      String addr = addrIter.next();
//      String name = ipStore.get(addr);
//      if (hostname.equals(name))
//      {
//        ipStore.remove(addr);
//        return true;
//      }
//    }
    return false;
  }

  @Override
  public String getHostByAddr(byte[] rawIP) throws UnknownHostException
  {
    LOG.log(Level.INFO, "getHostByAddr: " + rawIP);
    Set<Map.Entry<String, String>> entries = ipStore.entrySet();
    Iterator<Map.Entry<String, String>> iter = entries.iterator();
    while (iter.hasNext())
    {
      Map.Entry<String, String> entry = iter.next();
      String ip = entry.getKey();
      String host = entry.getValue();
      byte byteArray[] = IPAddressUtil.textToNumericFormatV4(ip);
      if (compare(byteArray, rawIP))
      {
		  LOG.log(Level.INFO, "getHostByAddr: return " + host);
        return host;
      }
    }
	 LOG.log(Level.INFO, "getHostByAddr: return localhost");
    return "localhost";
  }

  private boolean compare(byte array1[], byte array2[])
  {
    if (array1.length != array2.length)
      return false;
    for (int i = 0; i < array1.length; i++)
    {
      if (array1[i] != array2[i])
      {
        return false;
      }
    }
    return true;
  }

  @Override
  public InetAddress[] lookupAllHostAddr(String hostName) throws UnknownHostException
  {
    LOG.log(Level.INFO, "lookupAllHostAddr: " + hostName);
    Set<Map.Entry<String, String>> entries = ipStore.entrySet();
    Iterator<Map.Entry<String, String>> iter = entries.iterator();
    while (iter.hasNext())
    {
      Map.Entry<String, String> entry = iter.next();
      String ip = entry.getKey();
      String host = entry.getValue();
      if (host.equalsIgnoreCase(hostName))
      {
        //TODO: should return list
        InetAddress inets[] = new InetAddress[1];
        byte[] byteArray = IPAddressUtil.textToNumericFormatV4(ip);
        if (byteArray == null)
        {
          byteArray = IPAddressUtil.textToNumericFormatV6(ip);
        }
        inets[0] = InetAddress.getByAddress(byteArray);
		LOG.log(Level.INFO, "lookupAllHostAddr: return" + inets);
        return inets;
      }
    }
    throw new UnknownHostException();
  }
  
  public static void main(String[] args)
  {
	  System.out.println("hello");
  }

}
