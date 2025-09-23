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

class CreateProxyTuning(command.Command):
  def __init__(self):
    self.scope = CFG.get_scope_type().lower()
    if self.scope == "server":
      self.node_name = CFG.get_proxy_node_name()
      self.server_name = CFG.get_proxy_server_name()
    else:
      self.cluster_name = CFG.get_scope_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """
    self.workloadManagementPolicy = cfg['workloadManagementPolicy']
    self.jvm_properties = cfg['jvm_properties']
    self.thread_pool_properties = cfg['thread_pool_properties']
    log.info("readCfg: The proxy workload management policy: %s" % self.workloadManagementPolicy)
    log.info("readCfg: The proxy tuning jvm properties are: %s" % self.jvm_properties)
    log.info("readCfg: The proxy tuning thread pool properties are: %s" % self.thread_pool_properties)

  def do(self):
    log.info("Start to create Proxy tuning for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/create_proxy_tuning.py"])
    if self.scope == "server":
      args.extend(["server", self.node_name, self.server_name])
    else:
      # dupliate argument to keep consisten with servers
      args.extend(["cluster", self.cluster_name, self.cluster_name])
    args.extend([self.workloadManagementPolicy])
    args.extend([self.jvm_properties])
    args.extend([self.thread_pool_properties])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create Proxy Tuning for HCL Docs proxy server completed")
    return True

  def undo(self):
    """
       When uninstall IBM docs proxy filter, if there are other applications in the same WAS server,
       unsetting tuning parameters may cause WAS server cannot launch again(with OOM exception),
       for avoiding such cases, the code just keeps the tuned settings after uninstallation.
    """
    log.info("Keep the proxy tuned settings after uninstallation")
    return True

  def do_upgrade(self):
    log.info("Start to upgrade Proxy Tuning for HCL Docs proxy server")

    log.info("Finish to upgrade Proxy Tuning for HCL Docs proxy server")
    return True

  def undo_upgrade(self):
    log.info("Start to undo upgrade Proxy Tuning for HCL Docs proxy server")

    log.info("Finish to undo upgrade Proxy Tuning for HCL Docs proxy server")
    return True
