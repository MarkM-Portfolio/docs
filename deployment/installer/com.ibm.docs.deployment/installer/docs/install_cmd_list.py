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

"""
This file saves all confiurable commands

  { 'class': 'package_name.module_name.ClassName', #required
    'isEnabled': False, #optional, default True
    'isAtomCmd': False, #optional, default True
    'cfg': {} #optional
  },

if you need to add new commands, check examples below, and pay attension to SORT
"""
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
    'class': 'docs.initial_was_data.InitialWasData',
  },
  #{ 'class': 'docs.install_osgi_bundle.InstallRTC4WebBundle',
  #  'isAtomCmd': False,
  #},
  { 'class': 'docs.config_session_cookie.ConfigSessionCookie'
  },
  {
    'class': 'common.commands.stop_server.StopServer',
  },
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },
  { 'class': 'docs.install_osgi_bundle.InstallSpellCheckBundle',
    'isAtomCmd': False,
  },
  {
    'class': 'docs.install_spreadsheet_nodejs.InstallSpreadsheetNodeJS',
  },
  {
    'class': 'common.commands.start_server_base.StartServerBase',
  },
  #{ 'class': 'docs.install_osgi_bundle.InstallRTC4WebBla',
  #  'isAtomCmd': False,
  #},
  { 'class': 'docs.install_config_json.InstallConfigJson',
    'isAtomCmd': False,
  },
  {
    'class': 'common.commands.set_wc_property.SetWCProperty',
    'cfg':{
      'name': 'com.ibm.ws.webcontainer.disablexPoweredBy',
      'value': 'true'
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'cfg':{
      'name' : 'DOCS_INSTALL_ROOT',
      'value' : CFG.get_install_root()
    }
  },
  {
     'class': 'common.commands.tune_jvm.TuneJVM',
  },
  {
    'class': 'docs.create_jvm_property.CreateJVMProperty',
  },
  {
    'class': 'docs.disable_session_security.DisableSessionSecurity',
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'cfg':{
      'name' : 'DOCS_SHARED_DATA_ROOT',
      'value' : CFG.get_shared_data_dir()
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'cfg':{
      'name' : 'DOCS_SHARED_DATA_NAME',
      'value' : 'DOCS_SHARE'
    }
  },
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'ConcordWorkManager',
      'jndiName': 'com/ibm/concord/workmanager',
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
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'AutoSaveManager',
      'jndiName': 'com/ibm/docs/autosave/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '0',
      'maxThreads': '8',
      'threadPriority': '5',
      'workTimeout': '120000',
      'workReqQSize': '8',
      'workReqQFullAction': '0',
      'isGrowable': 'true',
    }
  },
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'ConvertDuringUploadWorkManager',
      'jndiName': 'com/ibm/docs/upload/convert/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '0',
      'maxThreads': '4',
      'threadPriority': '5',
      'workTimeout': '30000',
      'workReqQSize': '30',
      'workReqQFullAction': '0', # 0 means block, 1 means fail
      'isGrowable': 'false',
    }
  },
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'ConcordMigrationWorkManager',
      'jndiName': 'com/ibm/docs/migration/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '0',
      'maxThreads': '2',
      'threadPriority': '5',
      'workTimeout': '0',
      'workReqQSize': '0',
      'workReqQFullAction': '0', # 0 means block, 1 means fail
      'isGrowable': 'false',
    }
  },
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'SaveChunkWorkManager',
      'jndiName': 'com/ibm/docs/savechunk/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '2',
      'maxThreads': '8',
      'threadPriority': '5',
      'workTimeout': '6000',
      'workReqQSize': '0',
      'workReqQFullAction': '0', # 0 means block, 1 means fail
      'isGrowable': 'true',
    }
  },
  { 'class': 'docs.add_workmanager.AddWorkManager',
    'cfg': {
      'name': 'AutoPublishWorkManager',
      'jndiName': 'com/ibm/docs/autopublish/workmanager',
      'numAlarmThreads': '2',
      'minThreads': '0',
      'maxThreads': '20',
      'threadPriority': '5',
      'workTimeout': '150000',
      'workReqQSize': '30',
      'workReqQFullAction': '1', # 0 means block, 1 means fail
      'isGrowable': 'false',
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.get_db_type().lower() != 'sqlserver',
    'cfg':{
      'name': 'DOCS_JDBC_DRIVER_HOME',
      'value': CFG.db_jdbc_driver_path
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.get_db_type().lower() == 'sqlserver',
    'cfg':{
      'name': 'DOCS_MS_JDBC_DRIVER_PATH',
      'value': CFG.db_jdbc_driver_path
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.get_db_type().lower() == 'sqlserver',
    'cfg':{
      'name': 'DOCS_MS_JDBC_DRIVER_NATIVEPATH',
      'value': CFG.db_jdbc_driver_path
    }
  },
  { 'class': 'docs.create_jdbc_jaas.SetupJDBCJAAS',
  },
  { 'class': 'docs.create_jdbc_provider.SetupJDBCProvider',
  },
  { 'class': 'docs.create_data_source.SetupDataSource',
    'cfg': {
        'connection_pool': {
          'max_connections': '50'
        }
    }
  },
  { 'class': 'docs.add_scheduler.AddScheduler',
  },
  {
    'class': 'docs.tune_transaction_config.TuneTransactionConfig'
  },
  { 'class': 'docs.ensure_compatible_shared_lib.EnsureCompatibleSharedLib',
  },
  { 'class': 'docs.add_timer_manager.AddTimerManager',
  },
  { 'class': 'docs.add_object_cache.AddObjectCache',
  },
  { 'class': 'docs.install_app.InstallEar',
    'cfg':{
      'app': CFG.get_app_name(),
    }
  },
  { 'class': 'docs.install_app.InstallEar',
    'cfg':{
      'app': CFG.get_web_app_name(),
    }
  },
  { 'class': 'docs.install_app.InstallEar',
    'cfg':{
      'app': CFG.get_sc_app_name(),
      'options': ["-usedefaultbindings"],
    }
  },
  { 'class': 'docs.install_app.InstallEar',
    'cfg':{
      'app': CFG.get_ids_app_name()
    }
  },
  { 'class': 'docs.install_app.InstallEar',
    'cfg':{
      'app': CFG.get_help_app_name()
    }
  },
  { 'class': 'docs.install_app.Map2WebServer',
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_app_name(),
      'ear_name': 'com.ibm.concord.ear',
    },
  },
  { 'class': 'docs.install_app.Map2WebServer',
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_web_app_name(),
      'ear_name': 'com.ibm.docs.web.resources.ear',
    },
  },
  { 'class': 'docs.install_app.Map2WebServer',
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_sc_app_name(),
      'ear_name': 'com.ibm.docs.spellcheck.ear',
    },
  },
  { 'class': 'docs.install_app.Map2WebServer',
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_ids_app_name(),
      'ear_name': 'com.ibm.docs.sanity.ear',
    },
  },
  { 'class': 'docs.install_app.Map2WebServer',
    'isEnabled': False,
    'cfg':{
      'app': CFG.get_help_app_name(),
      'ear_name': 'com.hcl.docs.help.ear',
    },
  },
  {
    'class': 'docs.map_spellcheck_role.mapSecurityRole',
  },
  {
    'class': 'docs.journal_add_bus.AddBus',
    'isEnabled': not CFG.is_sc(),
  },
  {
    'class': 'docs.journal_create_jmsfactory.CreateFactory',
    'isEnabled': not CFG.is_sc(),
  },
  {
    'class': 'docs.journal_add_destination.AddDestination',
    'isEnabled': not CFG.is_sc(),
  },
  {
    'class': 'docs.journal_create_topic.CreateTopic',
    'isEnabled': not CFG.is_sc(),
  },
  {
    'class': 'docs.journal_add_activation.AddActivation',
    'isEnabled': not CFG.is_sc(),
  },
  #install journal end
  {
    'class': 'common.commands.tune_log.TuneLOG',
  },
  #{
  #  'class': 'common.commands.set_was_variable.SetVariables',
  #  'cfg':{
  #    'name': 'DOCS_VERSION',
  #    'value': CFG.get_version_value(),
  #    'forceUpdate': True
  #  }
  #},
  {
    'class': 'common.commands.create_docs_admin.SetupDocsAdminJ2CAlias',
  },
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },
  {
    'class': 'common.commands.stop_server_base.StopServerBase',
  },
  {
    'class': 'docs.jobmanager_adapter.JobManagerAdapter',
    'exec_in_retry': True,
  },
  #{
  #  'class': 'common.commands.add_version_info.AddVersionInfo',
  #},
  {
    'class': 'docs.create_uninstaller.CreateUninstaller',
  },
  {
    'class': 'common.commands.add_tag.AddTag',
  },
  {
    'class': 'common.commands.map2web_server.MapProxy2WebServer',
    'isEnabled': CFG.is_premise() and CFG.webserver_name != '',
    'cfg':{
      'app': CFG.get_app_name(),
      'has_local_webserver':True,
      'need_map_module': True,
      'ear_file_name': 'com.ibm.concord.ear.ear'
    }
  },
  {
    'class': 'common.commands.start_server.StartServer',
  },
]
