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

def create_clzloader(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  nodename, servername, libname = args
  wsadminlib.createSharedLibraryClassloader(nodename, servername, libname)
  wsadminlib.save()
  
  print "Create class loader on server successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodename, servername, libname,
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK created_clzloader.py"
    sys.exit()
  create_clzloader(sys.argv)
