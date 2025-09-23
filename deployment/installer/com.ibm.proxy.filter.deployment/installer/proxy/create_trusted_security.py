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

import os, shutil
from common import command, CFG, call_wsadmin
import logging as log

class CreateTrustedSecurity(command.Command):
  def __init__(self):
    self.setting_file_name = 'proxy-settings.xml'
    self.webserver_name = CFG.get_webserver_name()
    if self.webserver_name == '':
      self.webserver_name = 'all_webservers'
    self.scope = CFG.get_scope_type().lower()
    if self.scope == "server":
      self.node_name = CFG.get_proxy_node_name()
      self.server_name = CFG.get_proxy_server_name()
      self.setting_path_on_local = os.path.join(CFG.get_temp_dir(), "proxy", "nodes", self.node_name,'servers',self.server_name)
      self.setting_file_on_local = os.path.join(CFG.get_temp_dir(), "proxy", "nodes", self.node_name,'servers',self.server_name,self.setting_file_name)
      self.setting_path_on_dmgr = 'cells/'+CFG.get_cell_name()+'/nodes/'+self.node_name+'/servers/'+self.server_name
    else:#self.scope == 'cluster':
      self.cluster_name = CFG.get_scope_name()
      self.setting_path_on_local = os.path.join(CFG.get_temp_dir(), "proxy", "clusters", self.cluster_name)
      self.setting_file_on_local = os.path.join(CFG.get_temp_dir(), "proxy", "clusters", self.cluster_name,self.setting_file_name)
      self.setting_path_on_dmgr = 'cells/'+CFG.get_cell_name()+'/clusters/'+self.cluster_name

    self.setting_file_on_dmgr = self.setting_path_on_dmgr + '/' + self.setting_file_name
    if not os.path.isdir(self.setting_path_on_local):
      os.makedirs(self.setting_path_on_local)

  def do(self):
    log.info("Start to add trusted security web server for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/create_trusted_security.py"])
    args.extend([self.scope])
    if self.scope == 'server':
      args.extend([self.node_name, self.server_name])
    else:#self.scope == 'cluster':
      args.extend([self.cluster_name, self.cluster_name])
    args.extend([self.webserver_name])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Add trusted security web server for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to remove trusted security web server for HCL Docs proxy server")
    #Do not need restore any backup former proxy settings, as the whole proxy server will be dropped anyway...
    log.info("Remove trusted security web server added for HCL Docs proxy server completed")
    return True

  def do_upgrade(self):
    #0. Check the setting file existency:
    args = []
    args.extend(["exist", self.setting_file_on_dmgr])
    succ, ws_out = self.call_common_task("operate_config_file.py", args)
    if succ and ws_out.find("exist:1") >= 0:
      #1. Clear the backup file if exist:
      if os.path.exists(self.setting_file_on_local):
        os.remove(self.setting_file_on_local)
      #2. backup the original ProxySettings.xml:
      # wasadmin command line arguments
      args = []
      args.extend(["extract", self.setting_file_on_dmgr, self.setting_file_on_local])

      succ, ws_out = self.call_common_task("operate_config_file.py", args)

    return self.do()

  def undo_upgrade(self):
    #return self.undo()
    log.info("Start to undo upgrade trusted security web server for HCL Docs proxy server")
    #0. Check the backup file existency:
    if os.path.exists(self.setting_file_on_local):
      #1. Clear the setting file if exist:
      args = []
      args.extend(["delete", self.setting_file_on_dmgr])
      succ, ws_out = self.call_common_task("operate_config_file.py", args)

      #2. Checkin the backup file as setting file:
      args = []
      args.extend(["checkin", self.setting_file_on_dmgr, self.setting_file_on_local])

      succ, ws_out = self.call_common_task("operate_config_file.py", args)
    log.info("Finish to undo upgrade trusted security web server for HCL Docs proxy server")
    return True
