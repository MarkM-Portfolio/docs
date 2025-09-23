import subprocess
import os, shutil
import math
import logging
import string
import sys
from zipfile import ZipFile, ZipInfo

class ZipCompat(ZipFile):
  def __init__(self, *args, **kwargs):
    ZipFile.__init__(self, *args, **kwargs)

  def extract(self, member, path=None, pwd=None):
    if not isinstance(member, ZipInfo):
      member = self.getinfo(member)
    if path is None:
      path = os.getcwd()
    return self._extract_member(member, path)

  def extractall(self, path=None, members=None, pwd=None):
    if members is None:
      members = self.namelist()
    for zipinfo in members:
      self.extract(zipinfo, path)

  def _extract_member(self, member, targetpath):
    if (targetpath[-1:] in (os.path.sep, os.path.altsep) and len(os.path.splitdrive(targetpath)[1]) > 1):
      targetpath = targetpath[:-1]
    if member.filename[0] == '/':
      targetpath = os.path.join(targetpath, member.filename[1:])
    else:
      targetpath = os.path.join(targetpath, member.filename)
    targetpath = os.path.normpath(targetpath)
    upperdirs = os.path.dirname(targetpath)
    if upperdirs and not os.path.exists(upperdirs):
      os.makedirs(upperdirs)
    if member.filename[-1] == '/':
      if not os.path.isdir(targetpath):
        os.mkdir(targetpath)
      return targetpath
    target = file(targetpath, "wb")
    try:
      target.write(self.read(member.filename))
    finally:
      target.close()
    return targetpath
    
class FileInstall:
    def __init__(self, build_path, target_dir, backup_dir, re_file_name = None):
      self.build_path = build_path
      self.target_dir = target_dir
      self.backup_dir = backup_dir
      self.fail_remove_file_list = []
      self.re_file_name = re_file_name
    
    def upgrade_files(self, clean_back_up=True):
      updates = []
      
      if clean_back_up and os.path.exists(self.backup_dir):
        shutil.rmtree(self.backup_dir, True)
      
      if not os.path.exists(self.backup_dir):
        os.makedirs(self.backup_dir)           


      if (os.path.isdir(self.build_path)):
        for f in os.listdir(self.build_path):
          new_f_path = self.build_path + os.sep + f
          if self._upgrade_file(new_f_path):       
            updates.append(self.target_dir + os.sep + f )
      
      else:
        if self._upgrade_file(self.build_path):
          f = os.path.basename(self.build_path)
          updates.append(self.target_dir + os.sep + f )
        
      return updates
      
    def undo_upgrade_files(self, updates):
      if not updates:
      	logging.info("nothing need to roll back")
      """ Read updateList, and remove the files in the updateList"""
      for f in updates:
        try:
          if os.path.isfile(f):
            #logging.debug("remove " + f)
            os.remove(f)
        except Exception, e:
          logging.info("failed to remove " + f)            
              
      """copy the backup file back"""
      if not os.path.isdir(self.backup_dir):
        return False
        
      for f in os.listdir(self.backup_dir):
        f_path = self.backup_dir + os.sep + f
        if (os.path.isfile(f_path)):
          logging.debug("roll back " + f)
          shutil.copy2(f_path, self.target_dir)
      
      return True
      
    def _get_keyword(self, file_name):
      
      component_name = ""
      if self.re_file_name is None:
        """Split the file name, and get the component name"""
        ss = file_name.split("_")        
        if (len(ss) == 1):
          component_name = file_name
        else:
          component_name = string.join(ss[:-1], "_")
      else:
        import re
        pattern = re.compile(self.re_file_name)
        match = pattern.match(file_name)
        if match is None:
          component_name = file_name
        else:
          component_name = match.groups()[0]
      
      return component_name
      
    def _upgrade_file(self, new_f_path):
      f = os.path.basename(new_f_path)
      
      component_name = self._get_keyword(f)      
       
      #logging.debug("Start to update " + component_name)
         
      """Find the old file in target directory"""
      old_f_path = None
      old_f_path_1 = self.target_dir + os.sep + f 
      if os.path.exists(old_f_path_1):
        old_f_path = old_f_path_1
      else:
        for f_target in os.listdir(self.target_dir):
          if ( component_name == self._get_keyword(f_target)):
            old_f_path = self.target_dir + os.sep + f_target
            break

      """Back up the old file"""  
      if old_f_path:
        #logging.debug("Back up " + old_f_path + " to " + self.backup_dir)
        shutil.copy2(old_f_path, self.backup_dir)
        try:
          os.remove(old_f_path)
        except Exception:
          self.fail_remove_file_list.append(old_f_path)        
        
      """Upgrade the new file"""
      #logging.debug("Upgrade " + f)                
      shutil.copy2(new_f_path, self.target_dir)
        
      return True
    
    def upgrade_zip_file(self):
      if not os.path.exists(self.build_path):
        logging.info("No need to upgrade")
        return None
      else:
        if (os.path.exists(self.backup_dir)):
          try:
            shutil.rmtree(self.backup_dir, True)
          except Exception, e:
            pass
      
        if not os.path.exists(self.backup_dir):
          os.makedirs(self.backup_dir)           
        
        unzip_dir = os.path.join(self.backup_dir, "updated")   
      
        """Zip the plugins to $backup_dir/updated"""
        if os.path.exists(unzip_dir):
          try:
            shutil.rmtree(unzip_dir, True)
          except Exception, e:
            pass
          
        bdl_zip_file = ZipCompat(self.build_path)
        logging.debug("Extract " + self.build_path + " to " + unzip_dir)
        bdl_zip_file.extractall(unzip_dir)
		
        file_install = FileInstall(unzip_dir, self.target_dir, self.backup_dir, self.re_file_name)
        try:
          result_list = file_install.upgrade_files(False)
          self.fail_remove_file_list = file_install.fail_remove_file_list
          return result_list
        finally:
          shutil.rmtree(unzip_dir, True)
          
        return None
    
