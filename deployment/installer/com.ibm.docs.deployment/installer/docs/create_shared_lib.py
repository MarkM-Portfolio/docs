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

class CreateSharedLib(command.Command):
  """This command will create SharedLib for Docs EAR"""

  def __init__(self):
    self.shared_lib_name = 'DocsLib'
    self.spi_concord = CFG.get_lib_spi_concord()
    self.spi_adapters = CFG.get_lib_spi_adpaters()
    #if os.name == "nt":
    self.shared_lib_path = ";".join([self.spi_concord, self.spi_adapters])
    #else:
    #  self.shared_lib_path = ":".join([self.spi_concord, self.spi_adapters])

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create SharedLib for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])
    args.extend([self.shared_lib_path])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create SharedLib for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to delete SharedLib for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete SharedLib for HCL Docs Server completed")
    return True
