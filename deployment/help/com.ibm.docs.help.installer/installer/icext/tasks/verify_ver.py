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


def verify(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  nodename = ""
  if wsadminlib.isND():
    nodename = wsadminlib.getDmgrNodeName()
  else:
    nodename = wsadminlib.listNodes()[0]

  nodever = wsadminlib.getNodeVersion(nodename)
  if not wsadminlib.versionAtLeast(nodename, args[0]):
    sys.exit(1)

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  least_version 
  """
  if len(sys.argv) < 1:
    sys.exit(1)
  verify(sys.argv)
