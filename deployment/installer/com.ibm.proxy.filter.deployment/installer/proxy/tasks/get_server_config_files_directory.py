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
from util import wsadminlib

def get_server_config_files_directory(args):
  wsadminlib.enableDebugMessages()
  
  node_name, server_name = args
  
  configDir = ""
  if wsadminlib.isND():
    configDir = os.path.join(wsadminlib.getWasProfileRoot(wsadminlib.getDmgrNodeName()), 'config')
  else:
    configDir = os.path.join(wsadminlib.getWasProfileRoot(node_name), 'config')
  cellsDir = os.path.join(configDir, 'cells')
  cellDir = os.path.join(cellsDir, wsadminlib.getCellName())
  nodesDir = os.path.join(cellDir, 'nodes')
  nodeDir = os.path.join(nodesDir, node_name)
  serversDir = os.path.join(nodeDir, 'servers')
  serverDir = os.path.join(serversDir, server_name)
  
  print("IBMDocs_WAS_Server_Config_Files_Dir:" + serverDir)


if __name__ == "__main__":
  import sys
  if len(sys.argv) < 2:
    wsadminlib.sop("get_server_config_files_directory:", "Errors for arguments number passed to TASK get_server_config_files_directory.py")
    sys.exit(1)
  
  get_server_config_files_directory(sys.argv)
