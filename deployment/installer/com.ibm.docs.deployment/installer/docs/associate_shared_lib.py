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

class AssociateSharedLib(command.Command):
  """This command will assiciate SharedLib with Docs EAR"""

  def __init__(self):
    self.shared_lib_name = 'DocsLib'
    self.shared_lib_path = CFG.get_lib_dir()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to associate SharedLib with EAR for HCL Docs")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])
    args.extend([CFG.get_app_name()])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Associate SharedLib for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to undo associate SharedLib with EAR for HCL Docs")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])
    args.extend([CFG.get_app_name()])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete SharedLib association for HCL Docs Server completed")
    return True
