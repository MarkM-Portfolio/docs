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

def undo_create_shared_lib(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  lib_name = args[0]
  wsadminlib.deleteSharedLibrary(lib_name)
  wsadminlib.save()
  
  print "Delete shared library successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK undo_create_shared_lib.py"
    sys.exit()
  undo_create_shared_lib(sys.argv)
