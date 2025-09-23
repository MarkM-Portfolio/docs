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
from icext import config

JYTHON_NAME = "start_app.py"

class StartApp(command.Command):
  
  def __init__(self):
    self.config = config.Config()

  def readCfg(self, cfg=None):
    return True

  def do(self):

    args = self.config.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + JYTHON_NAME])
    args.extend([self.config.getAppName()])

    logging.info("Starting the application: " + self.config.getAppName())
    if not call_wsadmin(args):
      return False

    return True

  def undo(self):
    args = self.config.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/undo_" + JYTHON_NAME])
    args.extend([self.config.getAppName()])
    logging.info("Stopping the application: " + self.config.getAppName())
    
    if not call_wsadmin(args):
      return False

    return True

