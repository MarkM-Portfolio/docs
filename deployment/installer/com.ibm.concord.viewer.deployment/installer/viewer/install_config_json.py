# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
"""
This command will copy viewer-config.json to ViewerFS Dir,
and make required config changes, like directory, IC repository access
"""
import os, sys, shutil, string
from commands import command
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG
import logging as log
from util.upgrade_change_log import viewer_config_log

try:
  import json
except ImportError: 
  import simplejson as json
  
CONFIG_JSON_SRC_NAME = "viewer-config-premise-template.json"
CONFIG_JSON_NAME = "viewer-config.json"
CONFIG_JSON_NAME_BAK = 'viewer-config.json.bak'
VIEWER_CONFIG_JSON_BACKUP_DIR = "ViewerApp_CONFIG_JSON"
DOCS_CONFIG_DIR = "IBMDocs-config"

JSON_LIST_ENTRY_IDENTFER = {'components': 'id', 'adapters': 'id', 'providers': 'name'}
PATH_HOLDER = []

class InstallConfigJson(command.Command):
  
  def __init__(self):
    #self.viewerFS = self.__get_config_dir()
    self.viewer_bld_dir = CFG.get_build_dir()
    #self.config_json_full_name= self.viewerFS + "/" + CONFIG_JSON_NAME 
    self.conversion_dir = CFG.conversion_dir.replace("\\", "/")
    self.cache_dir = CFG.cache_dir.replace("\\", "/")
    self.filer_dir = CFG.filer_dir.replace("\\", "/")
    self.files_path = CFG.files_path.replace("\\","/")
    self.config_json_backup_dir = CFG.get_temp_dir() + os.sep + VIEWER_CONFIG_JSON_BACKUP_DIR
    self.is_before_centrolize=False
        
  def create_sub_dir(self):
    log.info("Establishing directory structure...")
    try:
      if not os.path.exists(self.conversion_dir):
        os.makedirs(self.conversion_dir)
      if not os.path.exists(self.cache_dir):
        os.makedirs(self.cache_dir)
      if not os.path.exists(self.filer_dir):
        os.makedirs(self.filer_dir)
    except Exception as e:
      log.exception(e)
      log.error("Failed to create sub directories.")
      
  def generate_config_json (self, src, dest):
    config_json_template_file = open(src)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)    

    #Modify related settings.
    cfg_dict = dict(CFG.get_raw_key_value())
    if 'shared_data_dir' in cfg_dict:
      cfg_dict['shared_data_dir'] = cfg_dict['shared_data_dir'].replace("\\", "/")
    if 'files_path' in cfg_dict and cfg_dict['files_path']!=None and cfg_dict['files_path']!="":
      log.info("files_path:%s"%cfg_dict['files_path'])
    else:
      cfg_dict['files_path']=self.get_files_path().replace("\\", "/")
    cfg_dict['env']="On-premise"
#    cfg_dict['mt']="false"
    cfg_dict['token']="fallseason2011"
    if 'editor_installed' in cfg_dict:
      cfg_dict['editor_installed']=CFG.get_editor_installed()
    if 'convert_on_upload' in cfg_dict:
      cfg_dict['convert_on_upload']=CFG.get_option_value('Viewer', 'convert_on_upload')

    config_json_subst_string = config_json_template.substitute(cfg_dict)  

    config_json_subst_file = open(dest, "w")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()

  def create_json_file(self):
    src = self.viewer_bld_dir + 'config/' + CONFIG_JSON_SRC_NAME
    dest = self.viewer_bld_dir + 'config/' + CONFIG_JSON_NAME_BAK
    log.info( "Generating config json from %s to %s" % (src, dest) )
    if os.path.isfile(dest):
      os.remove(dest)
    
    self.generate_config_json(src, dest)

    self.config_bak = os.path.join('/'.join([CFG.temp_dir, CONFIG_JSON_NAME_BAK]))
    if(os.path.isfile(self.config_bak)):
      os.remove(self.config_bak)
    if not os.path.isdir(CFG.temp_dir):
      os.makedirs(CFG.temp_dir)
		
    self.__delete_old_config(self.config_bak)
    self.__install_config(dest)
		
  def __install_config(self, src):
    """install the configuration as websphere document"""
    log.info('Installing viewer-config.json')

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/create_config_json.py"])      
    args.extend([src])

    succ, ws_out = call_wsadmin(args)
    os.remove(src)
    if not succ:
      raise Exception('Failed to create configuration file.')
    
    log.info('Successfully installed the viewer-config.json')

  def __delete_old_config(self, config_bak):
    """remove and backup the old configuration"""

    log.info('Deleting existing viewer-config.json')
    
    #delete the config json
    del_cfg_json_args = CFG.get_was_cmd_line()
    del_cfg_json_args.extend(["-f",  "./viewer/tasks/delete_config_json.py"])      
    del_cfg_json_args.extend([config_bak])
    
    succ, ws_out = call_wsadmin(del_cfg_json_args)
    if not succ:
      raise Exception("Failed to delete config json file")
      
    if ws_out.find('DelJsonConfig Successfully.') < 0:
      raise Exception("Failed to delete config json file")
      
    log.info('Successfully removed the old viewer-config.json')
  
  
  def get_files_path(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/get_files_path.py"])
    succ, ws_out = call_wsadmin(args)
    files_content_dir=None
    for line in ws_out.split('\n'):
      if line.find('FILES_CONTENT_DIR:') > -1:
        files_content_dir=line.strip(' \r\n\t').replace('FILES_CONTENT_DIR:','').strip(" ")
    if(files_content_dir !=None):
      log.info("Get FILES_CONTENT_DIR: %s successfully."%files_content_dir)
      return files_content_dir
    else:
      log.error("Get FILES_CONTENT_DIR error,please get it from WAS variable and set it to files_path in viewer-config.json manually")
      return None
    

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    log.info("Start to roll back viewer-config.json")
    
    self.__delete_old_config('remove')
    try:
      self.config_bak
    except NameError:
      log.info("config_bak is not defined, skip to restore it.")
    else:
      if (os.path.isfile(self.config_bak)):
        self.__install_config(self.config_bak)
      else:
        log.info("config_bak file doesn't exist.")
    
    log.info("Rolling back viewer-config.json completed")
    return True

  def do(self):
    log.info("Install ConfigJson for Viewer application Started")
    self.create_sub_dir()
    self.create_json_file()
    log.info("Install ConfigJson for Viewer application completed")
    return True

  def undo(self):
    log.info("Start to uninstall ConfigJson for Viewer application")
    
    self.__delete_old_config('remove')
    
    log.info("Uninstall ConfigJson for Viewer application completed")
    return True

if __name__ == "__main__":
  import pdb
  pdb.set_trace()
  foo = InstallConfigJson()
  foo.do