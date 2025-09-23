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


import os, sys
import logging as log

from common import command, CFG, was_log

WAS_VARIABLE_CONFIG_PATH="Environment->WebSphere variables"
class SetVariables(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    self.name = cfg['name']
    self.value = cfg['value']
    if 'forceUpdate' in cfg:
      self.force_update = cfg['forceUpdate']
    else:
      self.force_update = False
    self.old_value = None
    self.updated = False
    return True

  def do(self):
    log.info("Setting Websphere variable %s to %s..." % (self.name, self.value))

    succ = self.__set_variable(self.name, self.value)
    if not succ:
      return False
    log.info("Websphere variable set completed")
    return True

  def __set_variable(self, name, value):
    log.debug("Setting " + name + " as:" + value)
    succ = self.call_common_task("set_websphere_variable.py", [name,value])
    return succ
  
  def __unset_variable(self, name):
    log.debug("Removing " + name)
    succ = self.call_common_task("undo_set_websphere_variable.py", [name])
    return succ
    
  def __get_variable(self, name):
    log.debug("Getting " + name)
    succ, ws_out = self.call_common_task("get_websphere_variable.py",[name])
    if not succ:
      raise Exception("Failed to get varaible from websphere")
      
    value = None
    for line in ws_out.split('\n'):
      if line.find('value is:') > -1:
        value = line.strip(' \r\n\t').replace('value is:','')
        break
      elif line.find('no value found') > -1:
      	value = None
      	break
      	
    return value

  
  def undo(self):
    log.info("Removing Websphere variable %s ..." % (self.name))
    succ = self.__unset_variable(self.name)
    if not succ:
      return False
    log.info("Websphere variable removed")
    return True

  def do_upgrade(self):
    log.info("Updating Websphere variable %s..." % (self.name))
    try:
      self.old_value = self.__get_variable(self.name)
    except Exception as e:
      log.exception(e)
      return False
      
    succ = True
    if self.old_value != self.value:
      was_log.log("#Update Websphere variable %s " % (self.name))
      if not self.old_value:
        succ = self.__set_variable(self.name, self.value)
        self.updated = True
        was_log.log_new_config(self.name, self.value, WAS_VARIABLE_CONFIG_PATH, log)
      elif not self.force_update:
        was_log.log_existed_config(self.name, self.old_value, self.value, WAS_VARIABLE_CONFIG_PATH, log)
      else:
        succ = self.__set_variable(self.name, self.value)
        self.updated = True
        was_log.log_existed_config(self.name, self.old_value, self.value, WAS_VARIABLE_CONFIG_PATH, log, True)
    else:
      log.debug("No value change.")
      
    if succ:
      log.info("Update Websphere variables %s completed" % (self.name))
      
    return succ
    
  def undo_upgrade(self):
    log.info("Rollback Websphere variable %s " % (self.name))
    
    succ = True
    if self.updated:
      if self.old_value:
      	succ = self.__set_variable(self.name, self.old_value)
      else:
        succ = self.__unset_variable(self.name)
    else:
      log.info("Nothing changed, no need to roll back.")
      
    return succ