# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************


import os, shutil

import logging as log
import sys

from common import call_wsadmin, command, CFG, TASK_DIRECTORY, was_log, version_info, was
from .get_memory_cpu import set_jvm_parameter

JVM_Parameter = [
    'initialHeapSize=768',
    'maximumHeapSize=2506',
    'verboseModeGarbageCollection=true',
    'genericJvmArguments=-Djava.awt.headless=true -Xquickstart -Xgcpolicy:gencon -Xsoftrefthreshold16'
    ]

verbose_GC = 'verboseModeGarbageCollection=true'

class TuneJVM(command.Command):
  """This command will tune JVM parameters"""

  def __init__(self):
    self.new_config = []
    pass

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True
  
  def _get_jvm_bit(self):
      was_root = CFG.local_was_install_root      
      if not was_root:
        return (False, None)

      jvm_path = was_root+os.sep+'java'+os.sep+'jre'+os.sep+'bin'+os.sep+'java'
      args = [jvm_path,'-version']
      succ, out = call_wsadmin(args)

      if not succ :
          return (False, None)
      
      BIT32 = '-32'
      BIT64 = '-64'
      jvm_bit = None
      version = out.split('\n')[2]

      if version.find(BIT32) > -1 :
          jvm_bit = 32
      elif version.find(BIT64) > -1 :
          jvm_bit = 64
      else :
          succ = False
      
      return (succ, jvm_bit)

  def do_upgrade(self):
    if version_info['product_name'] == 'IBM Docs Proxy':
      return True
    
    log.info("Start to upgrade JVM parameters")
    
    jvm_parameters = [
        'initialHeapSize',
        'maximumHeapSize',
        'genericJvmArguments'
    ]
    
    args = []
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
    
    args.extend(jvm_parameters)
    
    succ, ws_out = self.call_task("upgrade_" + __name__.split(".")[-1]+ ".py", args)
    if not succ:
      return False

    for line in ws_out.split('\n'):
      if line.find('jvm_settings:') > -1:
        jvm_current_settings = eval(line.strip(' \r\n\t').replace('jvm_settings:',''))

    jvm_parameters = JVM_Parameter
    """
    Set JVM Parameters According to Physical Memory and CPU num 
    """
    if CFG.get_software_mode().lower() == 'sc':
      isCloudConv=False
      if version_info['product_name'] == 'IBM Conversion':
        isCloudConv =True
      jvm_parameters = set_jvm_parameter(jvm_parameters, isCloudConv)
	
    was_log.log('#WAS JVM Parameters is : ' + str(jvm_parameters))	 
    
    was_log.log('#WAS JVM Properties Upgrade') 
    config_path = 'JVM configuration: WAS console->Servers->WebSphere application servers->[your server name]->Java and Process Management->Process definition->Java Virtual Machine'
    new_config_list = []
    for setting in jvm_parameters:
      key,value = setting.split("=",1)
      if jvm_current_settings.get(key) in ['', ' ', '0']:
        was_log.log_new_config(key,value,config_path,log)
        new_config_list.append(key+'='+value)        
        self.new_config.append(key)
        continue
        
      if jvm_current_settings.get(key) != value:
        was_log.log_existed_config(key,jvm_current_settings.get(key),value,config_path,log)        
    
    if len(new_config_list)>0:
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
        
        args.extend(new_config_list)
        succ, ws_out = call_wsadmin(args)	         
        if not succ:
          return False       
          
    log.info("Finish to upgrade JVM parameters")  
    return True
  
  def undo_upgrade(self):
    if version_info['product_name'] == 'IBM Docs Proxy':
      return True
    log.info("Start to undo upgrade JVM parameters")
    
    if len(self.new_config) > 0:    
      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  TASK_DIRECTORY + "undo_upgrade_" + __name__.split(".")[-1]+ ".py"])
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
      
      args.extend(self.new_config)
      succ, ws_out = call_wsadmin(args)
      if not succ:
        return False
    
    log.info("Finish to undo upgrade JVM parameters")     
    return True
    
  def do(self):
       
    log.info("Start to tune JVM parameters")

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
    
    jvm_parameter_list = JVM_Parameter
    
    if CFG.get_software_mode().lower() == 'sc':
      isCloudConv=False
      if version_info['product_name'] == 'IBM Conversion':
        isCloudConv =True
      jvm_parameter_list = set_jvm_parameter(jvm_parameter_list, isCloudConv)
    
    log.info('Set JVM parameters:\n'+str(jvm_parameter_list))
    args.extend(jvm_parameter_list)
    
    if version_info['product_name'] != 'IBM Docs Proxy':    
      if CFG.get_software_mode().lower() == 'sc':
        args.append(verbose_GC)

    succ, ws_out = call_wsadmin(args)	         
    if not succ:
      return False
    log.info("Tune JVM parameters completed")
    return True

  def undo(self):
    log.info("Start to undo tune JVM parameters")
    
    '''
        when uninstall application, if there are other applications in the same WAS server, 
        unsetting JVM parameters may cause WAS server cannot launch again(with OOM exception),
        for avoiding such cases, the code just keeps the tuned settings after uninstallation. 
    '''
    log.info('Keep the tuned settings after uninstallation')

    log.info("Undo tune JVM parameters completed")
    return True
