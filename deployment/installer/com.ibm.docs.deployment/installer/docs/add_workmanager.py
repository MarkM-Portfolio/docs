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

import socket
import logging
from common import command, CFG, was_log, call_wsadmin, parse_ws_map

JYTHON_NAME = "add_workmanager.py"
WORK_MANAGER_CONFIG_PATH = "Resources->Asynchronous beans->Work managers, Scope: Cell"
class AddWorkManager(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.added = False

  def readCfg(self, cfg=None):
    self.cfg = cfg
    self.name = cfg['name']
    self.jndi_name = cfg['jndiName']
    self.alarm_threads = cfg['numAlarmThreads']
    self.min_threads = cfg['minThreads']
    self.max_threads = cfg['maxThreads']
    self.thread_prio = cfg['threadPriority']
    self.workTimeout = cfg['workTimeout']
    self.workReqQSize = cfg['workReqQSize']
    self.workReqQFullAction = cfg['workReqQFullAction']
    self.isGrowable = cfg['isGrowable']

  def do(self):
    if self._is_workmanager_owner():
      return self._add_workmanager()
    return True

  def undo(self):
    if self._is_workmanager_owner():
      return self._delete_workmanager()
    return True

  def do_upgrade(self):
    logging.info("Start to upgrade work manager: " + self.name)

    succ, ws_out = self.call_task("get_workmanager.py", [CFG.get_scope_full_name(), self.name])

    if not succ:
      logging.info("Failed to read work manager information")
      return False

    attrs = None
    for line in ws_out.split('\n'):
      if line.find('workmanager attributes: ') > -1:
        attrs = eval(line.strip(' \r\n\t').replace('workmanager attributes: ',''))
        break
      elif line.find('No workmanager found') > -1:
        break

    if attrs:
      #compare settings
      curr_settings = parse_ws_map(attrs)

      same = True
      diff_settings = {}
      recommend_diff_settings = {}
      for (key,value) in list(self.cfg.items()):
        curr_value = None
        if key in curr_settings:
          if curr_settings[key] != value:
            diff_settings[key] = curr_settings[key]
            recommend_diff_settings[key] = value
            same = False
        else:
          recommend_diff_settings[key] = value
          same = False

      if not same:
        was_log.log("#WAS workmanager Upgrade")
        was_log.log_existed_config(self.name, diff_settings, recommend_diff_settings, WORK_MANAGER_CONFIG_PATH, logging)
    else:
      #add the workmanager
      if self._add_workmanager():
        was_log.log("#WAS workmanager Upgrade")
        was_log.log_new_config(self.name, self.cfg, WORK_MANAGER_CONFIG_PATH, logging)
        return True
      else:
        logging.info("Failed to add workmanager " + self.name)
        return False

    return True

  def undo_upgrade(self):
    if self.added:
      return self._delete_workmanager()

    return True

  def _add_workmanager(self):
    args = []
    # wasadmin command line arguments
    args.extend([CFG.get_scope_full_name()])
    args.extend([self.name])
    args.extend([self.jndi_name])
    args.extend([self.alarm_threads])
    args.extend([self.min_threads])
    args.extend([self.max_threads])
    args.extend([self.thread_prio])
    otherAtts = []
    otherAtts.extend(['workTimeout=' + self.workTimeout])
    otherAtts.extend(['workReqQSize=' + self.workReqQSize])
    otherAtts.extend(['workReqQFullAction=' + self.workReqQFullAction])
    otherAtts.extend(['isGrowable=' + self.isGrowable])
    args.extend([",".join(otherAtts)])

    logging.info("Creating work manager: " + self.name)

    succ, ws_out = self.call_task(JYTHON_NAME, args)
    if not succ:
      return False

    self.added = True

    return True

  def _delete_workmanager(self):
    logging.info("Deleting work manager: " + self.name)

    succ, ws_out = self.call_task("undo_" + JYTHON_NAME, [CFG.get_scope_full_name(), self.name])
    if not succ:
      return False

    return True

  def _is_workmanager_owner(self):
    #only add work manager for migration owner in SmartCloud.
    if self.jndi_name == 'com/ibm/docs/migration/workmanager':
      if CFG.get_software_mode().lower() == 'sc' and CFG.get_migration_owner_hostname().strip() != "":
        owner_short_hostname = CFG.get_migration_owner_hostname().split(".")[0]
        local_short_hostname = socket.gethostname().split(".")[0]
        logging.info("Migration tool for HCL Docs Server configuration is [owner: %s, local: %s]" % (owner_short_hostname, local_short_hostname))
        if owner_short_hostname != local_short_hostname:
          logging.info("Skip to maintain migration workmanager for HCL Docs Server [hostname: %s]" % (local_short_hostname))
          return False
    return True
