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

from common import command, CFG, was_log, call_wsadmin, parse_ws_map
import logging as log


TRANSACTION_CONFIG_PATH = "Servers->Server Types->WebSphere application servers->[Docs server name]\
->Container Settings->Container Services->Transaction Service->%s "
class TuneTransactionConfig(command.Command):
  """
    Change the WAS server's transction service's retry count
    from unlimited to 1.
    The config can make sure HouseKeeper task only run twice when triggered.
    For WAS console, go server1->Container Services->Transaction Service->
    heuristic retry limit
      
    Change the WAS server's transction service's maximum timeout from 300 to 2^31-1,
    For WAS console, go server1->Container Services->Transaction Service->Maximum transaction timeout
  """

  def __init__(self):
   
    self.config_settings = {      
      # config_key, config_value, config_name, config_default_value
      'heuristicRetryLimit': ['1', 'Heuristic retry limit', '0'],
      'propogatedOrBMTTranLifetimeTimeout': ['2147483647', 'Maximum transaction timeout', '300']
    }
    
  def readCfg(self, cfg=None):
    return True

  def do(self):
    log.info("Start to tune WAS transaction configuration")

    servers, clusters = CFG.prepare_scope()

    if servers:
      succ = self._set_value(CFG.get_scope_type(), servers[0]["nodename"], servers[0]["servername"])
    
    if clusters:
      succ = self._set_value(CFG.get_scope_type(), clusters[0], clusters[0])
      
    if not succ:
      return False

    log.info('Tune WAS transaction configuration completed')
    
    return True

  def undo(self):

    log.info("Start to clean WAS transaction configuration")

    servers, clusters = CFG.prepare_scope()

    if servers:
      succ = self._unset_value(CFG.get_scope_type(), servers[0]["nodename"], servers[0]["servername"])

    if clusters:
      succ = self._unset_value(CFG.get_scope_type(), clusters[0], clusters[0])

    if not succ:
      return False
    log.info('Clean WAS transaction configuration completed')
    
    return True

  def do_upgrade(self):
    
    log.info("Start to upgrade WAS transaction configuration")    
    
    '''
    The current upgrade mechanism for WAS transaction is too complex, 
    so remove it and use installation steps instead, no matter the original 
    value of transaction, update with new value.
    '''
    args = []
    args.extend([CFG.get_scope_type()])
    servers, clusters = CFG.prepare_scope()

    if servers:
      args.extend([servers[0]["nodename"]])
      args.extend([servers[0]["servername"]])

    if clusters:
      #duplicate argument to keep consist with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    succ, ws_out = self.call_task("get_transaction.py", args)
    
    if succ:           
      settings = None
      for line in ws_out.split('\n'):
        if line.find('Transaction service settings:') > -1:
          settings = eval(line.strip(' \r\n\t').replace('Transaction service settings:',''))
          break      
      if settings:
        for (server_name, value) in list(settings.items()):
          setting = parse_ws_map(value)
          curr_value = None
          for config_key in self.config_settings:
            config_value, config_name, config_default_value = self.config_settings[config_key]
            if config_key in setting:
              curr_value = setting[config_key]
              if curr_value:
                self.config_settings[config_key][2] = setting[config_key]
            

    if servers:
      succ = self._set_value(CFG.get_scope_type(), servers[0]["nodename"], servers[0]["servername"])
    
    if clusters:
      succ = self._set_value(CFG.get_scope_type(), clusters[0], clusters[0])
  
    
    if succ:
      was_log.log("#WAS transaction configuration Upgrade")   
      for config_key in self.config_settings:
        config_value, config_name, config_default_value = self.config_settings[config_key]        
        was_log.log_new_config("Transaction service for Docs server : %s" % config_name, {config_key : config_value}, TRANSACTION_CONFIG_PATH % config_name, log)
     
    log.info("Upgrade WAS transaction configuration completed")  	
    return succ  

    
  def undo_upgrade(self):
    log.info("Start to roll back WAS transaction configuration")
    
    servers, clusters = CFG.prepare_scope()

    if servers:
      succ = self._unset_value(CFG.get_scope_type(), servers[0]["nodename"], servers[0]["servername"])

    if clusters:
      succ = self._unset_value(CFG.get_scope_type(), clusters[0], clusters[0])
      
    log.info("Roll back WAS transaction configuration completed")    
    return succ
      
  def _set_value(self, scope, arg0, arg1):
    log.info('Set transaction service configure for %s' % (arg1))
    config_setting = ''
    for config_key in self.config_settings:
      config_value, config_name, config_default_value = self.config_settings[config_key]
      config_setting += '[%s "%s"]' % (config_key, config_value)
    succ, ws_out = self.call_task(__name__.split(".")[1] + ".py", [scope, arg0, arg1, config_setting])
    if not succ:
      return False
    else:
      return True

  def _unset_value(self, scope, arg0, arg1):
    log.info('Unset transaction service configure for %s' % (arg1))	
    config_setting = ''
    for config_key in self.config_settings:
      config_value, config_name, config_default_value = self.config_settings[config_key]
      config_setting += '[%s "%s"]' % (config_key, config_default_value)
    succ, ws_out = self.call_task(__name__.split(".")[1] + ".py", [scope, arg0, arg1, config_setting])
    if not succ:
      return False
    else:
      return True
