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

class EnsureCompatibleSharedLib(command.Command):
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
    """
    log.info("Start to ensure compatible SharedLib for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])
    args.extend([self.shared_lib_path])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Ensure compatible SharedLib for HCL Docs Server completed")
    """
    return True

  def undo(self):
    """
    log.info("Start to delete SharedLib for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([self.shared_lib_name])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete SharedLib for HCL Docs Server completed")
    """
    return True

  def do_upgrade(self):
    log.info("Start to query shared library reference for HCL Docs Server")
    args1 = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args1.extend(["-f",  "./docs/tasks/" + "qr_shared_lib_reference.py"])
    args1.extend([self.shared_lib_name])
    args1.extend([CFG.get_app_name()])

    ref_succ, ref_ws_out = call_wsadmin(args1)
    print(ref_ws_out)
    if not ref_succ:
      return False

    for line in ref_ws_out.split('\n'):
      if line.find(self.shared_lib_name) > -1:
        self.is_shared_lib_ref = True
        log.info("Shared lib %s reference has been found and removed..." % (self.shared_lib_name))
        break
    if self.is_shared_lib_ref:
      log.info("Start to query shared library for HCL Docs Server")
      args2 = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args2.extend(["-f",  "./docs/tasks/" + "undo_create_shared_lib.py"])
      args2.extend([self.shared_lib_name])

      sl_succ, sl_ws_out = call_wsadmin(args2)
      if not sl_succ:
        return False
      self.is_shared_lib = True
      log.info("Shared lib %s has been removed successfully..." % (self.shared_lib_name))

    return True

  def undo_upgrade(self):
    if self.is_shared_lib:
      log.info("Start to rollback removed SharedLib %s for HCL Docs Server..." % (self.shared_lib_name))

      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  "./docs/tasks/" + "create_shared_lib.py"])
      args.extend([self.shared_lib_name])
      args.extend([self.shared_lib_path])

      sl_succ, sl_ws_out = call_wsadmin(args)
      if not sl_succ:
        return False

      log.info("Removed SharedLib has been rolled back successfully for HCL Docs Server")

    if self.is_shared_lib_ref:
      log.info("Start to rollback removed SharedLib %s reference for HCL Docs Server..." % (self.shared_lib_name))

      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  "./docs/tasks/" + "associate_shared_lib.py"])
      args.extend([self.shared_lib_name])
      args.extend([CFG.get_app_name()])

      ref_succ, ref_ws_out = call_wsadmin(args)
      if not ref_succ:
        return False

      log.info("Removed SharedLib has been rolled back successfully for HCL Docs Server")

    return True
