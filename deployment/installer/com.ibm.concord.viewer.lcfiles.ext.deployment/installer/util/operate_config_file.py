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

from icext.config import CONFIG as CFG
from util.common import call_wsadmin

def extract(remote_file_path, local_file_path):
  """ extract file from configuration repository to local """
  operation = "extract"
  err_msg = "Failed to extract " + remote_file_path
  operate_config_file(operation, err_msg, remote_file_path, local_file_path)
  
def checkin(remote_file_path, local_file_path):
  """ check local file into configuration repository """
  operation = "checkin"
  err_msg = "Failed to checkin " + local_file_path
  operate_config_file(operation, err_msg, remote_file_path, local_file_path)
  
def create(remote_file_path, local_file_path):
  """ create a config file in configuration repository """
  operation = "create"
  err_msg = "Failed to create " + remote_file_path
  operate_config_file(operation, err_msg, remote_file_path, local_file_path)
  
def delete(remote_file_path):
  """ delete a config file in configuration repository """
  operation = "delete"
  err_msg = "Failed to delete " + remote_file_path
  operate_config_file(operation, err_msg, remote_file_path)
  
def exist(remote_file_path):
  """ check if a config file exists in configuration repository """
  operation = "exist"
  err_msg = "Failed to check exist: " + remote_file_path
  return operate_config_file(operation, err_msg, remote_file_path)

def operate_config_file(operation, err_msg, remote_file_path, local_file_path=None):
  args = CFG.get_was_cmd_line()
  args.extend(["-f", "./icext/tasks/operate_config_file.py"])
  args.extend([operation])
  args.extend([remote_file_path])
  if local_file_path:
    local_file_path = local_file_path.replace("\\", "/")
    args.extend([local_file_path])
  succ, ws_out = call_wsadmin(args)
  if not succ or ws_out.find("successfully") < 0:
    raise Exception(err_msg)
  
  # return value is needed for exist operation
  if operation == "exist":
    if ws_out.find("exist:1") >= 0:
      return True
    else:
      return False
    