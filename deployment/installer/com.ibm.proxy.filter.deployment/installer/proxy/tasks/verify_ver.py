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
    print("IBMDocs=NETWORK_DEPLOYMENT")
  else:
    nodes = wsadminlib.listNodes()
    if len(nodes) == 0:
      nodename = args[2]
    else:
      nodename = wsadminlib.listNodes()[0]

  nodever = wsadminlib.getNodeVersion(nodename)
  if wsadminlib.versionAtLeast(nodename, args[1]):
    print("IBMDocs=CORRECT_VERSION")

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  least_version 
  """
  if (sys.argv[0]=="server" and len(sys.argv) < 3) or (sys.argv[0]=="cluster" and len(sys.argv) < 2):
    sys.exit(1)
  verify(sys.argv)
