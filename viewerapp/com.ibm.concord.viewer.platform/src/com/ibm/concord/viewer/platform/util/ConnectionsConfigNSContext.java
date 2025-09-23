/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.util.HashSet;
import java.util.Iterator;

import javax.xml.namespace.NamespaceContext;

class ConnectionsConfigNSContext implements NamespaceContext
{
  public static final String PREFIX_SLOC = "sloc";

  public static final String PREFIX_TNS = "tns";

  public static final String PREFIX_DEFAULT = "config";

  public static final String NAMESPACE = "http://www.ibm.com/service-location";

  public static final String DEFAULT_NAMESPACE = "http://www.ibm.com/LotusConnections-config";

  public String getNamespaceURI(String prefix)
  {
    if ("sloc".equals(prefix))
    {
      return "http://www.ibm.com/service-location";
    }
    if ("tns".equals(prefix))
    {
      return "http://www.ibm.com/LotusConnections-config";
    }
    if ("config".equals(prefix))
    {
      return "http://www.ibm.com/LotusConnections-config";
    }
    return null;
  }

  public String getPrefix(String namespaceURI)
  {
    if ("http://www.ibm.com/service-location".equals(namespaceURI))
    {
      return "sloc";
    }
    return null;
  }

  public Iterator<String> getPrefixes(String namespaceURI)
  {
    HashSet<String> prefixes = new HashSet<String>();
    prefixes.add("sloc");
    prefixes.add("tns");
    return prefixes.iterator();
  }
}