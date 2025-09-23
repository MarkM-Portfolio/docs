# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-

def start_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # FIXME because wsadmin cannot accept "" parameter, so cannot pass empty scope_name like server or cluster
  # scope, cluster_name, cluster_name
  # scope, servername, node_name
  scope_name, arg2, arg3 = args
  servers = []
  clusters = []
  if scope_name.lower() == "server":
    wsadminlib.startServer(arg3, arg2)
  if scope_name.lower() == "cluster":
    wsadminlib.startCluster(arg2)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK start_server_cluster.py"
    sys.exit()
  start_it(sys.argv)
