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

def do(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  cellName = AdminControl.getCell()
  action = argv[0]
  local_file = argv[1]
  config_file = "cells/%s/IBMDocs-config/%s" % (cellName, os.path.basename(local_file))
  if AdminConfig.existsDocument(config_file):
    AdminConfig.deleteDocument(config_file)

  if action == 'do':  
    obj = AdminConfig.createDocument(config_file, local_file )

  print "Process sanity configuration file successfully!"
if __name__ == "__main__":
  import sys
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK check_in_config"
    sys.exit()
  do(sys.argv)
