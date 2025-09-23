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

import os, shutil
from commands import command
from util.common import call_wsadmin
import logging as log
from viewer.config import CONFIG as CFG
import sys



class AddActivation(command.Command):
  """This command will add bus for journal"""

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
       
    log.info("Journal:start to add activation")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/" + __name__.split(".")[1]+ ".py"])
    
    dicts = CFG.get_journal_properties()
    args.extend([
        dicts['activation_name'],
        dicts['activation_jndi'],
        dicts['activation_dest_type'],
        dicts['topic_jndi'],
        dicts['bus_name'],
        dicts['subscription_name'],
        dicts['client_identifier']
        ])
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

    succ, ws_out = call_wsadmin(args)	         
    if not succ:
      return False
    log.info("Journal:complete to add activation")
    return True
    
  def undo(self):
    log.info("Journal:Start to remove activation")    
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./viewer/tasks/undo_" + __name__.split(".")[1]+ ".py"])

    dicts = CFG.get_journal_properties()
    args.extend([
        dicts['activation_name']
        ])
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

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False   
      
    log.info("Journal: remove activation completed")
    return True


