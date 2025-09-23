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

def map2webserver(args):
  from util import wsadminlib, jython_common
  wsadminlib.enableDebugMessages()

  ear_name, app_name = args

  jython_common.mapModulesToWebServer(ear_name, app_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, app_name, 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK install_ear"
    sys.exit()
  map2webserver(sys.argv)
