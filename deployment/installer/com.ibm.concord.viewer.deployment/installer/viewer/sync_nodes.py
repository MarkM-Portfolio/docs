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

import os, sys, fileinput, subprocess
import logging
from commands import command
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG

JYTHON_NAME = "sync_nodes.py"

class SyncNodes(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    logging.info("Synchronizing all nodes...")

    if not CFG.isND():
      logging.info("Unnecessary for a non ND installation")
      return True
      
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/" + JYTHON_NAME])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    return True

  def undo(self):
    logging.info("Synchronizing all nodes...")
    if not CFG.isND():
      logging.info("Unnecessary for a non ND installation")
      return True
      
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/undo_" + JYTHON_NAME])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    return True

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()