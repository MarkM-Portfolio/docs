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
  {
    'class': 'docs.stop_node.StopNode',
    'isEnabled': CFG.isND(),
  },
  {
    'class': 'docs.install_osgi_bundle.InstallRTC4WebBundle',
    'isAtomCmd': False,
  },
  {
    'class': 'docs.start_node.StartNode',
    'isEnabled': CFG.isND(),
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
]