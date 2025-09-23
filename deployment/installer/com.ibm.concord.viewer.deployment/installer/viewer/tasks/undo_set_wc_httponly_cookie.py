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

def delete_webcontainer(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # target_scope is 
  # for cluster target scope, /ServerCluster:clusteNmae/, 
  # for server target scope, /Node:myNode/Server:myServer/
  scope, scope_name, target_scope, proName = args

  if scope.lower() == "server":
    cell_name = AdminControl.getCell()
    scope_full = "".join(["/Cell:", cell_name, target_scope])
    scope_id = AdminConfig.getid(scope_full)
    wc = AdminConfig.list('WebContainer', scope_id)
    wsadminlib.findAndRemove('Property', [['name', proName]], wc)
  elif scope.lower() == "cluster":
    for (server_id, nodename, server_name) in wsadminlib.getServerIDsForClusters([scope_name]):
      print "all servers in cluster: " + server_id
      wc = AdminConfig.list('WebContainer', server_id)
      wsadminlib.findAndRemove('Property', [['name', proName]], wc)
  else:
    raise Exception(">>>>CONFIG ERROR for your Viewer server or cluster<<<<")


  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scopeType,nodeName,serverName,propname 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK undo_set_wc_httponly_cookie.py"
    sys.exit()
  delete_webcontainer(sys.argv)
