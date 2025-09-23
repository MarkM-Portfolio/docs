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


def create_jvm_prop(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  # target_scope is 
  # for cluster target scope, /ServerCluster:clusteNmae/, 
  # for server target scope, /Node:myNode/Server:myServer/
  # scope_name:clustername or nodename; arg3:servername
  scope,scope_name,arg3, proName1, proValue1 = args
  
  if scope.lower() == "cluster":
    for (server_id, nodename, server_name) in wsadminlib.getServerIDsForClusters([scope_name]):
      print "all servers in cluster: " + server_id
      wsadminlib.createJvmProperty(nodename, server_name, proName1, proValue1)
      #wsadminlib.createJvmProperty(nodename, server_name, proName2, proValue2)
  else :
      wsadminlib.createJvmProperty(scope_name,arg3, proName1, proValue1)

  #else:
  #  # IT MUST BE Cluster for this case
  #  raise Exception(">>>>CONFIG ERROR for your Viewer proxy cluster<<<<")

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK create_jvm_property.py"
    sys.exit()
  create_jvm_prop(sys.argv)
