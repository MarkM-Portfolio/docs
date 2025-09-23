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

  nodename = ""
  if wsadminlib.isND():
    nodename = wsadminlib.getDmgrNodeName()
    print "Viewer=NETWORK_DEPLOYMENT"
  else:
    nodename = wsadminlib.listNodes()[0]

  nodever = wsadminlib.getNodeVersion(nodename)
  if wsadminlib.versionAtLeast(nodename, args[0]):
    print "Viewer=CORRECT_VERSION"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  least_version 
  """
  if len(sys.argv) < 1:
    sys.exit(1)
  verify(sys.argv)
