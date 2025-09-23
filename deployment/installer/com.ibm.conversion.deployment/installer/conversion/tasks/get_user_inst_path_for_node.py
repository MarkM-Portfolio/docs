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
import socket

def get_it(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  #key = args[0]
  #if wsadminlib.isND():
  #  value = wsadminlib.getCellVariable(key)
  hostname = args[0]
  #nodes = wsadminlib.listAppServerNodes()
  node_ids = wsadminlib._splitlines(AdminConfig.list( 'Node' ))
  userinstpath = None
  for node_id in node_ids:
    nodename = wsadminlib.getNodeName(node_id)
    if not wsadminlib.nodeIsIHS(nodename):
      nodeHostname = wsadminlib.getNodeHostname(nodename)
      if socket.gethostbyname(hostname)== socket.gethostbyname(nodeHostname):
        user_inst_path = wsadminlib.getWasProfileRoot(nodename)
        if user_inst_path:
          print 'UserInstPath: ' + user_inst_path        
          userinstpath = "True"
          break
  if not userinstpath:
    print 'UserInstPath: ' + "None"
    
if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  get_it(sys.argv)
  
