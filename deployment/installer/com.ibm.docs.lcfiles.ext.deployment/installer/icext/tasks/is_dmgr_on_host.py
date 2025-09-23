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

def is_dmgr_on_host(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()
  hostname = args[0]
  
  dmgrNodeID = wsadminlib.getDmgrNode()
  if dmgrNodeID:
    dmgrNodeName = wsadminlib.getNodeName(dmgrNodeID)
    if dmgrNodeName:
      dmgrHostname = wsadminlib.getNodeHostname(dmgrNodeName)
      if socket.gethostbyname(hostname) == socket.gethostbyname(dmgrHostname):
        print 'IsDMGR: ' + "True"
      else:
        print 'IsDMGR: ' + "False"
    else:
      print 'IsDMGR: ' + "None"
  else:
    print 'IsDMGR: ' + "False"

if __name__ == "__main__":
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  
  is_dmgr_on_host(sys.argv)
  
