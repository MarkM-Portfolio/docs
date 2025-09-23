# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 
import socket

def do():
  """
    get local was install root
  """
  from util import wsadminlib

  me_hostname = socket.gethostname()
  ######
  node_ids = wsadminlib._splitlines(AdminConfig.list( 'Node' ))
  UserInstPath = None
  for node_id in node_ids:
    nodename = wsadminlib.getNodeName(node_id)
    if not wsadminlib.nodeIsIHS(nodename):
      nodeHostname = wsadminlib.getNodeHostname(nodename)
      if socket.gethostbyname(me_hostname) == socket.gethostbyname(nodeHostname):
        UserInstPath = wsadminlib.getWasInstallRoot(nodename)
        if UserInstPath:
          break
  ######
  print "return value start"
  if UserInstPath:
    print UserInstPath
  else:
    print "None"
  print "return value end"

# no paramater needed
if __name__ == '__main__':
  do()