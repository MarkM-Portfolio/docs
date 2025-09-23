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
import subprocess
import sys
import os
import logging
from common import command, CFG, call_wsadmin


class ConfigSessionCookie(command.Command):

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    logging.info("Start to config session cookie for HCL Docs Server")
    succ = False
    if CFG.get_software_mode().lower() == 'sc':
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./common_jython/tasks/config_session_cookie.py"])
      args.extend([CFG.get_node_name(), CFG.get_scope_name()])
      succ, ws_out = call_wsadmin(args)
    else:
      return True

    logging.info("Config session cookie for HCL Docs Server successfully")
    return succ

  def undo(self):
    return True

  def do_upgrade(self):
    return True

  def undo_upgrade(self):
    return True
