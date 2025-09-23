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



def get_it(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  #key = args[0]
  #if wsadminlib.isND():
  #  value = wsadminlib.getCellVariable(key)
  hostname = args[0]
  nodename=wsadminlib.findNodeOnHostname(hostname)  
  if nodename:
    user_inst_path = wsadminlib.getWasProfileRoot(nodename)
    if user_inst_path:
      print 'UserInstPath: ' + user_inst_path    
  else:
    nodes = wsadminlib._splitlines(AdminConfig.list( 'Node' ))
    userinstpath = None  
    for node_id in nodes:
      node_name = wsadminlib.getNodeName(node_id)
      nodeHostname = wsadminlib.getNodeHostname(node_name)
      import socket
      if socket.gethostbyname(hostname)== socket.gethostbyname(nodeHostname):
        user_inst_path = wsadminlib.getWasProfileRoot(node_name)
        if user_inst_path:
          print 'UserInstPath: ' + user_inst_path
        else:
          print 'UserInstPath: ' + "None"
        userinstpath = "True"
        break
    if not userinstpath:
      print 'UserInstPath: ' + "None"

if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  get_it(sys.argv)