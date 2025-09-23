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


def undo_tuneLOG(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]  
  return True


if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK tuneLOG"
    sys.exit()
  undo_tuneLOG(sys.argv)
  

