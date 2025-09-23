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

def create_config_json(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  src = args[0]
  print src
  cellName = wsadminlib.getCellName()
  dest = os.path.join('cells', cellName, 'IBMDocs-config', 'viewer-config.json')
    
  if AdminConfig.existsDocument(dest):
    AdminConfig.deleteDocument(dest)
  
  print AdminConfig.createDocument(dest, src)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  create_config_json(sys.argv)
