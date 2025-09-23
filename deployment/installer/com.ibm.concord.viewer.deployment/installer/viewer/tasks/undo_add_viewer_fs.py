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

def _delete_it(scope_id, proName):
  from util import wsadminlib

  proces_def = AdminConfig.list('JavaProcessDef', scope_id)
  properties = wsadminlib._splitlines(AdminConfig.list('Property', proces_def))
  for p in properties:
      pname = AdminConfig.showAttribute(p, "name")
      if pname == proName:
          AdminConfig.remove(p)
          break

def delete_viewer_fs(args):
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
    _delete_it(scope_id , proName)
  elif scope.lower() == "cluster":
    for (server_id, nodename, server_name) in wsadminlib.getServerIDsForClusters([scope_name]):
      print "all servers in cluster: " + server_id
      _delete_it(server_id, proName)
  else:
    raise Exception(">>>>CONFIG ERROR for your Viewer server or cluster<<<<")

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK undo_add_viewer_fs.py"
    sys.exit()
  delete_viewer_fs(sys.argv)
