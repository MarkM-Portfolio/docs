# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

# -*- encoding: utf8 -*-
import subprocess
import os, shutil
import string
import logging
import sys
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
  except IOError as e:
    logging.error("IOException thrown when accessing file 'wasadmin.log', " + e.strerror)
    sys.exit(-1)
  except Exception as e:
    logging.error("Exception thrown while executing WebSphere.  Make sure Dmgr install root is set correctly.")
    sys.exit(-1)

def __get_VRM(version_info):
    VRM = {}
    length = 0
    if version_info:
        version_array = version_info.split(".")
        new_length = len(version_array)

        #if ((new_length > 4) or (new_length <3)):
        #    logging.error("The upgrade build number " + new_version + " is invalid, please check it.")
        #    return False

        for i in range(0, new_length):
            if i == 0:
                VRM['v'] = int(version_array[i])
            elif i == 1:
                VRM['r'] = int(version_array[i])
            elif i == 2:
                VRM['m'] = int(version_array[i])
            else:
                VRM[str(i)] = int(version_array[i])
    return VRM

def check_version(old_version, new_version):
    new_VRM = __get_VRM(new_version)
    if len(new_VRM) > 4 or len(new_VRM) < 3:
        logging.error("The upgrade build number " + new_version + " is invalid, please check it.")
        return False
      #for i in range(0, new_length):
      #   new_version_array[i] = int(new_version_array[i])

    old_VRM = __get_VRM(old_version)
    if len(old_VRM) > 4 or len(old_VRM) < 3:
        logging.error("The installed build number " + old_version + " is invalid, please check it.")
        return False

    # if completely match
    if new_VRM == old_VRM:
        return False

    if new_version=='2.0.0':
        if old_VRM['v']==1 and old_VRM['r']==0 and (old_VRM['m']==6 or old_VRM['m']==7):
            return True
        return False

    if new_version=='2.0.2':
        if old_VRM['v']==2 and old_VRM['r']==0 and old_VRM['m']==1:
            return True

    v_diff = new_VRM['v'] - old_VRM['v']
    r_diff = new_VRM['r'] - old_VRM['r']
    m_diff = new_VRM['m'] - old_VRM['m']
    if v_diff > 0:
        return True
    elif v_diff < 0:
        return False
    elif r_diff > 0:
        return True
    elif r_diff < 0:
        return False
    elif m_diff > 0 and m_diff > 2:
        return False
    elif m_diff < 0:
        return False
    elif m_diff > 0 and m_diff <=2:
        return True
    else:
        # VRM all match, see if it's ifix
        if len(new_VRM) == 4 and len(old_VRM) == 3:
            return True

    return False

def get_upgrade_type(version_value):
  version_len = len(version_value.split("."))
  if version_len == 3:
    return "build"
  elif version_len == 4:
    return "ifix"
  else:
    logging.error("The build number " + version_value + " is invalid, please check it.")
    return ""

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
        target =open(targetpath, "wb")
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

      # upgrade from 103 to 104, daemon lib location is changed
      # target dir does not exist, and need to make it
      if not os.path.exists(self.target_dir):
        os.makedirs(self.target_dir)

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
        except Exception as e:
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
        except Exception as e:
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
        component_name = "_".join(ss[:-1])

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
          try:
            os.remove(old_f_path)
          except:
            logging.info("Unable to remove old plugin file.")  

        """Upgrade the new file"""
        logging.debug("Upgrade " + f)
        shutil.copy2(new_f_path, self.target_dir)
      except Exception as e:
        logging.info("Failed to upgrade " + f)
        logging.exception(e)
        return False

      return True

    def upgrade_zip_file(self):
      if not os.path.exists(self.build_path):
        logging.info("No need to upgrade")
        return None
      else:
        if (os.path.exists(self.backup_dir)):
          try:
            shutil.rmtree(self.backup_dir, True)
          except Exception as e:
            pass

        if not os.path.exists(self.backup_dir):
          os.makedirs(self.backup_dir)

        unzip_dir = os.path.join(self.backup_dir, "updated")

        """Zip the plugins to $backup_dir/updated"""
        if os.path.exists(unzip_dir):
          try:
            shutil.rmtree(unzip_dir, True)
          except Exception as e:
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
