# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2013. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


import os, sys, fileinput, subprocess
import logging as log
from common import CFG, call_wsadmin, command

G_SECURITY_APP_ENABLED_NAME='appEnabled'
G_SECURITY_APP_ENABLED_VALUE='true'
G_SECURITY_APP_ENABLED_VALUE_UNDO='false'

was_security_items=[[G_SECURITY_APP_ENABLED_NAME,G_SECURITY_APP_ENABLED_VALUE]]

was_security_items_undo=[[G_SECURITY_APP_ENABLED_NAME,G_SECURITY_APP_ENABLED_VALUE_UNDO]]

class SetSecurity(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def do(self):
    log.info("Setting Websphere Security...")
    for item in was_security_items:
      succ = self.__set_security(item[0],item[1]) 
      if not succ:
        return False   
    log.info("Websphere security set completed")
    return True
  
  def __set_security(self, name, value):
    log.info("Setting " + name + " as:" + value)
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/" + __name__.split(".")[1]+ ".py"])    
    args.extend([name,value])    
    succ, ws_out = call_wsadmin(args)    
    return succ
    
  def __unset_security(self, name, value):
    log.info("Removing " + name)
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([name,value])    
    succ, ws_out = call_wsadmin(args)    
    return succ
    
  def undo(self):
    log.info("Removing Websphere security...")
    for item in was_security_items_undo:
      succ = self.__set_security(item[0],item[1]) 
      if not succ:
        return False        
    
    log.info("Websphere security removed")
    return True

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()