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
from common import CFG
"""
This file saves all confiurable commands

  { 'class': 'package_name.module_name.ClassName', #required
    'isEnabled': False, #optional, default True
    'isAtomCmd': False, #optional, default True
    'cfg': {} #optional
  },

if you need to add new commands, check examples below, and pay attension to SORT
"""

commands = [
  {
    'class': 'common.commands.collect_webserver_info.CollectWebserverInfo',
    'isAtomCmd': False,
  },
  {
    'class': 'common.commands.stop_server.StopServer',
  },
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },

  {
    'class': 'proxy.install_proxy_filter.InstallProxyFilter',
  },
  {
    'class': 'common.commands.start_server_base.StartServerBase',
  },
  {
    'class': 'proxy.create_jvm_property.CreateJVMProperty',
  },
  {
    'class': 'proxy.create_proxy_compressaction.CreateCompressAction',
    'cfg':
    {
      # Define the URIs being applied the defined HTTP response compression actions, separate the URIs by semicolon.
      'proxy_compress_expression': '/app/*;/api/*;/static/*;/spellcheck/*',
      # The supported content types which the HTTP compression action being applied on, separate the types by semicolon.
      'proxy_compress_types': 'text/css;text/html;text/plain;text/x-json;application/json;text/javascript;application/javascript;application/x-javascript;application/x-json'
    }
  },
  {
    'class': 'proxy.create_proxy_tuning.CreateProxyTuning',
    'cfg':
    {
      #Specifies a high availability monitor timeout time in seconds.
      'workloadManagementPolicy': '86400',
      # JVM properties, you can set the reasonable values for the initial and maximum heap size according to your system configuration.
      'jvm_properties': 'initialHeapSize=256;maximumHeapSize=1024;verboseModeGarbageCollection=true',
      # Thread pool properties, you can set the reasonable values for the minimum and maximum thread size according to your system configuration.
      'thread_pool_properties': 'Default:maximumSize=100,Proxy:maximumSize=120'
    }
  },
  {
    'class': 'common.commands.add_version_info.AddVersionInfo',
  },
  { 
    'class': 'common.commands.sync_nodes.SyncNodes', 
  },  
  { 
    'class': 'proxy.create_virtual_hosts.CreateVirtualHosts', 
    'isEnabled': CFG.is_premise()
  }, 
  { 
    'class': 'proxy.create_trusted_security.CreateTrustedSecurity', 
    'isEnabled': CFG.is_premise()
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'name' : 'DOCS_SERVERCLUSTER_NAME',
      'value' : CFG.get_docs_scope_name()
    }
  }, 
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'name' : 'PROXY_SEVERCLUSTER_NAME',
      'value' : CFG.get_proxy_server_name()
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'name' : 'PROXY_SEVERCLUSTER_NODE',
      'value' : CFG.get_proxy_node_name()
    }
  }, 
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'name' : 'PROXY_SEVERCLUSTER_TYPE',
      'value' : CFG.get_scope_type()
    }
  },
  {
    'class': 'common.commands.set_was_variable.SetVariables',
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'name' : 'IHS_FOR_DOCS_PROXY',
      'value' : CFG.get_webserver_name()
    }
  },
  { 
    'class': 'common.commands.map2web_server.MapProxy2WebServer', 
    'isEnabled': CFG.is_premise() and CFG.webserver_name != '',
    'cfg':{
      'app': CFG.get_app_name(),
      'has_local_webserver':False,
      'need_map_module':False
    } 
  },  
  {
    'class': 'common.commands.stop_server_base.StopServerBase',
  },
  {
    'class': 'proxy.create_uninstaller.CreateUninstaller',
  },
  { 
    'class': 'common.commands.start_server.StartServer', 
  }
]


