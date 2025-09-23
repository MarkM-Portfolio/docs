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

  target_scope, scope_name, node_name, proName1, proValue1 = args
  if target_scope == "server" :
    #print "Set JVM of %s.%s : %s = %s" % (node_name, scope_name, proName1, proValue1)
    wsadminlib.createJvmProperty(node_name, scope_name, proName1, proValue1)
  if target_scope == "cluster" :
    serverList = wsadminlib.listServersInCluster(scope_name)
    for serverID in serverList :
      nodeName = wsadminlib.getObjectAttribute(serverID, "nodeName")
      serverName = wsadminlib.getObjectAttribute(serverID, "memberName")
      wsadminlib.createJvmProperty(nodeName, serverName, proName1, proValue1)
      
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 5:
    print(">>> Errors for arguments number passed to TASK create_jvm_property.py")
    sys.exit()
  create_jvm_prop(sys.argv)
