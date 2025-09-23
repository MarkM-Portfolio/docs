# -*- encoding: utf8 -*-
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

import os, sys, fileinput, shutil
import logging

from common import command, CFG, was_cmd_util, ZipCompat, FileInstall, was

PLUGIN_ZIP_PRE = "ConversionOSGI_"
OSGI_DIR = "plugins"
PLUGIN_NAME_PRE = "com.ibm.symphony.conversion."

class InstallOSGIBundle(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.plugin_dest = CFG.local_was_install_root + os.sep + OSGI_DIR
    self.build_dir = CFG.get_build_dir()

    for f in os.listdir(self.build_dir):
      if f.find(PLUGIN_ZIP_PRE) > -1:
        self.plugin_zip = self.build_dir + os.sep + f
        logging.debug("OSGI plugins located: " + self.plugin_zip)
        break

    self.backup_dir = CFG.get_temp_dir() + os.sep + OSGI_DIR
    self.update_list = None
    self.failed_list = []

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    return True

  def remove_plugin(self):
    logging.info("Cleaning plugins...")
    f_num = 0
    for f in os.listdir(self.plugin_dest):
      if f.find(PLUGIN_NAME_PRE) > -1:
        full_f = self.plugin_dest + os.sep + f
        try:
          os.remove(full_f)
          f_num += 1
        except Exception:
          self.failed_list.append(full_f)

    logging.info("%s plugins removed from %s" % ( str(f_num), self.plugin_dest))

    if f_num > 0:
	  was_cmd_util.osgi_cfg_init()

  def install_plugin(self):
    logging.info("Installing plugins...")
    if not os.path.exists(self.plugin_zip):
      raise Exception("%sxxx not found from folder %s" % (PLUGIIN_ZIP_PRE, self.build_dir))

    zip_file = ZipCompat(self.plugin_zip)
    zip_file.extractall(self.plugin_dest)

    f_num = 0
    for f in os.listdir(self.plugin_dest):
      if f.find(PLUGIN_NAME_PRE) > -1:
        f_num += 1
    logging.info("%s plugins installed to %s" % ( str(f_num), self.plugin_dest))

    was_cmd_util.osgi_cfg_init()

  def do(self):
    #self.remove_plugin()
    #self.install_plugin()
    return True

  def undo(self):
    #self.remove_plugin()
    return True

  def do_upgrade(self):
    logging.info("Start to upgrade plugins...")

    # 1. backup the old plugin files
    self.backup_old_bundles()

    # 2. delete the old plugin files
    self.remove_plugin()
    list_file_path = os.path.join(CFG.get_logs_dir(), 'OSGi_bundles_need_to_remove.log')
    if os.path.isfile(list_file_path):
      os.remove(list_file_path)
    if len(self.failed_list) > 0:
      list_file = open(list_file_path, 'w')
      list_file.write('\n'.join(self.failed_list))
      list_file.close()
      info = ('Some old OSGi bundles are not removed in Websphere plugin folder %s. '
              'This problem can occur if Deployment Manager or another server is active '
              'on this node when the upgrade is attempted. Ignoring this error '
              'will not affect other applications that are running on this node. '
              'However, it will cause a problem with HCL Docs. '
              'You must manually remove the older versions of the JAR files '
              '(for example, com.ibm.symphony.conversion.jarname_version.jar) after you stop all '
              'WebSphere Application Servers and the node agent. '
              'You can find the old OSGi bundles list in file %s.' % (self.plugin_dest, list_file_path) )
      CFG.set_error_info(info)

    # 3. osgiCfgInit.bat to clean cache
    was_cmd_util.osgi_cfg_init()

    logging.info("Finish to upgrade plugins")
    return True

  def backup_old_bundles(self):
    if os.path.exists(self.backup_dir):
      try:
        shutil.rmtree(self.backup_dir, True)
      except Exception as e:
        pass
    if not os.path.exists(self.backup_dir):
      os.makedirs(self.backup_dir)

    bld_num = 0
    for f in os.listdir(self.plugin_dest):
      if f.find(PLUGIN_NAME_PRE) > -1:
        full_f = self.plugin_dest + os.sep + f
        shutil.copy2(full_f, self.backup_dir)
        bld_num += 1

    logging.info("%s plugins backuped from %s" % ( str(bld_num), self.plugin_dest))

  def undo_upgrade(self):
    logging.info("Start to undo upgrade plugins...")

    for f in os.listdir(self.backup_dir):
      f_path = self.backup_dir + os.sep + f
      if (os.path.isfile(f_path)):
        logging.debug("roll back " + f)
        shutil.copy2(f_path, self.plugin_dest)

    was_cmd_util.osgi_cfg_init()
    logging.info("Finish to undo upgrade plugins")
    return True
