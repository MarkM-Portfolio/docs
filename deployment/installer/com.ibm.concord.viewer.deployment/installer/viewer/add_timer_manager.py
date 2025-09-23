# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
from commands import command
from util.common import call_wsadmin
import logging as log
from viewer.config import CONFIG as CFG

TIMER_MANAGER_NAME = 'ViewerTimerManager'
TIMER_MANAGER_JNDI_NAME = 'com/ibm/concord/viewer/timermanager'

class AddTimerManager(command.Command):  
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """

  def do(self):
    log.info("Start to create TimerManager for Viewer Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([TIMER_MANAGER_NAME])
    args.extend([TIMER_MANAGER_JNDI_NAME])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    log.info("Create TimerManager for Viewer Server completed")
    return True

  def undo(self):
    log.info("Start to delete TimerManager for Viewer Server")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([TIMER_MANAGER_NAME])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    log.info("Delete TimerManager for Viewer Server completed")
    return True
    