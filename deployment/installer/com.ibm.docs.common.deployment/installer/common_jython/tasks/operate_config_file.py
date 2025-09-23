# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

import os
from util import wsadminlib

def extract_config(remote_file_path, local_file_path):
  """ extract file from configuration repository to local """
  wsadminlib.enableDebugMessages()
  if AdminConfig.existsDocument(remote_file_path):
    AdminConfig.extract(remote_file_path, local_file_path)
    print remote_file_path, "has been extracted to", local_file_path, "successfully"
  else:
    print remote_file_path, "doesn't exist, failed to be extracted to", local_file_path, "successfully"

def checkin_config(remote_file_path, local_file_path):
  """ check local file into configuration repository """
  wsadminlib.enableDebugMessages()
  
  # do another extract here for retrieving the digest parameter for checkin
  temp_local_file = local_file_path + ".tmp"
  if AdminConfig.existsDocument(remote_file_path):
    obj = AdminConfig.extract(remote_file_path, temp_local_file)  
    AdminConfig.checkin(remote_file_path, local_file_path, obj)
    os.remove(temp_local_file)
  else:
    AdminConfig.createDocument(remote_file_path, local_file_path)
  wsadminlib.save()
  print local_file_path, "has been checked into", remote_file_path, "successfully"

def create_config(remote_file_path, local_file_path):
  """ create a config file in configuration repository """
  wsadminlib.enableDebugMessages()
  
  # check whether the config file exists
  if AdminConfig.existsDocument(remote_file_path):
    AdminConfig.deleteDocument(remote_file_path)
  
  AdminConfig.createDocument(remote_file_path, local_file_path)
  wsadminlib.save()
  print remote_file_path, "has been created successfully"

def delete_config(remote_file_path):
  """ delete a config file in configuration repository """
  # check whether the config file exists
  if AdminConfig.existsDocument(remote_file_path):
    AdminConfig.deleteDocument(remote_file_path)
    wsadminlib.save()
  print remote_file_path, "has been deleted successfully"

def exist_config(remote_file_path):
  """ check if a config file exists in configuration repository """
  exist = AdminConfig.existsDocument(remote_file_path)
  print "check config existed successfully, %s exist:%s" % (remote_file_path, exist)

def param_err():
  print "Invalide arguments."
  sys.exit()

if __name__ == "__main__":
  """
    <Options>
    operation:          must, one of the following: "create" | "extract" | "checkin" | "delete"
    remote_file_path:   must, the document URI relative to the root of the configuration repository,
                        such as "cells/{cell name}/LotusConnections-config/LotusConnections-config.xml"
    local_file_path:    optional, the local file path, must be a valid local file name such as "/tmp/myfile.xml"
  """
  operation_map = {
                   "create":create_config,
                   "delete":delete_config,
                   "extract":extract_config,
                   "checkin":checkin_config,
                   "exist":exist_config
                  }
  
  import sys
  argv_len = len(sys.argv)
  if argv_len < 1:
    param_err()
  
  operation = sys.argv[0]
  if operation in ("create", "extract", "checkin"):
    if argv_len != 3:
      param_err()
    operation_map[operation](sys.argv[1], sys.argv[2])
    
  if operation in ("delete", "exist"):
    if argv_len != 2:
      param_err()
    operation_map[operation](sys.argv[1])

  