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
from viewer.config import CONFIG as CFG
from util.common import get_upgrade_type

TAGFILE_EXT = ".swidtag"

class AddTag(command.Command):
  """This command will add product version info"""

  def __init__(self):
    self.backup_dir = os.path.join(CFG.get_temp_dir(), "tag")
    self.upgrade = None

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to add tag file")
    
    tag_file_path, tag_file_name = self._find_tag_file_in_bld()
    
    tag_target_dir = CFG.get_tag_dir()
    if os.path.exists(tag_target_dir):
        log.info('Tag directory ' + tag_target_dir+ ' exists, remove it' )
        shutil.rmtree(tag_target_dir)
    
    if not tag_file_path:
        log.info('Cannot find tag directory, add tag ignored.')
        return True    
	
    try:
        log.info('Create tag directory ' + tag_target_dir)
        os.makedirs(tag_target_dir)            
    except:
        log.info('Failed to create the tag directory.')
        return False      
            
    new_tag_file_path = os.path.join(tag_target_dir, tag_file_name+TAGFILE_EXT)
    shutil.copy(tag_file_path, new_tag_file_path)
    log.info('Tag file ' + new_tag_file_path + ' added in ' + tag_target_dir)
    return True
            
    
  def undo(self):
    log.info("Start to undo product tag file.")    
    
    tag_dir = CFG.get_tag_dir()
    if os.path.exists(tag_dir) and os.path.isdir(tag_dir):
        shutil.rmtree(tag_dir,True)

    log.info("Undo add product tag file completed.")
    return True

  def do_upgrade(self):
    log.info("Start to update tag file.")
    
    new_version = CFG.get_version_value()
    old_version = CFG.get_current_version_value()
    upgrade_type = get_upgrade_type(new_version)
    
    tag_target_dir = CFG.get_tag_dir()
    #search old tag file
    if not os.path.exists(tag_target_dir):
      log.debug("No tag file founded in " + tag_target_dir)
    else:        
        if not os.path.exists(self.backup_dir):
          os.makedirs(self.backup_dir)
        
        for f in os.listdir(tag_target_dir):
          f_path = os.path.join(tag_target_dir, f)
          log.debug("Backup " + f_path)
          shutil.copy2(f_path, self.backup_dir)
          if upgrade_type == "build": # for build upgrade, the old tag file need to be removed
            os.remove(f_path)
	
    tag_file_path, tag_file_name = self._find_tag_file_in_bld()
    if not tag_file_path:
      log.info('Cannot find tag directory, add tag ignored.')
      return True    
    
    if not os.path.exists(tag_target_dir):
      log.debug('Create tag directory ' + tag_target_dir)
      os.makedirs(tag_target_dir)
      
    new_tag_file_path = None
    new_tag_file_path = os.path.join(tag_target_dir, tag_file_name+TAGFILE_EXT)
   
    shutil.copy2(tag_file_path, new_tag_file_path) 
    log.info('Tag file ' + new_tag_file_path + ' added in ' + tag_target_dir)
    self.upgrade = new_tag_file_path
    
    log.info("Update tag file completely.")
    return True
    
  def undo_upgrade(self):
    log.info("Start to roll back tag file.")
    
    if self.upgrade:
      os.remove(self.upgrade)
    
    target_dir = CFG.get_tag_dir()
    if os.path.exists(self.backup_dir) and os.path.isdir(self.backup_dir):  
      for f in os.listdir(self.backup_dir):
        f_path = os.path.join(self.backup_dir, f)
        if (os.path.isfile(f_path)):
          log.debug("roll back " + f)
          shutil.copy2(f_path, target_dir)
    
    log.info("Roll back tag file completely.")
    return True
    
  def _find_tag_file_in_bld(self):
    tag_source_dir = os.path.join(CFG.get_build_dir(),'installer','product', 'tag')
    if not os.path.exists(tag_source_dir) or not os.path.isdir(tag_source_dir):
        return (None,None)
    else:
        log.info('Tag directory' + tag_source_dir + ' is found.')
        files = os.listdir(tag_source_dir)
        tag_file_path = ''
        tag_file_name = ''
        for the_file in files:
            filepath = os.path.join(tag_source_dir, the_file)
            if os.path.isfile(filepath):
                split_file = os.path.splitext(the_file)
                ext = split_file[1]
                file_name = split_file[0]
                if ext==TAGFILE_EXT:
                        tag_file_path = filepath
                        tag_file_name = file_name
                        log.info("Tag file " + the_file + " found in " + tag_source_dir)
                        return (tag_file_path, tag_file_name)
        return (None,None)
  

