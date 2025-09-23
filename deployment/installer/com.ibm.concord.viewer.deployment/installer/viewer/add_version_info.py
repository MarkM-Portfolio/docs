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

import os
import os.path
import shutil

from commands import command
import logging as log
from viewer.config import CONFIG as CFG
from util.common import FileInstall


class AddVersionInfo(command.Command):
  """This command will add product version info"""

  def __init__(self):
    self.version_txt = os.path.join(CFG.get_build_dir(),'installer','version.txt')
    self.version_dir = CFG.get_version_dir()
    self.backup_dir = CFG.get_temp_dir() + os.sep + 'version'

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to add product version information")

    if not os.path.exists(self.version_txt) or not os.path.isfile(self.version_txt):
        log.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        try:
          os.makedirs(self.version_dir)
        except Exception as e:
          log.info('Cannot find version directory, add version information ignored.')
          pass
          return True
    
    shutil.copy(self.version_txt,self.version_dir) 
   
    log.info("Version Information added")
    return True
    
  def undo(self):
    log.info("Start to undo product version information")    
    
    if os.path.exists(self.version_dir) and os.path.isdir(self.version_dir):
        shutil.rmtree(self.version_dir,True)

    log.info("Undo add product version information completed")
    return True

  def do_upgrade(self):
    log.info("Start to update product version information")

    if not os.path.exists(self.version_txt) or not os.path.isfile(self.version_txt):
        log.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        os.makedirs(self.version_dir)
    
    file_install = FileInstall(self.version_txt, self.version_dir, self.backup_dir)
    file_install.upgrade_files()
    
    log.info("Version Information updated")
    return True
    
  def undo_upgrade(self):
    log.info("Start to undo product version information")    
    
    file_install = FileInstall(self.version_txt, self.version_dir, self.backup_dir)
    file_install.undo_upgrade_files()
    
    log.info("Undo update product version information completed")
    return True


