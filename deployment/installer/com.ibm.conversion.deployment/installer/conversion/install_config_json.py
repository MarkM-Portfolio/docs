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
This command will copy conversion-config.json to CovnersionFS Dir,
and make required config changes
"""
import os, sys, string, platform
import re, shutil
import logging

from common import was_cmd_util, call_wsadmin, command, CFG, configfiles


try:
  import json
except ImportError:
  import simplejson as json

CONFIG_JSON_NAME="conversion-config.json"
G11N_DIR_NAME="g11n"
Concord_CONFIG_JSON_Backup_DIR = "ConversionApp_CONFIG_JSON"

G11N_FILE_1="FallBackFontFamily.json"
G11N_FILE_2="NonWesternFont.json"
G11N_FILE_3="OpenSymbolFont.json"
G11N_FILE_LIST=[G11N_FILE_1,G11N_FILE_2,G11N_FILE_3]

Conversion_CONFIG_JSON_OLD="old"
Conversion_CONFIG_JSON_NEW="new"
CONFIG_JSON_SUB_DIR="IBMDocs-config"

keyset = [
'onpremise_authentication'
]

class InstallConfigJson(command.Command):

  def __init__(self):
    self.config = CFG
    self.repo_dir = self.config.getDataFolder().replace("\\", "/")

    self.config_folder = self.config.getConfigFolder()
    self.build = self.config.get_build_dir()
    self.config_src  = os.path.join(self.build, "config", CONFIG_JSON_NAME)

    self.config_dest = os.path.join(self.config_folder, CONFIG_JSON_NAME)
    if os.path.exists(self.config_dest):
      self.OldConcordFSExist = True
    else:
      self.OldConcordFSExist = False
    self.upgrade = None
    if not os.path.exists(self.config_folder):
      os.makedirs(self.config_folder)

    self.g11n_src = os.path.join(self.build, "config", G11N_DIR_NAME)
    self.g11n_dest = os.path.join(self.config_folder, G11N_DIR_NAME)
    if not os.path.exists(self.g11n_dest):
      os.mkdir(self.g11n_dest)
    self.count = self.config.getSymCount()
    self.port = self.config.getSymStartPort()
    self.config_json_backup_dir = self.config.get_temp_dir() + os.sep + Concord_CONFIG_JSON_Backup_DIR
    if not os.path.exists(self.config_json_backup_dir):
      os.makedirs(self.config_json_backup_dir)

  def readCfg(self, cfg=None):
    return True

  def generate_config_json (self, src, dest):
    config_json_template_file = open(src)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)

    cfg_dict = dict(self.config.get_raw_key_value())
    # modify cfg_dict
    str_insts = []
    for i in range(self.count*2):
      inst = '{"host":"127.0.0.1","port":%s},' % (str(self.port+i))
      str_insts.append(inst)

    str_insts[-1]=str_insts[-1][:-1]
    host_list = "".join(str_insts) +"\n"

    cfg_dict["host_list"] = host_list

    for key in ( 'conversion_install_root',
      'docs_shared_storage_local_path',
      'docs_shared_storage_remote_path',
      'viewer_shared_storage_local_path',
      'viewer_shared_storage_remote_path' ):
      if key in cfg_dict:
        cfg_dict[key] = cfg_dict[key].replace("\\", "/")

    cfg_dict['conversion_install_root'] = CFG.install_root_on_node
    config_json_subst_string = config_json_template.substitute(cfg_dict)

    config_json_subst_file = open(dest, "w")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()

  def create_config_json(self,dest,src):
    logging.info('Creating %s Properties' %(src))
    if platform.system()=="Windows":
      dest = dest.replace("\\","/")
      src = src.replace("\\","/")
    json_args=CFG.get_was_cmd_line()
    json_args.extend(["-f",  "./conversion/tasks/create_config_json.py"])
    #json_args.extend([CONFIG_JSON_SUB_DIR+"/"+CONFIG_JSON_NAME])
    json_args.extend([dest])
    json_args.extend([src])

    #sys.stdout.write("OS type((w)indows, (l)inux):")
    #osType = sys.stdin.readline().strip()

    json_succ, json_ws_out = call_wsadmin(json_args)

    if not json_succ:
      raise Exception("Failed to create %s" % (src))

    json_config_var = "JsonConfig"
    json_config_var = "".join([json_config_var,": "])
    json_config_vars = self._parse_info(json_config_var,json_ws_out)
    if len(json_config_vars) == 0:
      raise Exception("Failed to create %s" % (src))

  def delete_config_json (self,dest,bak):
    logging.info('Deleting existed %s Properties' %(dest))

    dest = dest.replace("\\","/")
    if bak:
      new_bakup_dir = os.path.join(self.config_json_backup_dir,Conversion_CONFIG_JSON_NEW)
      if not os.path.exists(new_bakup_dir):
        os.mkdir(new_bakup_dir)
      new_backup_file = os.path.join(new_bakup_dir,CONFIG_JSON_NAME)
      bak = bak.replace("\\","/")
    else:
      bak = 'None'

    del_cfg_json_args=CFG.get_was_cmd_line()
    del_cfg_json_args.extend(["-f",  "./conversion/tasks/delete_config_json.py"])
    del_cfg_json_args.extend([dest])
    del_cfg_json_args.extend([bak])

    del_cfg_json_succ, del_cfg_json_ws_out = call_wsadmin(del_cfg_json_args)


    if not del_cfg_json_succ:
      raise Exception("Failed to delete config json file")

    del_cfg_json_var = "DelJsonConfig"
    del_cfg_json_var = "".join([del_cfg_json_var,": "])
    del_cfg_jsons = self._parse_info(del_cfg_json_var,del_cfg_json_ws_out)

    if del_cfg_jsons[0] == "None":
      logging.info('No existed conversion-config.json Properties to delete')
      return

    return

  def install(self):
    dest_file=CONFIG_JSON_SUB_DIR+"/"+CONFIG_JSON_NAME
    new_bakup_dir = os.path.join(self.config_json_backup_dir,Conversion_CONFIG_JSON_NEW)
    if not os.path.exists(new_bakup_dir):
      os.mkdir(new_bakup_dir)
    new_backup_file = os.path.join(new_bakup_dir,CONFIG_JSON_NAME)

    self.delete_config_json(dest_file,new_backup_file)

    g11n_bak_dir = os.path.join(self.config_json_backup_dir,G11N_DIR_NAME,Conversion_CONFIG_JSON_NEW)
    if not os.path.exists(g11n_bak_dir):
      os.makedirs(g11n_bak_dir)
    for g11nfile in G11N_FILE_LIST:
      g11n_dest_file = CONFIG_JSON_SUB_DIR + "/" + G11N_DIR_NAME + "/" + g11nfile
      g11n_bak_file = os.path.join(g11n_bak_dir,g11nfile)
      self.delete_config_json(g11n_dest_file,g11n_bak_file)


    logging.info("Configuring conversion-config.json")
    logging.info( "Generating config json from %s to %s" % (self.config_src, self.config_dest) )
    self.generate_config_json(self.config_src, self.config_dest)

    if self.upgrade and os.path.isfile(new_backup_file):
      configfiles.copy_json_parts_file(keyset,new_backup_file, self.config_dest)



    self.create_config_json(dest_file,self.config_dest)


    for g11nsrcfile in G11N_FILE_LIST:
      g11n_dest_file = CONFIG_JSON_SUB_DIR + "/" + G11N_DIR_NAME + "/" + g11nsrcfile
      g11n_src_file = os.path.join(self.g11n_src,g11nsrcfile)
      self.create_config_json(g11n_dest_file,g11n_src_file)

    if os.path.exists(self.config_folder):
      self.del_file_folder(self.config_folder)

  def do(self):
    logging.info("Install ConfigJson for HCL Conversion Server Started")

    self.install()

    logging.info("Install ConfigJson for HCL Conversion Server completed")
    return True

  def un_install(self):
    dest_file=CONFIG_JSON_SUB_DIR+"/"+CONFIG_JSON_NAME
    self.delete_config_json(dest_file, None)

    g11n_bak_dir = os.path.join(self.config_json_backup_dir,G11N_DIR_NAME,Conversion_CONFIG_JSON_NEW)
    for g11nfile in G11N_FILE_LIST:
      g11n_bak_file = os.path.join(g11n_bak_dir,g11nfile)
      if os.path.exists(g11n_bak_file):
        g11n_dest_file = CONFIG_JSON_SUB_DIR + "/" + G11N_DIR_NAME + "/" + g11nfile
        self.create_config_json(g11n_dest_file,g11n_bak_file)

  def undo(self):
    logging.info("Cleaning config json file")
    self.un_install()

    logging.info("Successfully Cleaned config json file")
    return True

  def fix_json_format (self, file_name):
    fh = open(file_name)
    content = fh.read()
    fh.close()
    file_changed = False
    m = re.search("\"max-queue-size\":\s*\d+(,)\s*}", content)
    if m:
      comma_index = m.start(1)
      if comma_index > 0:
        file_changed = True
        content = content[0:comma_index] + \
          content[comma_index+1:]
    if file_changed:
      fh = open(file_name, "w")
      fh.write(content)

  def do_upgrade(self):
    logging.info('conversion-config.json Properties Upgrade')

    self.upgrade = True
    if self.OldConcordFSExist:
      #backup the old config json for undo
      old_bakup_dir = os.path.join(self.config_json_backup_dir,Conversion_CONFIG_JSON_OLD)
      if not os.path.exists(old_bakup_dir):
        os.mkdir(old_bakup_dir)
      old_backup_file = os.path.join(old_bakup_dir,CONFIG_JSON_NAME)
      logging.info('Backup ' + self.config_dest + \
              ' to ' +  old_backup_file )
      self.fix_json_format(self.config_dest)
      shutil.copy(self.config_dest, old_backup_file)

      g11n_bakup_dir = os.path.join(self.config_json_backup_dir,G11N_DIR_NAME,Conversion_CONFIG_JSON_OLD)
      #if not os.path.exists(g11n_bakup_dir):
      #  os.makedirs(g11n_bakup_dir)
      if os.path.exists(self.g11n_dest):
        logging.info("Backing up config G11N from %s to %s" % (self.g11n_dest, g11n_bakup_dir))
        shutil.copytree(self.g11n_dest, g11n_bakup_dir)
      else:
        logging.warning("G11N directory %s not found" % self.g11n_dest)

    self.install()

    #raise Exception("Mandatory Exception")

    return True

  def undo_upgrade(self):
    logging.info('Start to roll back conversion-config.json Properties')

    self.un_install()

    old_bakup_file = os.path.join(self.config_json_backup_dir,Conversion_CONFIG_JSON_OLD,CONFIG_JSON_NAME)
    if os.path.exists(old_bakup_file):
      if not os.path.exists(self.config_folder):
        os.mkdir(self.config_folder)
      shutil.copy(old_bakup_file, os.path.join(self.config_folder,CONFIG_JSON_NAME))
      logging.info('Restore ' + old_bakup_file \
          + ' to ' + self.config_dest)
    elif self.OldConcordFSExist:
      logging.info( "Can not find backup file: " + old_bakup_file )

    old_g11n_bakup_dir = os.path.join(self.config_json_backup_dir,G11N_DIR_NAME,Conversion_CONFIG_JSON_OLD)
    for g11nfile in G11N_FILE_LIST:
      old_g11n_bak_file = os.path.join(old_g11n_bakup_dir,g11nfile)
      if os.path.exists(old_g11n_bak_file):
        g11n_dest_dir = os.path.join(self.config_folder,G11N_DIR_NAME)
        if not os.path.exists(g11n_dest_dir):
          os.makedirs(g11n_dest_dir)
        g11n_dest_file = os.path.join(g11n_dest_dir,g11nfile)
        shutil.copy(old_g11n_bak_file, g11n_dest_file)
        logging.info('Restore ' + old_g11n_bak_file \
          + ' to ' + g11n_dest_file)
      elif self.OldConcordFSExist:
        logging.info( "Can not find backup file: " + old_g11n_bak_file )

    logging.info('Successfully rolled back conversion-config.json Properties')
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

        #logging.info("Node name is: %s" % node_name)
        des_list.append(des_name)
      #endif line.find
    #endfor
    return des_list

  def del_file_folder(self,srcDir):
    '''delete files and folders'''
    if os.path.isfile(srcDir):
        os.remove(srcDir)
    elif os.path.isdir(srcDir):
      for item in os.listdir(srcDir):
        itemSub=os.path.join(srcDir,item)
        self.del_file_folder(itemSub)
      os.rmdir(srcDir)
