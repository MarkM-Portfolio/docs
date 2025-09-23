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
from common import command, CFG, call_wsadmin, split_lines, was_log
import logging as log

if CFG.isDMZ():
  WS_EXT_DIR = {"name": "ws.ext.dirs", "value": "${USER_INSTALL_ROOT}/optionalLibraries/docs"}
else:
  FILTER_ASSET_NAME = "concord.proxy.filter.jar"
  WS_EXT_DIR = {"name": "ws.ext.dirs", "value": "${USER_INSTALL_ROOT}/installedAssets/"+FILTER_ASSET_NAME+"/BASE"}

class CreateJVMProperty(command.Command):
  """ This class creates JVM property for WAS proxy server, and relevant HttpSessionIdReUse property"""
  def __init__(self):
    self.scope = CFG.get_scope_type().lower()
    self.old_ws_ext_dir = ""
    if self.scope == "server":
      self.proxy_node_name = CFG.get_proxy_node_name()
      self.proxy_server_name = CFG.get_proxy_server_name()
    else:
      self.proxy_cluster_name = CFG.get_scope_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create JVM property for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/" + __name__.split(".")[1]+ ".py"])
    if self.scope == "server":
      args.extend(["server", self.proxy_server_name, self.proxy_node_name])
    else:
      # dupliate argument to keep consisten with servers
      args.extend(["cluster", self.proxy_cluster_name, self.proxy_cluster_name])
    args.extend([WS_EXT_DIR["name"], WS_EXT_DIR["value"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Create JVM property for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to delete JVM property for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    if self.scope == "server":
      args.extend(["server", self.proxy_server_name, self.proxy_node_name])
    else:
      # dupliate argument to keep consisten with servers
      args.extend(["cluster", self.proxy_cluster_name, self.proxy_cluster_name])
    args.extend([WS_EXT_DIR["name"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Delete JVM property for HCL Docs proxy server completed")
    return True

  def do_upgrade(self):
    log.info("Start to upgrade JVM property for HCL Docs proxy server")
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/upgrade_" + __name__.split(".")[1]+ ".py"])
    if self.scope == "server":
      args.extend(["server", self.proxy_server_name, self.proxy_node_name])
    else:
      # dupliate argument to keep consisten with servers
      args.extend(["cluster", self.proxy_cluster_name, self.proxy_cluster_name])
    args.extend([WS_EXT_DIR["name"], WS_EXT_DIR["value"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    outs = split_lines(ws_out)
    for each_out in outs:
      if each_out.find("IBMDocs_Proxy_Server_Filter_Jar_Path:") >= 0:
        self.old_ws_ext_dir = each_out[len("IBMDocs_Proxy_Server_Filter_Jar_Path:"):len(each_out)]
        if not self.old_ws_ext_dir == WS_EXT_DIR["value"]:
          was_log.log('#WAS JVM Properties Upgrade')
          config_path = 'JVM configuration: WAS console->Servers->WebSphere application servers->[your server name]->Java and Process Management->Process definition->Java Virtual Machine'
          was_log.log_overwrite_config(WS_EXT_DIR["name"], self.old_ws_ext_dir, WS_EXT_DIR["value"], config_path, log)
        break
    log.info("Finish to upgrade JVM property for HCL Docs proxy server")
    return True

  def undo_upgrade(self):
    if not self.old_ws_ext_dir == "":
      log.info("Start to undo JVM property for HCL Docs proxy server upgrade")
      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  "./proxy/tasks/" + __name__.split(".")[1]+ ".py"])
      if self.scope == "server":
        args.extend(["server", self.proxy_server_name, self.proxy_node_name])
      else:
        # dupliate argument to keep consisten with servers
        args.extend(["cluster", self.proxy_cluster_name, self.proxy_cluster_name])
      args.extend([WS_EXT_DIR["name"], self.old_ws_ext_dir])
      #log.info(args)

      succ, ws_out = call_wsadmin(args)
      if not succ:
        log.info("Fail to undo JVM property for HCL Docs proxy server upgrade")
        return False
      log.info("Finish to undo JVM property for HCL Docs proxy server upgrade")
    else:
      log.info("No need to undo JVM property for HCL Docs proxy server upgrade")
    return True
