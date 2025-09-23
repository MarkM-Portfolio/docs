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
from viewer.config import CONFIG as CFG
from util.common import call_wsadmin
import logging as log

SESSION_REUSE = {"name": "HttpSessionIdReuse", "value": "true"}
# WS_EXT_DIR will be deployed in Proxy server side
#WS_EXT_DIR = {"name": "ws.ext.dirs", "value":"${USER_INSTALL_ROOT}/optionalLibrays/docs"}

class CreateJVMProperty(command.Command):
  """ This class creates JVM property for WAS  server, and relevant HttpSessionIdReUse property"""
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()
    #self.proxy_server_name = CFG.get_proxy_server_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create JVM property for File Viewer Server")
    
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

    args.extend([SESSION_REUSE["name"], SESSION_REUSE["value"]])
    #args.extend([WS_EXT_DIR["name"], WS_EXT_DIR["value"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Create JVM property for File Viewer Server completed")
    return True

  def undo(self):
    log.info("Start to delete JVM property for File Viewer Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    
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

    args.extend([SESSION_REUSE["name"]])
    #args.extend([WS_EXT_DIR["name"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Delete JVM property for File Viewer Server completed")
    return True
