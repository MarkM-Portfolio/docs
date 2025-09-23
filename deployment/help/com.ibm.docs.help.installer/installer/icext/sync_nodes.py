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


import os, sys, fileinput, subprocess
import logging
from commands import command
from util.common import call_wsadmin
from icext.config import CONFIG as CFG

JYTHON_NAME = "sync_nodes.py"

class SyncNodes(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    logging.info("Synchronizing all nodes...")

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + JYTHON_NAME])

    if not call_wsadmin(args):
      return False

    return True

  def undo(self):
    logging.info("Synchronizing all nodes...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/undo_" + JYTHON_NAME])

    if not call_wsadmin(args):
      return False

    return True

