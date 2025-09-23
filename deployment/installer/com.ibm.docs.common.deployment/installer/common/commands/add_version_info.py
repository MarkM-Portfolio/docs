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


import os, logging
import os.path
import shutil

from common import command, CFG, version_txt, FileInstall

class AddVersionInfo(command.Command):
  """This command will add product version info"""

  def __init__(self):
    self.version_dir = CFG.get_version_dir()
    self.backup_dir = CFG.get_temp_dir() + os.sep + 'version'
    self.updater = None
    self.updates = []

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    logging.info("Start to add product version information")

    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
        log.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        os.makedirs(self.version_dir)    
    
    shutil.copy(version_txt,self.version_dir) 
   
    logging.info("Version Information added")
    return True
    
  def undo(self):
    logging.info("Start to undo add product version information")    
    
    if os.path.exists(self.version_dir) and os.path.isdir(self.version_dir):
        shutil.rmtree(self.version_dir,True)

    logging.info("Undo add product version information completed")
    return True
    
  def do_upgrade(self):
    logging.info("Start to update product version information")

    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
        logging.info('Cannot find version.txt, add version information ignored.')
        return True
    if not os.path.exists(self.version_dir) or not os.path.isdir(self.version_dir):
        os.makedirs(self.version_dir)
    
    self.updater = FileInstall(version_txt, self.version_dir, self.backup_dir)
    self.updates = self.updater.upgrade_files()
    
    if self.updates:    
      logging.info("Version Information updated")
      return True
    else:
      return False
    
  def undo_upgrade(self):
    logging.info("Start to undo product version information")    
    
    succ = True
    if self.updater:
      self.updater = FileInstall(version_txt, self.version_dir, self.backup_dir)
      succ = self.updater.undo_upgrade_files(self.updates)
    
    logging.info("Undo update product version information completed")
    return succ



