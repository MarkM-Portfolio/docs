# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************


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
    raise Exception(">>>>CONFIG ERROR for your HCL Docs server or cluster<<<<")


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
