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

  config_json,src_json = args
  cellName = wsadminlib.getCellName()
  destJson = "cells"+"/"+cellName+"/"+config_json
    
  if AdminConfig.existsDocument(destJson):
    AdminConfig.deleteDocument(destJson)
  
  print AdminConfig.createDocument(destJson,src_json)
  
  print "JsonConfig: " + config_json
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 2:
    print "Exception: invalid arguments"
    sys.exit()
  create_config_json(sys.argv)
