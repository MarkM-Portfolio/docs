# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


import logging
from commands import command
from util.common import call_wsadmin
from util.common import parse_ws_map
from viewer.config import CONFIG as CFG
from util.upgrade_change_log import was_log

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
    return self._add_workmanager()
    
  def undo(self):
    return self._delete_workmanager()
    
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
