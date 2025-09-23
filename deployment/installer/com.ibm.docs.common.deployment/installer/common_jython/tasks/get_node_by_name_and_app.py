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
  server_name = args[0]
  app_name = args[1]
  result = []
  servers = wsadminlib.listUnclusteredServers()
  for (node_name,server) in servers:
    if server_name == server:
      applications = AdminApp.list("WebSphere:cell=%s,node=%s" % (wsadminlib.getCellName(),node_name))
      for application in applications.split('\n'):
        if application.strip() == app_name:
          result.append((node_name,server))
          break

  print "get_node_by_name_and_app =",result 
  print "is app cluster name successfully!"

if __name__ == "__main__":  
  import sys
  """
    #  cluster name parameters     
  """ 
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK get_node_by_name_and_app"
    sys.exit()
  get(sys.argv)