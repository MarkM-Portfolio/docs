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

def create_shared_lib(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  libname, classpath, nativepath = args
  wsadminlib.createSharedLibrary(libname, classpath, nativepath)
  wsadminlib.save()
  
  print "Create shared library successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK created_shared_lib.py"
    sys.exit()
  create_shared_lib(sys.argv)
