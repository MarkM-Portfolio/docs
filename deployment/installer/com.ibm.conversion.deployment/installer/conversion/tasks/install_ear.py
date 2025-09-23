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


def install_ear(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # FIXME because wsadmin cannot accept "" parameter, so cannot pass empty scope_name like server or cluster
  # ear_name, scope, cluster_name, cluster_name
  # ear_name, scope, servername, node_name
  ear_name, scope_name, arg3, arg4 = args
  servers = []
  clusters = []
  if scope_name.lower() == "server":
    server={}
    server["servername"] = arg3
    server["nodename"] = arg4
    servers.append(server)
  if scope_name.lower() == "cluster":
    clusters.append(arg3)

  options = None

  wsadminlib.installApplication(ear_name, servers, clusters, options)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK install_ear"
    sys.exit()
  install_ear(sys.argv)
