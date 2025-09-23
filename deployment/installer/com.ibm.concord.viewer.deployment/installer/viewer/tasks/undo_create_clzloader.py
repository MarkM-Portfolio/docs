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

def undo_create_clzloader(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  nodename = args[0]
  servername = args[1]
  wsadminlib.deleteAllClassloaders(nodename, servername)
  wsadminlib.save()
  
  print "Delete classloader successfully"

if __name__ == "__main__":
  import sys
  """
    #  It will delete ALL classloader on the application server!
    #  required parameters
    #    nodename, servername
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_create_clzloader.py"
    sys.exit()
  undo_create_clzloader(sys.argv)
