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

def install_directory_service(args):

  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  src_dir=args[0]
  print src_dir
  cellName = wsadminlib.getCellName()
  config_files=['directory.services.xml', 'directory.services.xsd']
  
  for file_name in config_files:
    src = os.path.join(src_dir, file_name)
    dest = os.path.join('cells', cellName, 'LotusConnections-config', file_name)
    print src, dest
    if AdminConfig.existsDocument(dest):
      AdminConfig.deleteDocument(dest)
    res=AdminConfig.createDocument(dest, src)
    if res:
      print "Successfully copy %s to %s" %(src, dest)
    else:
      print "Failed to copy %s to %s" %(src, dest) 
  
  wsadminlib.save()

if __name__ == "__main__":
  """
    #  required parameters
    #  src_dir 
  """
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  install_directory_service(sys.argv) 