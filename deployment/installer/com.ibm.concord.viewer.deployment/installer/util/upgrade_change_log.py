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

from viewer.config import CONFIG as CFG
import os


class ConfigChangeLog:
  
  def __init__(self, log_file_name):
    self.log_path = CFG.get_logs_dir() + os.sep + log_file_name
    if os.path.exists(self.log_path):
      os.remove(self.log_path)
      
  def log(self, content):
    log_file = open(self.log_path, 'a')
    print(content, file=log_file)
    log_file.close()
  
  def log_existed_config(self, key, current_value, recommend_value, config_path, console_log, changed=False):
    log_file = open(self.log_path, 'a')
    content = []
    content.append('The current value of parameter %s is %s ' % (key, current_value))    
    content.append('The recommended value of parameter %s is %s ' % (key, recommend_value))
    content.append('The config path is %s ' % config_path )
    if not changed:
      content.append('Upgrade scripts do not change the current value, you can modify it later if needed.')
    for line in content:
      print(line, file=log_file)
      if console_log is not None:
        console_log.info(line)
    print('', file=log_file)       
    
    log_file.close()
    
  def log_new_config(self, key, value, config_path, console_log):
    log_file = open(self.log_path, 'a')
    content = []
    content.append('Cannot find the parameter %s ' % key)    
    content.append('Upgrade scripts will set the value %s ' % value)
    content.append('The config path is %s ' % config_path )
   
    for line in content:
      print(line, file=log_file)
      if console_log is not None:
        console_log.info(line)
    
    print('', file=log_file)   
     
    log_file.close()
    
    
was_log = ConfigChangeLog('was_config_upgrade.log')
viewer_config_log = ConfigChangeLog('viewer_config_upgrade.log')