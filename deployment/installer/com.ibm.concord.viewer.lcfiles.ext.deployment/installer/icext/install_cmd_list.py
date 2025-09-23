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

from icext.config import CONFIG as CFG
                                                                                  
commands = [                                                                      
  # can only be enabled for LC3.x OSGI bundle approach                            
  { 'class': 'icext.stop_server_cluster.StopServerCluster',                       
    #'isEnabled': False, #optional, default True 
    'isEnabled': CFG.get_restart_connections()                                  
  },                                                                              
  {                                                                               
    'class': 'icext.sync_nodes.SyncNodes',                                        
    #'isEnabled': False, #optional, default True                                   
  },                                                                              
  # both EAR and JAR will be installed via this command                           
  { 'class': 'icext.install_plugin.InstallPlugin',                                
    'isAtomCmd': False,                                                           
  },                                                                              
  { 'class': 'icext.install_plugin.Map2WebServer', 
  },
  # Install Docs daemon for hooking the Lotus Connections events
  { 'class': 'icext.install_viewer_daemon.InstallViewerDaemon',
    'isAtomCmd': False,
  },
  {
    'class': 'icext.add_version_info.AddVersionInfo',
  },
  {
    'class': 'icext.reg_viewer.RegisterViewer',
    # 'isEnabled': CFG.get_ccm_enabled()
  },
  {
    'class': 'icext.set_install_lcc_tag.SetTag'
  },
  { 
    'class': 'icext.create_uninstaller.CreateUninstaller',
  },
  {                                                                               
    'class': 'icext.sync_nodes.SyncNodes',                                        
    #'isEnabled': False, #optional, default True                                   
  },                                                                              
  { 'class': 'icext.start_server_cluster.StartServerCluster',                     
    #'isEnabled': False, #optional, default True    
    'isEnabled': CFG.get_restart_connections()                               
  },                                                                              
]                                             
