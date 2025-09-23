# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

"""
This command will copy concord-config.json to ConcordFS Dir,
and make required config changes, like directory, IC repository access
"""
import os, sys, shutil, string, platform
from common import command, call_wsadmin, CFG, configfiles, config_log
import logging as log
import socket

try:
  import json
except ImportError:
  import simplejson as json

CONFIG_JSON_SRC_NAME = "concord-config-premise-template.json"
CONFIG_JSON_NAME = "concord-config.json"
Concord_CONFIG_JSON_Backup_DIR = "DocsApp_CONFIG_JSON"
Concord_CONFIG_JSON_OLD="old"
Concord_CONFIG_JSON_NEW="new"
LOCAL_TEST_USER = "local-test-users.json"
CONFIG_JSON_SUB_DIR="IBMDocs-config"

JSON_LIST_ENTRY_IDENTFER = {'components': 'id', 'adapters': 'id', 'providers': 'name'}
PATH_HOLDER = []

class InstallConfigJson(command.Command):

  def __init__(self):
    self.concordFS = CFG.get_config_dir()
    self.upgrade = None

    if os.path.exists(os.path.join(self.concordFS,CONFIG_JSON_NAME)):
      self.OldConcordFSExist = True
    else:
      self.OldConcordFSExist = False

    if not os.path.exists(self.concordFS):
      os.makedirs(self.concordFS)

    self.docs_bld_dir = CFG.get_build_dir()
    self.config_json_full_name= self.concordFS + os.sep + CONFIG_JSON_NAME

    # FIXME change to method call
    self.draft_dir = CFG.draft_dir.replace("\\", "/")
    self.conversion_dir = CFG.conversion_dir.replace("\\", "/")
    self.cache_dir = CFG.cache_dir.replace("\\", "/")
    self.filer_dir = CFG.filer_dir.replace("\\", "/")
    self.job_home = CFG.job_home.replace("\\", "/")
    self.config_json_backup_dir = CFG.get_temp_dir() + os.sep + Concord_CONFIG_JSON_Backup_DIR
    if not os.path.exists(self.config_json_backup_dir):
      os.makedirs(self.config_json_backup_dir)
    if CFG.is_local():
      global CONFIG_JSON_SRC_NAME
      CONFIG_JSON_SRC_NAME = "concord-config-localtest.json"

  def generate_config_json (self, src, dest):
    config_json_template_file = open(src)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)

    cfg_dict = dict(CFG.get_raw_key_value())
    if 'shared_data_dir' in cfg_dict:
      cfg_dict['shared_data_dir'] = cfg_dict['shared_data_dir'].replace("\\", "/")
    cfg_dict['profile_cfg'] = CFG.getProfileCFGInJSON()
    cfg_dict['BIZCard_cfg'] = CFG.getBIZCardCFGInJSON()
    cfg_dict['ST_cfg'] = CFG.getSTCFGInJSON()

    #config_json_subst_string = string.Template(config_json_subst_template).substitute(social_dict)
    if not 'nodejs_enabled' in cfg_dict:
      cfg_dict['nodejs_enabled'] = "false"
    if not 'ecm_navigator_server_url' in cfg_dict:
      cfg_dict['ecm_navigator_server_url'] = ""
    if not 'ecm_cmis_server_url' in cfg_dict:
      cfg_dict['ecm_cmis_server_url'] = ""
    if not 'ecm_fncs_server_url' in cfg_dict:
      cfg_dict['ecm_fncs_server_url'] = ""
    if not 'ecm_community_server_url' in cfg_dict:
      cfg_dict['ecm_community_server_url'] = ""
    config_json_subst_string = config_json_template.substitute(cfg_dict)

    config_json_subst_file = open(dest, "w")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()

  def delete_config_json (self):
    log.info('Deleting existed concord-config.json Properties')
    #delete the config json
    del_cfg_json_args=CFG.get_was_cmd_line()
    del_cfg_json_args.extend(["-f",  "./docs/tasks/delete_config_json.py"])
    del_cfg_json_args.extend([CONFIG_JSON_SUB_DIR+"/"+CONFIG_JSON_NAME])

    #backup the deleted config json for undo
    new_bakup_dir = os.path.join(self.config_json_backup_dir,Concord_CONFIG_JSON_NEW)
    if not os.path.exists(new_bakup_dir):
      os.mkdir(new_bakup_dir)
    new_backup_file = os.path.join(new_bakup_dir,CONFIG_JSON_NAME)

    if platform.system()=="Windows":
      new_backup_file = new_backup_file.replace("\\","/")

    del_cfg_json_args.extend([new_backup_file])

    del_cfg_json_succ, del_cfg_json_ws_out = call_wsadmin(del_cfg_json_args)

    if not del_cfg_json_succ:
      raise Exception("Failed to delete config json file")

    del_cfg_json_var = "DelJsonConfig"
    del_cfg_json_var = "".join([del_cfg_json_var,": "])
    del_cfg_jsons = self._parse_info(del_cfg_json_var,del_cfg_json_ws_out)

    if del_cfg_jsons[0] == "None":
      log.info('No existed concord-config.json Properties to delete')
      return

    log.info('Deleted existed concord-config.json Properties Successfully')
    return

  def create_config_json(self,src):
    log.info('Creating concord-config.json Properties')

    if platform.system()=="Windows":
      src = src.replace("\\","/")

    json_args=CFG.get_was_cmd_line()
    json_args.extend(["-f",  "./docs/tasks/create_config_json.py"])
    json_args.extend([CONFIG_JSON_SUB_DIR+"/"+CONFIG_JSON_NAME])
    json_args.extend([src])

    #sys.stdout.write("OS type((w)indows, (l)inux):")
    #osType = sys.stdin.readline().strip()

    json_succ, json_ws_out = call_wsadmin(json_args)

    print("json_ws_out: ")
    print(json_ws_out)

    if not json_succ:
      raise Exception("Failed to create config json")

    json_config_var = "JsonConfig"
    json_config_var = "".join([json_config_var,": "])
    json_config_vars = self._parse_info(json_config_var,json_ws_out)
    if len(json_config_vars) == 0:
      raise Exception("Failed to create config json")

    #self.cell_cofig_json=self.cell_config_root+os.sep+"config"+os.sep+json_config_vars[0]

  def del_file_folder(self,srcDir):
    '''delete files and folders'''
    if os.path.isfile(srcDir):
        os.remove(srcDir)
    elif os.path.isdir(srcDir):
      for item in os.listdir(srcDir):
        itemSub=os.path.join(srcDir,item)
        self.del_file_folder(itemSub)
      os.rmdir(srcDir)

  def create_json_file(self):
    log.info('Generate concord-config.json properties file...')
    src = self.docs_bld_dir + "/config/" + CONFIG_JSON_SRC_NAME
    dest = self.config_json_full_name
    log.info( "Generating config json from %s to %s" % (src, dest) )
    self.generate_config_json(src, dest)
    log.info('Successfully generated concord-config.json properties file...')

  def do_upgrade(self):
    log.info('concord-config.json Properties Upgrade')
    self.upgrade = True
    self.delete_config_json()
    if self.OldConcordFSExist:
      #backup the old config json for undo
      old_bakup_dir = os.path.join(self.config_json_backup_dir,Concord_CONFIG_JSON_OLD)
      if not os.path.exists(old_bakup_dir):
        os.mkdir(old_bakup_dir)
      old_backup_file = os.path.join(old_bakup_dir,CONFIG_JSON_NAME)
      log.info('Backup ' + self.config_json_full_name + \
              ' to ' +  old_backup_file )
      shutil.copy(self.config_json_full_name, old_backup_file)
    else:
      new_bakup_file = os.path.join(self.config_json_backup_dir, Concord_CONFIG_JSON_NEW, CONFIG_JSON_NAME)
      shutil.copy(new_bakup_file, self.config_json_full_name)

    template_file = self.docs_bld_dir + "/config/" + CONFIG_JSON_SRC_NAME
    template_target_file = self.config_json_full_name + ".upgrade"
    self.generate_config_json(template_file, template_target_file)

    configfiles.merge_json_files(template_target_file, self.config_json_full_name)
    os.remove(template_target_file)

    self.create_config_json(self.config_json_full_name)

    if os.path.exists(self.concordFS):
      self.del_file_folder(self.concordFS)

    #raise Exception("Mandatory Exception")

    self.create_local_user_files()

    return True

  def undo_upgrade(self):
    log.info("Start to roll back concord-config.json Properties")

    new_backup_file = os.path.join(self.config_json_backup_dir,Concord_CONFIG_JSON_NEW,CONFIG_JSON_NAME)
    if os.path.exists(new_backup_file):
      self.create_config_json(new_backup_file)

    old_bakup_file = os.path.join(self.config_json_backup_dir,Concord_CONFIG_JSON_OLD,CONFIG_JSON_NAME)
    if os.path.exists(old_bakup_file):
      if not os.path.exists(self.concordFS):
        os.mkdir(self.concordFS)
      shutil.copy(old_bakup_file, os.path.join(self.concordFS,CONFIG_JSON_NAME))
      log.info('Restore ' + old_bakup_file \
          + ' to ' + self.config_json_full_name)
    elif self.OldConcordFSExist:
      log.info( "Can not find backup file: " + old_bakup_file )

    return True

  def do(self):
    log.info("Install ConfigJson for HCL Docs Server Started")

    self.create_json_file()

    self.delete_config_json()
    self.create_config_json(self.config_json_full_name)

    if os.path.exists(self.concordFS):
      self.del_file_folder(self.concordFS)

    #raise Exception("Mandatory Exception")

    self.create_local_user_files()

    log.info("Install ConfigJson for HCL Docs Server completed")
    return True

  def create_local_user_files(self):
    if CFG.is_local():
      src = self.docs_bld_dir + "/config/" + LOCAL_TEST_USER
      target = self.concordFS + os.sep + LOCAL_TEST_USER
      local_tu_args=CFG.get_was_cmd_line()
      local_tu_args.extend(["-f",  "./docs/tasks/create_config_json.py"])
      local_tu_args.extend([CONFIG_JSON_SUB_DIR+"/"+LOCAL_TEST_USER])
      local_tu_args.extend([src])
      local_tu_succ, local_tu_ws_out = call_wsadmin(local_tu_args)

      if not local_tu_succ:
        raise Exception("Failed to create local test user json")

      json_config_var = "JsonConfig"
      json_config_var = "".join([json_config_var,": "])
      json_config_vars = self._parse_info(json_config_var,local_tu_ws_out)
      if len(json_config_vars) == 0:
        raise Exception("Failed to create local test user json")

    return True

  def undo(self):
    log.info("Start to uninstall ConfigJson for HCL Docs Server")

    new_backup_file = os.path.join(self.config_json_backup_dir,Concord_CONFIG_JSON_NEW,CONFIG_JSON_NAME)
    if os.path.exists(new_backup_file):
      self.create_config_json(new_backup_file)

    log.info("Uninstall ConfigJson for HCL Docs Server completed")
    self.delete_config_json()
    return True

  def _parse_info(self,des,des_prt):
    des_list = []
    for line in des_prt.split('\n'):
      if line.find(des) > -1:
        #raise Exception("Didn't get the node name")
        index_start = line.find(des)
        index_end = index_start + len(des)
        des_name = line[index_end : len(line)]
        if des_name.find('\n') >= 0:
          des_name = des_name[0 : des_name.find('\n')]

        #log.info("Node name is: %s" % node_name)
        des_list.append(des_name)
      #endif line.find
    #endfor
    return des_list
