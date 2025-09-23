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
from common import call_wsadmin, CFG, command

JYTHON_NAME = "add_workmanager.py"
class AddWorkManager(command.Command):
  
  def __init__(self):
    #self.config = config.Config()
    pass
    
  def readCfg(self, cfg=None):
    self.name = cfg['name']
    self.jndi_name = cfg['jndi_name']
    self.alarm_threads = cfg['alarm_threads']
    sym_count = CFG.getSymCount()
    self.min_threads = str(sym_count * 4)
    self.max_threads = str(sym_count * 4)
    self.thread_prio = cfg['thread_prio']
    self.workTimeout = cfg['workTimeout']
    self.workReqQSize = str(sym_count * 4)
    self.workReqQFullAction = cfg['workReqQFullAction']
    self.isGrowable = cfg['isGrowable']

  def do(self):
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./conversion/tasks/" + JYTHON_NAME])
    args.extend([CFG.getScopeFullName()])
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

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    
    return True

  def undo(self):
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./conversion/tasks/undo_" + JYTHON_NAME])

    args.extend([CFG.getScopeFullName()])
    args.extend([self.name])

    logging.info("Deleting work manager: " + self.name)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    
    return True
    
  def do_upgrade(self):
    return True
    
  def undo_upgrade(self):
    return True

