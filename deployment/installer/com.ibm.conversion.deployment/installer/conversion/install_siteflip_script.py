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

"""
This command will copy conversion-config.json to CovnersionFS Dir,
and make required config changes
"""
import socket
import os, sys, fileinput
import re, shutil
import logging

from common import command, CFG, call_wsadmin

CONFIG_JSON_NAME="F00ConfigureDocsCR.py"
DEST_DIR="C:/LotusLive/Scripts"
CONFIG_JSON_SUB_DIR="IBMDocs-config"

class InstallSiteflipScript(command.Command):
  
  def __init__(self):
    self.config = CFG
    self.build = self.config.get_build_dir()
    self.script_src  = os.path.join(self.build, "installer", "util", CONFIG_JSON_NAME)
    
    #get cell name    
    logging.info("Start to get cell name...")
    cell_name_args = CFG.get_was_cmd_line()
    cell_name_args.extend(["-f",  "./conversion/tasks/get_cell_name.py"])
    cell_name_succ, cell_name_ws_out = call_wsadmin(cell_name_args)
    if not cell_name_succ:
      raise Exception("Failed to get the cell name")
      
    cell_name_var = "cellname"
    cell_name_var = "".join([cell_name_var,": "])
    
    cell_names = self._parse_info(cell_name_var,cell_name_ws_out)
       
    if len(cell_names) == 0:
      raise Exception("Failed to get the cell name")
    self.cell_name = cell_names[0]
    logging.info("Get cell %s successfully" % self.cell_name)
    
    #Get the user install path of node on USER_INSTALL_ROOT     
    logging.info("Start to get the USER_INSTALL_ROOT...")
    hostname = socket.gethostname()
    user_inst_args = CFG.get_was_cmd_line()
    user_inst_args.extend(["-f",  "./conversion/tasks/get_user_inst_path_for_node.py"])
    #user_ins_args.extend(["USER_INSTALL_ROOT"])
    user_inst_args.extend([hostname])
    user_inst_succ, user_inst_ws_out = call_wsadmin(user_inst_args)
    if not user_inst_succ:
      raise Exception("Failed to get was profile for given host")
    
    user_inst_path_var = "UserInstPath"
    user_inst_path_var = "".join([user_inst_path_var,": "])
    user_inst_paths = self._parse_info(user_inst_path_var,user_inst_ws_out)
       
    if user_inst_paths[0] == "None":
      raise Exception("Failed to get was profile for given host")
      
    self.cell_config_root = user_inst_paths[0]    
    logging.info("Get USER_INSTALL_ROOT %s successfully" % self.cell_config_root)

  def readCfg(self, cfg=None):
    return True

  def do(self):
    logging.info("Copying config json from %s to %s" % (self.script_src, DEST_DIR))
    
    config_folder = os.path.join(self.cell_config_root,"config","cells",self.cell_name,CONFIG_JSON_SUB_DIR)
    
    fr = open(self.script_src, "r")
    lines = fr.readlines()
    fw = open(self.script_src, "w")
    for line in lines:      
      fw.write(line.replace('$/IBMConversion/config',config_folder))
    fr.close()
    fw.close()
    
    if not os.path.exists(DEST_DIR):
      logging.info("%s directory not exists, something error happened" % DEST_DIR)
      os.makedirs(DEST_DIR)
    shutil.copy(self.script_src, DEST_DIR)

    return True

  def undo(self):
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