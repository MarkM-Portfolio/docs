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
    'class': 'common.commands.map2web_server.MapProxy2WebServer', 
    'isEnabled': CFG.is_premise(),
    'cfg':{
      'app': CFG.get_app_name(),
      'has_local_webserver':False,
      'need_map_module':False
    } 
  }
]


