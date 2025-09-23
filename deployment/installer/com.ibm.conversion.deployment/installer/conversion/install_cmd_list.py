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

"""
This file saves all confiurable commands

  { 'class': 'package_name.module_name.ClassName', #required
    'isEnabled': False, #optional, default True
    'isAtomCmd': False, #optional, default True
    'cfg': {} #optional
  },

if you need to add new commands, check examples below, and pay attension to SORT
"""
import os
from common import CFG

commands = [
  {
    'class': 'common.commands.collect_cluster_info.CollectClusterInfo',
    'isAtomCmd': False,
    'exec_in_retry': True,
  },
  {
    'class': 'common.commands.collect_webserver_info.CollectWebserverInfo',
    'isAtomCmd': False,
  },
  {
    'class': 'conversion.initial_was_data.InitialWasData',
  }, 
  {
    'class': 'conversion.install_config_json.InstallConfigJson',
    'isAtomCmd': False,
  },
  {
    'class': 'conversion.install_siteflip_script.InstallSiteflipScript',
    'isAtomCmd': False,
    'isEnabled': CFG.is_sc() and os.name == "nt",
  },  
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },
  {
    'class': 'conversion.set_websphere_variable.SetVariables',
  },
  {
    'class': 'conversion.set_websphere_security.SetSecurity',
  },
  { 
    'class': 'conversion.add_workmanager.AddWorkManager',
    'cfg':
    {
      'name': 'ConversionWorkManager',
      'jndi_name': 'com/ibm/symphony/conversion/workmanager',
      'alarm_threads': '2',
      'min_threads': '4',
      'max_threads': '100',
      'thread_prio': '5',
      'workTimeout': '120000',
      'workReqQSize': '3000',
      'workReqQFullAction': '0',
      'isGrowable': 'false',
    } 
  },
  {
    'class': 'conversion.install_ear.InstallEar',
    'cfg':{
      'app':CFG.get_app_name(),
    }
  },  
  {
    'class': 'conversion.install_ear.InstallEar',
    'cfg':{
      'app':CFG.get_ids_app_name(),
    }
  }, 
  { 
    'class': 'common.commands.create_docs_admin.SetupDocsAdminJ2CAlias', 
    'isEnabled': CFG.is_premise(),
  },    
  {
    'class': 'common.commands.tune_jvm.TuneJVM',
  },
  {
    'class': 'common.commands.tune_log.TuneLOG',
  },
  #{
  #  'class':'common.commands.set_was_variable.SetVariables',
  #  'cfg':{
  #    'name': 'CONVERSION_VERSION',
  #    'value': CFG.get_version_value(),
  #    'forceUpdate': True
  #  }
  #},
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },
  {
    'class': 'common.commands.stop_server.StopServer',
    'isEnabled': CFG.isND(),
  },
  {
    'class': 'conversion.jobmanager_adapter.JobManagerAdapter',
    'exec_in_retry': True,
  },
  #{
  #  'class':'common.commands.add_version_info.AddVersionInfo',
  #},
  {
    'class': 'conversion.create_uninstaller.CreateUninstaller',
    'isEnabled': not CFG.is_sc(),
  },
  {
    'class': 'common.commands.add_tag.AddTag',
  },
  {
    'class': 'common.commands.stop_server.StopServer',
    'isEnabled': not CFG.isND(),
  },
  { 
    'class': 'common.commands.start_server.StartServer', 
  },
  { 
    'class': 'common.commands.map2web_server.MapProxy2WebServer', 
    'isEnabled': CFG.is_premise() and CFG.webserver_name != '',
    'cfg':{
      'app': CFG.get_app_name(),
      'has_local_webserver':True,
      'need_map_module': True,
      'ear_file_name': 'com.ibm.symphony.conversion.service.rest.was.ear.ear'
    } 
  },
]


