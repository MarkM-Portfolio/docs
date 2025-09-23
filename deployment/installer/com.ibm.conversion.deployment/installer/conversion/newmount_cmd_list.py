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

commands = [
#  {
#    'class': 'conversion.set_env.SetEnv',
#  },
  {
    'class': 'common.commands.stop_server.StopServer',
  },
  {
    'class': 'common.commands.sync_nodes.SyncNodes',
  },
  {
    'class': 'common.commands.start_server_base.StartServerBase',
  },
  {
    'class': 'conversion.nfs_mount.NFSMount'
  },
  {
    # this command can be reused because it just remove/create the variable, so no problems
    'class': 'conversion.set_websphere_variable.SetVariables'
  },
  { 
    'class': 'common.commands.sync_nodes.SyncNodes', 
  },
  {
    'class': 'common.commands.stop_server_base.StopServerBase',
  },
  { 
    'class': 'common.commands.start_server.StartServer', 
  },
#  {
#    'class': 'conversion.start_app.StartApp',
#  },
]


