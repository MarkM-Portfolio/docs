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


import os, shutil, sys
import logging as log

from common import call_wsadmin, command, CFG, TASK_DIRECTORY

class TuneLOG(command.Command): 

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True
  
  def do(self):
       
    log.info("Start to tune LOG parameters")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  TASK_DIRECTORY + __name__.split(".")[-1]+ ".py"])
      
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
        
    if CFG.get_software_mode().lower() == 'sc':
      succ, ws_out = call_wsadmin(args)
      if not succ:
        log.info("Error happens when Tune LOG parameters.")
        return False
      log.info("Tune LOG parameters completed")
    else:
      log.info("Need not Tune LOG parameters for Promise.")  
      
    return True

  def undo(self):
    log.info("Start to undo tune LOG parameters")     
    log.info('Keep the tuned settings after uninstallation')
    log.info("Undo tune LOG parameters completed")
    return True
