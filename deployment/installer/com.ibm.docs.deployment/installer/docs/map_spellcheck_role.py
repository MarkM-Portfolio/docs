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
from common import command, call_wsadmin, CFG
import logging as log

class mapSecurityRole(command.Command):

  def __init__(self):
    self.app_name = CFG.get_sc_app_name()
    self.mode = CFG.get_software_mode().lower()

  def readCfg(self, cfg=None):
    return True

  def do_upgrade(self):
    # map user #
    if self.mode == 'sc':
      log.info("This is SmartCloud Mode, start to upgrade to map HCL Docs SpellCheck Security Role.")
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./docs/tasks/map_spellcheck_role.py"])
      args.extend([self.app_name])
      succ, ws_out = call_wsadmin(args)
      if not succ:
        return False

      log.info("Upgrade HCL Docs SpellCheck Security Role completed.")
      return True

    log.info("This is On-Premise Mode, upgrade HCL Docs SpellCheck Security Role will do nothing.")
    return True

  def undo_upgrade(self):
    log.info("NO UNDO required for UPGRADE HCL Docs SpellCheck Security Role")
    return True


  def do(self):
    # map user #
    if self.mode == 'sc':
      log.info("This is SmartCloud Mode, start to map HCL Docs SpellCheck Security Role.")
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./docs/tasks/map_spellcheck_role.py"])
      args.extend([self.app_name])
      succ, ws_out = call_wsadmin(args)
      if not succ:
        return False

      log.info("Map HCL Docs SpellCheck Security Role completed")
      return True

    log.info("This is On-Premise Mode, map HCL Docs SpellCheck Security Role will do nothing.")
    return True

  def undo(self):
    log.info("NO UNDO required for HCL Docs SpellCheck Security Role")
    return True
