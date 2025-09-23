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
"""
This file saves all confiurable commands

  { 'class': 'package_name.module_name.ClassName', #required
    'isEnabled': False, #optional, default True
    'isAtomCmd': False, #optional, default True
    'cfg': {} #optional
  },

if you need to add new commands, check examples below, and pay attension to SORT
"""
from viewer.config import CONFIG as CFG

commands = [
  {
  'class': 'viewer.stop_server.StopServer',
  },
  {
    'class': 'viewer.sync_nodes.SyncNodes',
  },
  {
    'class': 'viewer.start_server_base.StartServerBase',
  },
  { 'class': 'viewer.install_config_json.InstallConfigJson',
    'isAtomCmd': False,
  },
  {
    'class': 'viewer.set_wc_property.SetWCProperty',
    'cfg':{
      'name': 'com.ibm.ws.webcontainer.disablexPoweredBy',
      'value': 'true'
    }    
  },
  {
    'class': 'viewer.set_was_variable.SetVariables',
    'cfg':{
      'name': 'VIEWER_INSTALL_ROOT',
      'value': CFG.get_install_root()
    }
  },
  {
    'class': 'viewer.set_was_variable.SetVariables',
    'cfg':{
      'name': 'VIEWER_SHARED_DATA_ROOT',
      'value': CFG.get_shared_data_dir()
    }
  },
  {
    'class': 'viewer.set_was_variable.SetVariables',
    'cfg':{
      'name': 'VIEWER_SHARED_DATA_NAME',
      'value': 'VIEWER_SHARE'
    }
  },
  #{
  #  'class': 'viewer.set_was_variable.SetVariables',
  #  'cfg':{
  #    'name': 'VIEWER_VERSION',
  #    'value': CFG.get_version_value(),
  #    'forceUpdate': True
  #  }
  #},
  { 
    'class': 'viewer.disable_session_security.DisableSessionSecurity',
  },
  #{
  #  'class': 'viewer.add_version_info.AddVersionInfo',
  #},
  { 
    'class': 'viewer.add_image_png.AddImagePng',      
  },
  {
  'class': 'viewer.register_nfs_variable.RegisterNFS',#only for windows
  },
  {
     'class': 'viewer.tune_jvm.TuneJVM',
  },
  {
    'class': 'viewer.tune_log.TuneLOG',
  },
  {
    'class': 'viewer.create_jvm_property.CreateJVMProperty',
  },
  { 'class': 'viewer.add_workmanager.AddWorkManager', 
    'cfg': {
      'name': 'ViewerWorkManager',
      'jndiName': 'com/ibm/concord/viewer/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '5',
      'maxThreads': '50',
      'threadPriority': '5',
      'workTimeout': '150000',
      'workReqQSize': '70',
      'workReqQFullAction': '0', # 0 means block, 1 means fail
      'isGrowable': 'true',
    }   
  },
  { 'class': 'viewer.add_workmanager.AddWorkManager', 
    'cfg': {
      'name': 'ViewerUploadWorkManager',
      'jndiName': 'com/ibm/concord/viewer/upload/convert/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '0',
      'maxThreads': '4',
      'threadPriority': '5',
      'workTimeout': '150000',
      'workReqQSize': '70',
      'workReqQFullAction': '0', # 0 means block, 1 means fail
      'isGrowable': 'false',
    }   
  },
  { 'class': 'viewer.install_app.InstallEar', 
    'cfg':{
      'app': CFG.get_app_name(),
      'ear_name': 'com.ibm.concord.viewer.ear'
    }
  },
  {
    'class': 'viewer.create_viewer_admin.SetupViewerAdminJ2CAlias', 
  },
  { 'class': 'viewer.install_app.InstallEar', 
    'cfg':{
      'app': CFG.get_sanity_app_name(),
      'ear_name' : 'com.ibm.docs.viewer.sanity.ear'
    }
  },
  { 'class': 'viewer.install_app.Map2WebServer', 
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_app_name(),
      'ear_name': 'com.ibm.concord.viewer.ear',
    },
  },
  { 'class': 'viewer.install_app.Map2WebServer', 
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_sanity_app_name(),
      'ear_name' : 'com.ibm.docs.viewer.sanity.ear',
    },
  },
  { 'class': 'viewer.add_timer_manager.AddTimerManager', 
  }, 
  { 'class': 'viewer.add_object_cache.AddObjectCache', 
  }, 
  #install journal begin
  {
    'class': 'viewer.journal_add_bus.AddBus', 
  },
  {
    'class': 'viewer.journal_create_jmsfactory.CreateFactory', 
  },
  {
    'class': 'viewer.journal_add_destination.AddDestination', 
  },
  {
    'class': 'viewer.journal_create_topic.CreateTopic', 
  },
  {
    'class': 'viewer.journal_add_activation.AddActivation', 
  },
  #install journal end
  { 
    'class': 'viewer.sync_nodes.SyncNodes', 
  },
  {
    'class': 'viewer.stop_server_base.StopServerBase',
  },
  {
    'class': 'viewer.create_uninstaller.CreateUninstaller',
  },
  {
    'class': 'viewer.add_tag.AddTag',
  },
  { 
    'class': 'viewer.start_server.StartServer', 
  },
            
]


