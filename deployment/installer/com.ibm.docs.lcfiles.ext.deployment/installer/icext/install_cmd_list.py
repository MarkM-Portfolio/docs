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
from common import CFG

commands = [
  # Register Docs in Connections News
  { 
    'class': 'icext.register_in_news.RegisterDocsInNews',
  }, 
  # Register Docs in LCC.xml
  { 
    'class': 'icext.revise_lcc.ReviseLotusConnectionsConfig',
  },   
  # install file type
  { 'class': 'icext.install_filetype.InstallFiletype', 
    'isAtomCmd': False,
  },
  # can only be enabled for LC3.x OSGI bundle approach                            
  { 'class': 'icext.stop_server_cluster.StopServerCluster',
    'isEnabled': CFG.get_restart_connections()
  },                                                                              
  {                                                                               
    'class': 'common.commands.sync_nodes.SyncNodes',                                        
    #'isEnabled': False, #optional, default True                                   
  },
  {
      'class': 'icext.check_ic_role.CheckICRole'  
  },   
  # both EAR and JAR will be installed via this command                           
  { 'class': 'icext.install_plugin.InstallPlugin',                                
    'isAtomCmd': False,                                                           
  },                                                                              
  { 'class': 'icext.install_plugin.Map2WebServer', 
  },
  # Install Docs daemon for hooking the Lotus Connections events
  { 
    'class': 'icext.install_docs_daemon.InstallDocsDaemon',
    'isAtomCmd': False,
  },
  {
    'class': 'common.commands.add_version_info.AddVersionInfo',
  },
  {
    'class': 'icext.create_uninstaller.CreateUninstaller',
  },
  {                                                                               
    'class': 'common.commands.sync_nodes.SyncNodes',                                        
    #'isEnabled': False, #optional, default True                                   
  },                                                                              
  { 'class': 'icext.start_server_cluster.StartServerCluster',                     
    'isEnabled': CFG.get_restart_connections()                              
  },                                                                              
]                                             
