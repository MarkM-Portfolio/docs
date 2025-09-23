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
import logging as log
from common import CFG, call_wsadmin, command

class SetVariables(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    log.info("Setting Websphere variables...")
    succ = self.__set_variable("CONVERSION_INSTALL_ROOT", CFG.install_root_on_node) 
    if not succ:
      return False
    succ = self.__set_variable("DOCS_SHARE", CFG.getSharedDataRoot()) 
    if not succ:
      return False
    succ = self.__set_variable('VIEWER_SHARE',CFG.getViewerSharedDataRoot())
    if not succ:
      return False
    log.info("Websphere variables set completed")
    return True
  
  def __set_variable(self, name, value):
    log.info("Setting " + name + " as:" + value)
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([name])
    args.extend([value])
    succ, ws_out = call_wsadmin(args)
    return succ
    
  def __unset_variable(self, name):
    log.info("Removing " + name)
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([name])
    succ, ws_out = call_wsadmin(args)
    return succ
    
  def undo(self):
    log.info("Removing Websphere variables...")
    succ = self.__unset_variable("CONVERSION_INSTALL_ROOT")
    if not succ:
      return False
    succ = self.__unset_variable("DOCS_SHARE")
    if not succ:
      return False
    succ = self.__unset_variable("VIEWER_SHARE")
    if not succ:
      return False
    log.info("Websphere variables removed")
    return True

  def do_upgrade(self):
    return True
    
  def undo_upgrade(self):
    return True