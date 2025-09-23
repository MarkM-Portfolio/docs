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
from common import CFG, main_entry

commands = [
  {
    'class': 'conversion.install_libre.InstallLibre',
    'isAtomCmd': False,
  },
  {
    'class': 'conversion.install_vcredist.InstallVcredist',
  },
  {
    'class': 'conversion.install_sym.InstallSymphony',
    'isAtomCmd': False,
  },
  {
    'class': 'conversion.install_native.InstallNativeFiles',
    'isAtomCmd': False,
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
]


