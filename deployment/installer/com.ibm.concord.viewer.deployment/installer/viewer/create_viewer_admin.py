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

import os, shutil,re
from commands import command
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG
import logging as log

VIEWER_ADMIN_JAAS_ALIAS = 'viewerAdmin'
ALIAS_DESC_VIEWER_ADMIN = 'JAAS Alias for File Viewer Administrator'
ALIAS_PATTERN = '.*alias\s(.*?)]'
USER_PATTERN = '.*userId\s(.*?)]'

class SetupViewerAdminJ2CAlias(command.Command):

  def __init__(self):
    self.jaas_alias = VIEWER_ADMIN_JAAS_ALIAS
    self.alias_desc = ALIAS_DESC_VIEWER_ADMIN
    self.user_id = CFG.get_was_adminid()
    self.user_pw = CFG.get_was_adminpw()
    self.app_name = CFG.get_app_name()
    self.alias_pattern = re.compile(ALIAS_PATTERN)
    self.user_pattern = re.compile(USER_PATTERN)

  def readCfg(self, cfg=None):
    return True

  def do_upgrade(self):
    log.info("Start to upgrade File Viewer Administrator JAAS alias")

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/check_jaas_alias.py"])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    if ws_out != None:
      alias_name, user_name = self.match(ws_out)
      if alias_name != None:
        log.info("viewerAdmin alias %s with user %s already exists. So just to map this alias to the role." % (alias_name, user_name))
        self.user_id = user_name
        succ = self.map_security_role()
        if not succ:
          return False
      else:
        log.info("viewerAdmin alias does not exist. A new jaas alias %s with user %s will be created." % (VIEWER_ADMIN_JAAS_ALIAS, self.user_id))
        succ = self.create_jaas_alias()
        if not succ:
          return False
        succ = self.map_security_role()
        if not succ:
          return False
      log.info("Upgrade File Viewer Administrator JAAS alias completed")
    return True

  def undo_upgrade(self):
    log.info("NO UNDO required for UPGRADE File Viewer Administrator JAAS alias")
    return True

  def match(self, content):
    alias_name = None
    user_name = None
    lines = content.splitlines()
    for line in lines:
      match = self.alias_pattern.match(line)
      if match != None:
        alias_name = match.group(1)
      match = self.user_pattern.match(line)
      if match != None:
        user_name = match.group(1)
      if alias_name == self.jaas_alias and user_name != None:
        return (alias_name, user_name)
    return (None, None)

  def do(self):
    log.info("Start to create File Viewer Administrator JAAS alias")
    # check if jaas_alias exists
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/check_jaas_alias.py"])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    if ws_out != None:
      print(ws_out)
      alias_name, user_name = self.match(ws_out)
      if alias_name != None:
        log.info("viewerAdmin alias %s with user %s already exists. So just to map this alias to the role." % (alias_name, user_name))
        self.user_id = user_name
        succ = self.map_security_role()
        if not succ:
          return False
      else:
        log.info("viewerAdmin alias does not exist. A new jaas alias %s with user %s will be created." % (VIEWER_ADMIN_JAAS_ALIAS, self.user_id))
        succ = self.create_jaas_alias()
        if not succ:
          return False
        succ = self.map_security_role()
        if not succ:
          return False

    log.info("Create HCL Viewer Administrator JAAS alias completed")
    return True

  def map_security_role(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/map_security_role.py"])
    args.extend([self.app_name])
    args.extend([self.jaas_alias])
    args.extend([self.user_id])
    succ, ws_out = call_wsadmin(args)
    return succ

  def create_jaas_alias(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/create_jaas_alias.py"])
    args.extend([self.user_id])
    args.extend([self.user_pw])
    args.extend([self.jaas_alias])
    args.extend([self.alias_desc])
    succ, ws_out = call_wsadmin(args)
    return succ

  def undo(self):
    log.info("Start to remove HCL Viewer Administrator JAAS alias")
    return True
