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


import os
import os.path
import shutil

from commands import command
import logging as log
from icext.config import CONFIG as CFG
from util.common import FileInstall


class AddVersionInfo(command.Command):
  """This command will add product version info"""

  def __init__(self):
    self.version_txt = os.path.join(CFG.get_build_dir(),'installer','version.txt')
    self.version_dir = CFG.get_version_dir()
    self.backup_dir = CFG.get_temp_dir() + os.sep + 'version'
    self.updater = None

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to add product version information")

    if not os.path.exists(self.version_txt) or not os.path.isfile(self.version_txt):
        log.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        os.makedirs(self.version_dir)
    
    shutil.copy(self.version_txt,self.version_dir) 
   
    log.info("Version Information added")
    return True
    
  def undo(self):
    log.info("Start to remove product version information")    
    
    if os.path.exists(self.version_dir) and os.path.isdir(self.version_dir):
        shutil.rmtree(self.version_dir,True)

    log.info("Remove product version information completed")
    return True

  def do_upgrade(self):
    log.info("Start to update product version information")

    if not os.path.exists(self.version_txt) or not os.path.isfile(self.version_txt):
        log.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        os.makedirs(self.version_dir)
    
    self.updater = FileInstall(self.version_txt, self.version_dir, self.backup_dir)
    succ = self.updater.upgrade_files()
    
    if succ:    
      log.info("Version Information updated")
      return True
    else:
      return False
    
  def undo_upgrade(self):
    log.info("Start to rollback product version information")    
    
    succ = True
    if self.updater:
      self.updater = FileInstall(self.version_txt, self.version_dir, self.backup_dir)
      succ = self.updater.undo_upgrade_files()
    
    log.info("Rollback product version information completed")
    return succ