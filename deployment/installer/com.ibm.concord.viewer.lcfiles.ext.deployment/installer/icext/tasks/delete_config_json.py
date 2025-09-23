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
  print 'in it'
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  
  bak_file = args[0]
  cellName = wsadminlib.getCellName()
  srcJson = os.path.join("cells", cellName)
  for e in args[1:]:
    srcJson = os.path.join(srcJson, e)
  srcJson = srcJson.replace("\\", "/")
  print srcJson
  
  if AdminConfig.existsDocument(srcJson):
    if bak_file == 'remove':
      print 'deleting the config'
      AdminConfig.deleteDocument(srcJson)
    else:
      print 'back up the config'
      org_doc_digest = AdminConfig.extract(srcJson, bak_file)

  print "DelJsonConfig Successfully."
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
  delete_config_json(sys.argv)
