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

def create_shared_lib(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  lib_name, class_path, app_name ,scope_id= args
  war_name=''
  
  wsadminlib.deleteSharedLibrary(lib_name)
#  wsadminlib.createSharedLibrary(lib_name, class_path)
  wsadminlib.createSharedLibraryWithScopeID(scope_id, lib_name, class_path)
  wsadminlib.associateSharedLibrary(lib_name, app_name ,war_name)
  wsadminlib.save()
  
  print "Create shared library successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  lib_name, class_path, app_name
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK created_shared_lib.py"
    sys.exit()
  create_shared_lib(sys.argv)
