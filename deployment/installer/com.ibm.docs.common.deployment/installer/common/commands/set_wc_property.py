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

from common import command, CFG

class SetWCProperty(command.Command):
  
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()

  def readCfg(self, cfg=None):
    self.name = cfg['name']
    self.value = cfg['value']
    return True
     
  def do(self):
    log.info("Setting WebContainer property %s to %s..." % (self.name, self.value))
    succ = self.call_common_task("set_webcontainer_property.py", [self.scope, self.scope_name, self.target_scope, self.name, self.value])
    log.info("WebContainer property set completed")
    return succ   
  
  def undo(self):
    log.info("Removing WebContainer property %s ..." % (self.name))
    succ = self.call_common_task("undo_set_webcontainer_property.py", [self.scope, self.scope_name, self.target_scope, self.name])
    return succ