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

from common import was_cmd_util, command, CFG, TASK_DIRECTORY, call_wsadmin

JYTHON_NAME = "start_app.py"

class StartApp(command.Command):
  
  def __init__(self):
    pass
    
  def readCfg(self, cfg=None):
    return True

  def do(self):

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  TASK_DIRECTORY + JYTHON_NAME])
    args.extend([CFG.get_app_name()])

    logging.info("Starting the application: " + CFG.get_app_name())
    succ, ws_out = call_wsadmin(args)
    
    # treat it as success no matter what condition
    #if not succ:
    #  return False

    return True

  def undo(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  TASK_DIRECTORY + "undo_" + JYTHON_NAME])
    args.extend([CFG.get_app_name()])
    logging.info("Stopping the application: " + CFG.get_app_name())
    
    succ, ws_out = call_wsadmin(args)
    
    # treat it as success no matter what condition
    #if not succ:
    #  return False

    return True

