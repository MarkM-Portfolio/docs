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
import os

def get(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  cluster_name = args[0]

  cellName = AdminControl.getCell()
  # get cluster members
  clusterMembers = wsadminlib.listServersInCluster(cluster_name)
  print clusterMembers
  hosts = []
  for clusterMember in clusterMembers:
    node_name = AdminConfig.showAttribute( clusterMember, "nodeName" )
    server_name = AdminConfig.showAttribute( clusterMember, "memberName" )
    PROXY_HTTP_ADDRESS = wsadminlib.getServerPort(node_name, server_name, 'PROXY_HTTP_ADDRESS')
    PROXY_HTTPS_ADDRESS = wsadminlib.getServerPort(node_name, server_name, 'PROXY_HTTPS_ADDRESS')
    node_host_name = wsadminlib.getNodeHostname(node_name)
    hosts.append( (node_host_name, node_name,server_name,PROXY_HTTP_ADDRESS,PROXY_HTTPS_ADDRESS) )

  print "proxy_server_port_info =",hosts 
  print "Proxy information collected successfully!"

if __name__ == "__main__":  
  import sys
  """
    #  cluster name parameters     
  """ 
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK get_proxyservers"
    sys.exit()
  get(sys.argv)