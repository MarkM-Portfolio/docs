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


def associate_shared_lib(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  libname, app_name = args
  war_name=''

  print ">>>>>>>>>>" , libname, app_name
  wsadminlib.associateSharedLibrary(libname, app_name ,war_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK associate_shared_lib"
    sys.exit()
  associate_shared_lib(sys.argv)
