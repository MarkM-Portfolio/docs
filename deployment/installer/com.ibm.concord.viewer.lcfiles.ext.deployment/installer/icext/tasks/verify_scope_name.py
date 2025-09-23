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

def verify(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
      
  #make sure the ViewerLCCustomizeApp will be installed on LCCluster
  #scope
  #scope_name ,LC server 
  #file_app ,Files App name in LC
  scope, scope_name, file_app = args      
  
  serverName = ""
  flag = 0
  appServers = wsadminlib.listAllAppServers()
  cell = wsadminlib.getCellName()
  
  if scope.lower() == "server":
    serverName = scope_name
  elif scope.lower() == "cluster":
    cluster_members = wsadminlib.listServersInCluster(scope_name)
    serverName = AdminConfig.showAttribute( cluster_members[0], "memberName" )
    
  for server in appServers:
    node = server[0]
    server = server[1]
    target = "WebSphere:cell="+cell+",node="+node+",server="+server 
    countFiles = AdminApp.list(target).count(file_app)
    if countFiles > 0 and server == serverName:
      flag = 1
      break        
  if flag == 0:
    raise Exception (">>> Errors for argument scope_name passed to verify_scope_name")
    
if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scope, scope_name, file_app 
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK verify_scope_name"
    sys.exit(1)
  verify(sys.argv)
