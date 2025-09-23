/*
 *+------------------------------------------------------------------------+
 *| Licensed Materials - Property of IBM                                   |
 *| (C) Copyright IBM Corp. 2014.  All Rights Reserved.                    |
 *|                                                                        |
 *| US Government Users Restricted Rights - Use, duplication or disclosure |
 *| restricted by GSA ADP Schedule Contract with IBM Corp.                 |
 *+------------------------------------------------------------------------+
 */
package com.ibm.docs.im.installer.common.util;


public class NodeID
{
  private String clusterName = null;

  private String nodeName = null;

  private String nodeType = null;

  public NodeID(String cluster, String name, String type)
  {
    this.clusterName = cluster;
    this.nodeName = name;
    this.nodeType = type;
  }

  @Override
  public boolean equals(Object obj)
  {
    /*
     * if (this == obj) return true;
     * 
     * if (obj == null) return false;
     * 
     * if (getClass() != obj.getClass()) return false;
     * 
     * NodeID other = (NodeID) obj; return nodeName.equalsIgnoreCase(other.nodeName) && nodeType.equalsIgnoreCase(other.nodeType);
     */

    return obj == this || obj != null && obj.getClass() == this.getClass() && ((NodeID) obj).clusterName.equals(this.clusterName)
        && ((NodeID) obj).nodeName.equals(this.nodeName) && ((NodeID) obj).nodeType.equals(this.nodeType);
  }

  @Override
  public int hashCode()
  {
    return (new StringBuffer()).append(clusterName).append(nodeName).append(nodeType).toString().hashCode();
  }
}
