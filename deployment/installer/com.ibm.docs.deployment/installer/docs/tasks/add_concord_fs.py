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



def _add_it(scope_id, proName, proValue):

  processDef = AdminConfig.list('JavaProcessDef', scope_id)
  #print ">>>" + processDef 
  name = ['name', proName]
  value = ['value', proValue]
  attrList = [name, value]
  AdminConfig.modify(processDef, [['environment', [attrList]]])


def add_concord_fs(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # target_scope is 
  # for cluster target scope, /ServerCluster:clusteNmae/, 
  # for server target scope, /Node:myNode/Server:myServer/
  scope, scope_name, target_scope, proName, proValue = args

  if scope.lower() == "server":
    cell_name = AdminControl.getCell()
    scope_full = "".join(["/Cell:", cell_name, target_scope])
    scope_id = AdminConfig.getid(scope_full)
    _add_it(scope_id , proName, proValue)
  elif scope.lower() == "cluster":
    for (server_id, nodename, server_name) in wsadminlib.getServerIDsForClusters([scope_name]):
      print "all servers in cluster: " + server_id
      _add_it(server_id, proName, proValue)
  else:
    raise Exception(">>>>CONFIG ERROR for your Docs server or cluster<<<<")

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 5:
    print ">>> Errors for arguments number passed to TASK add_concord_fs.py"
    sys.exit()
  add_concord_fs(sys.argv)
