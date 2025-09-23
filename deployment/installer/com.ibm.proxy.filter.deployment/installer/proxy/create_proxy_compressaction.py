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

pre_name = 'IBMDocs_ProxyRuleExpression_001'
pca_name = 'IBMDocs_HTTPResponseCompressionAction_001'

class CreateCompressAction(command.Command):
  def __init__(self):
    self.scope = CFG.get_scope_type().lower()
    if self.scope == "server":
      self.node_name = CFG.get_proxy_node_name()
      self.server_name = CFG.get_proxy_server_name()
    else:
      self.cluster_name = CFG.get_scope_name()
    self.docs_context_root = CFG.get_docs_context_root()

  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """
    self.pc_expression = ""
    cfg_proxy_compress_expression = cfg['proxy_compress_expression']
    expressions_array = cfg_proxy_compress_expression.split(';')
    for expression in expressions_array:
      self.pc_expression = self.pc_expression + "URI=\"" + self.docs_context_root + expression + "\";"
    if self.pc_expression.endswith(";"):
      self.pc_expression = self.pc_expression[0:(len(self.pc_expression) - 1)]
    self.pc_types = cfg['proxy_compress_types']
    log.info("readCfg: The proxy rule expressions are: %s" % self.pc_expression)
    log.info("readCfg: The proxy compress content types are: %s" % self.pc_types)

  def do(self):
    log.info("Start to create Proxy Compress Action for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/" + __name__.split(".")[1]+ ".py"])
    if self.scope == "server":
      args.extend(["server", self.node_name, self.server_name])
    else:
      args.extend(["cluster", self.cluster_name])
    args.extend([pre_name])
    args.extend([pca_name])
    args.extend([self.pc_expression])
    args.extend([self.pc_types])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create Proxy Compress Action for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to delete Proxy Compress Action for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([pre_name])
    args.extend([pca_name])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete Proxy Compress Action for HCL Docs proxy server completed")
    return True

  def do_upgrade(self):
    log.info("Start to upgrade Proxy Compress Action for HCL Docs proxy server")

    log.info("Finish to upgrade Proxy Compress Action for HCL Docs proxy server")
    return True

  def undo_upgrade(self):
    log.info("Start to undo upgrade Proxy Compress Action for HCL Docs proxy server")

    log.info("Finish to undo upgrade Proxy Compress Action for HCL Docs proxy server")
    return True
