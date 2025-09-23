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


def getSharedLibrary(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #print ">>>>>>>>", str(args)
  cell_name = AdminControl.getCell()
    
  scope = "".join(["/Cell:", cell_name])
  sharedLibName = args[1]
  
  provider_id = AdminConfig.getid(scope + '/')
  shared_lib_list = AdminConfig.list('Library', provider_id).splitlines()
  
  for shared_lib in shared_lib_list:
    if AdminConfig.showAttribute(shared_lib, 'name') == sharedLibName:
      attr = AdminConfig.show(shared_lib).splitlines()
      print "share library attributes: ", attr 
      return 
   
  print "No share library found" 

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scope, sharedLibName
  """
  if len(sys.argv) < 2:
    print "Errors for arguments number passed to TASK get_shared_libraries"
    sys.exit()
  getSharedLibrary(sys.argv)
