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
import os

def set(args):
  from common_jython.utils import wsadminlib
  from common_jython.utils import jython_common
  wsadminlib.enableDebugMessages()  
  ear_name,app_name,webserver_name,servers,clusters = args[0:5]
  jython_common.addWebServerToModulesMap(ear_name,app_name,webserver_name,servers,clusters)

  print "add_webserver_to_modules_map successfully!"

if __name__ == "__main__":  
  import sys
  """
    #  cluster name parameters     
  """ 
  if len(sys.argv) < 5:
    print ">>> Errors for arguments number passed to TASK add_webserver_to_modules_map"
    sys.exit()
  set(sys.argv)