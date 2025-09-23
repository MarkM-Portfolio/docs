# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

from common_jython.tasks.create_virtual_hosts import *
import os

def do(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  cluster_name = argv[0]

  cellName = AdminControl.getCell()
  # get cluster members
  clusterMembers = wsadminlib.listServersInCluster(cluster_name)
  print clusterMembers
  hosts = []
  for clusterMember in clusterMembers:
    node_name = AdminConfig.showAttribute( clusterMember, "nodeName" )
    server_name = AdminConfig.showAttribute( clusterMember, "memberName" )
    WC_defaulthost = wsadminlib.getServerPort(node_name, server_name, 'WC_defaulthost')
    WC_defaulthost_secure = wsadminlib.getServerPort(node_name, server_name, 'WC_defaulthost_secure')
    node_host_name = wsadminlib.getNodeHostname(node_name)
    os_type = wsadminlib.getNodePlatformOS(node_name)
    hosts.append( (node_host_name, WC_defaulthost, os_type) )

    add_virtual_hosts([node_host_name, WC_defaulthost, WC_defaulthost_secure])

  print "cluster_hosts =",hosts 
  print "Cluster information collected successfully!"
if __name__ == "__main__":
  import sys
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK collect_cluster_info"
    sys.exit()
  do(sys.argv)
