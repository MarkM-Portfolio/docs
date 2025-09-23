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
from common import command, CFG, call_wsadmin
import logging as log
import sys



class AddDestination(command.Command):
  """This command will add destination for journal"""

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
       
    log.info("Journal:start to add destination")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    
    dicts = CFG.get_journal_properties()
    args.extend([
        dicts['destination_name'],
        dicts['bus_name']
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
    log.info("Journal:complete to add destination")
    return True
    
  def undo(self):
    log.info("Journal:Start to remove destination")    
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])

    dicts = CFG.get_journal_properties()
    args.extend([
        dicts['destination_name'],
        dicts['bus_name']
        ])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False   
      
    log.info("Journal:remove destination completed")
    return True



