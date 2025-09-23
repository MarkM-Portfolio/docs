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
from common import command, call_wsadmin, CFG
import logging as log

class StopServerCluster(command.Command):
  
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.node_name = CFG.get_node_name()
    
  def readCfg(self, cfg=None):
    return True

  def do(self):
    servers, clusters = CFG.prepare_scope()
    if not self.stop_servers('Files', self.scope, servers, clusters):
      return False
    
    for app in ['News', 'Common']:
      servers, clusters = CFG.prepare_app_scope(app.lower())
      if not self.stop_servers(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
        return False
    
    return True

  def undo(self):
    servers, clusters = CFG.prepare_scope()
    if not self.start_servers('Files', self.scope, servers, clusters):
      return False
    
    for app in ['News', 'Common']:
      servers, clusters = CFG.prepare_app_scope(app.lower())
      if not self.start_servers(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
        return False
    
    return True

  def start_servers(self, app_name, scope_name, servers, clusters):
    log.info("Begin to start servers that %s application located in" % app_name)
    
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([scope_name]) # server or cluster
    if clusters:
      args.extend([clusters[0]]) 
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])

    succ, out = call_wsadmin(args)
    if not succ:
      return False
    
    log.info("End to start servers that %s application located in" % app_name)
    
    return True

  def stop_servers(self, app_name, scope_name, servers, clusters):
    log.info("Begin to stop servers that %s application located in" % app_name)
    
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([scope_name]) # server or cluster
    if clusters:
      args.extend([clusters[0]]) 
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])
    
    succ, out = call_wsadmin(args)
    if not succ:
      return False
    
    log.info("End to stop servers that %s application located in" % app_name)
    
    return True
  def do_upgrade(self):
    return self.do()
  
  def undo_upgrade(self):
    return self.undo()
    