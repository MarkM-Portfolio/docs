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

from common import command, CFG, call_wsadmin
import logging as log

CONCORD_FS_NAME = "ConcordFS"

class AddConcordFS(command.Command):

  def __init__(self):
    self.concord_fs = CFG.get_config_dir()
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create CONCORDFS ENV for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.scope])
    args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([CONCORD_FS_NAME])
    args.extend([self.concord_fs])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Create CONCORDFS ENV for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to delete CONCORDFS for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([self.scope])
    args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([CONCORD_FS_NAME])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Delete CONCORDFS for HCL Docs Server completed")
    return True
