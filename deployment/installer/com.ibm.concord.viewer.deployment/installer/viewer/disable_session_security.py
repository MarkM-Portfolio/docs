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

import os, shutil
from commands import command
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG
import logging as log

class DisableSessionSecurity(command.Command):
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to disable session security integration for Viewer application Server")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/" + __name__.split(".")[1]+ ".py"])
   
    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()
	
    #for server scope
    if servers:
      args.extend([servers[0]["nodename"]])
      args.extend([servers[0]["servername"]])
		
    if clusters:
      #dupliate argument to keep consisten with servers
      args.extend([clusters[0]]) 
      args.extend([clusters[0]])	
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("disable session security integration for Viewer application Server completed")
    return True

  def undo(self):
    log.info("NO UNDO required for Disable session security for Viewer application Server in WebServer...")
    return True

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return True    