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

def delete_config_json(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  
  config_json,bak_file = args
  
  cellName = wsadminlib.getCellName()
  srcJson = "cells"+"/"+cellName+"/"+config_json
  
  if AdminConfig.existsDocument(srcJson):
    org_doc_digest = AdminConfig.extract(srcJson,bak_file)
    AdminConfig.deleteDocument(srcJson)
    print "DelJsonConfig: " + "Successfully"
  else:
    print "DelJsonConfig: " + "None"
      
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
  delete_config_json(sys.argv)
