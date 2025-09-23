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
import subprocess
import os,shutil
import string
import math
import logging
import sys
import pdb
from zipfile import ZipFile, ZipInfo


def call_wsadmin(args):
  try:
    ws_log = open("wsadmin.log", "w")
    ws_process = subprocess.Popen(args, \
      stdout=ws_log, stderr=ws_log)
    ws_process.wait()
    ws_log.close()
    ws_log = open("wsadmin.log", "r")
    ws_out = ws_log.read()
    ws_log.close()
  
    if ws_out.find("Exception") > -1:  
      logging.error("Exception thrown while executing WebSphere command:" + ws_out)
      return (False, ws_out)
    logging.debug("Websphere admin execution result:" + ws_out)
    return (True, ws_out)
  except Exception, e:
    logging.error("Exception thrown while executing WebSphere.  Make sure WAS install root is set correctly.")
    sys.exit(-1)
  
def parse_ws_map(args):
  settings = {}
  for s in args:
    l_index = s.find('[')
    r_index = s.find(']')
    setting = s[l_index+1 : r_index].split(' ')  
    key = setting[0]
    value = setting[1]
    settings[key] = value
  return settings

def check_version(old_version, new_version):
  if old_version:
      old_version_array = old_version.split(".")
      old_length = len(old_version_array)          
      for i in range(0, old_length):
        old_version_array[i] = string.atoi(old_version_array[i])  	
  else:
      old_version_array = []
      old_length = 0
      
  new_length = 0
  if new_version:
      new_version_array = new_version.split(".")
      new_length = len(new_version_array)
      for i in range(0, new_length):
          new_version_array[i] = string.atoi(new_version_array[i])      
  
  if ((new_length > 4) or (new_length <3)):
      logging.error("The upgrade build number " + new_version + " is invalid, please check it.")
      return False
  
  min_length = old_length
  if (old_length > new_length):
      min_length = new_length

  for i in range (0, min_length):
      if (new_version_array[i] > old_version_array[i]):
        return True
      elif (new_version_array[i] < old_version_array[i]):
        return False
      
  # the build number are the same within the same length
  # compare the length of the old and new version
  if (old_length >= new_length):
      return False
  else:
      return True

def get_upgrade_type(version_value):
  version_len = len(version_value.split("."))
  if version_len == 3:
    return "build"
  elif version_len == 4:
    return "ifix"
  else:
    logging.error("The build number " + version_value + " is invalid, please check it.")
    return ""
 
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
        if (targetpath[-1:] in (os.path.sep, os.path.altsep)
            and len(os.path.splitdrive(targetpath)[1]) > 1):
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
    def __init__(self, build_path, target_dir, backup_dir):
      self.build_path = build_path
      self.target_dir = target_dir
      self.backup_dir = backup_dir
      self.updates = []
    
    def upgrade_files(self, clean_back_up=True):
      
      if clean_back_up and os.path.exists(self.backup_dir):
        shutil.rmtree(self.backup_dir, True)
      
      if not os.path.exists(self.backup_dir):
        os.makedirs(self.backup_dir)           


      if (os.path.isdir(self.build_path)):
        for f in os.listdir(self.build_path):
          new_f_path = self.build_path + os.sep + f
          if self._upgrade_file(new_f_path):       
            self.updates.append(self.target_dir + os.sep + f )
          else:
            return False
      else:
        if self._upgrade_file(self.build_path):
          f = os.path.basename(self.build_path)
          self.updates.append(self.target_dir + os.sep + f )
        else:
          return False
        
      return True
      
    def undo_upgrade_files(self):
      if not self.updates:
      	logging.info("nothing need to roll back")
      """ Read updateList, and remove the files in the updateList"""
      for f in self.updates:
        try:
          if os.path.isfile(f):
            logging.debug("remove " + f)
            os.remove(f)
        except Exception, e:
          logging.info("failed to remove " + f)            
              
      """copy the backup file back"""
      if not os.path.isdir(self.backup_dir):
        return False
        
      succ = True
      for f in os.listdir(self.backup_dir):
        f_path = self.backup_dir + os.sep + f
        try:
          if (os.path.isfile(f_path)):
            logging.debug("roll back " + f)
            shutil.copy2(f_path, self.target_dir)
        except Exception, e:
          logging.info("failed to roll back " + f)
          succ = False
          
      return succ
      
    def _upgrade_file(self, new_f_path):
    
      f = os.path.basename(new_f_path)
      
      """Split the file name, and get the component name"""
      ss = f.split("_")
      component_name = ""
      if (len(ss) == 1):
        component_name = f
      else:
        component_name = string.join(ss[:-1], "_")
       
      logging.debug("Start to update " + component_name)
      
      try:   
        """Find the old file in target directory"""
        old_f_path = None
        old_f_path_1 = self.target_dir + os.sep + f 
        if os.path.exists(old_f_path_1):
          old_f_path = old_f_path_1
        else:
          for f_target in os.listdir(self.target_dir):
            if (str.find(f_target, component_name) == 0):
              old_f_path = self.target_dir + os.sep + f_target
              break

        """Back up the old file"""  
        if old_f_path:
          logging.debug("Back up " + old_f_path + " to " + self.backup_dir)
          shutil.copy2(old_f_path, self.backup_dir)
          os.remove(old_f_path)
        
        """Upgrade the new file"""
        logging.debug("Upgrade " + f)                
        shutil.copy2(new_f_path, self.target_dir)
      except Exception, e:
        logging.info("Failed to upgrade " + f)
        logging.exception(e)
        return False
        
      return True
    
    def upgrade_zip_file(self):
      if not os.path.exists(self.build_path):
        log.info("No need to upgrade")
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
      
        file_install = FileInstall(unzip_dir, self.target_dir, self.backup_dir)
        try:
          succ = file_install.upgrade_files(False)
          self.updates = file_install.updates
          return succ
        finally:
          shutil.rmtree(unzip_dir, True)
          
        return None