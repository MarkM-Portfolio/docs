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

""" This module conatins InstallRTC4WebBundle and InstallSpellCheckBundle, both for OSGI bundles"""

import os, sys, fileinput, shutil, filecmp, random
from common import command, CFG, was_cmd_util, ZipCompat, FileInstall, call_wsadmin, was
import logging as log
import socket

Concord_Plugin_Name = "DocsApp_Plugins.zip"
OSGI_DIR = "plugins"
RTC4WEB_BLD_NAME_PRE = "httpqueue.channel.jar"
RTC4Web_Backup_dir = "DocsApp_Plugins"

RTC4Web_Plugin_Name = "DocsApp_Plugins.zip"
RTC4WEB_JAR = "httpqueue.channel"
RTC4WEB_ASSET_NAME = "httpqueue.channel.jar"
ASSET_IBM_DOCS="IBMDocs-Assets"
WAS_ASSETS="installedAssets"
#RTC4WEB_ASSET_PATH = CFG.get_was_dir()+ os.sep +"installedAssets"+ os.sep + ASSET_IBM_DOCS +os.sep +RTC4WEB_ASSET_NAME+ os.sep +"BASE"
#RTC4WEB_ASSET_PATH = CFG.get_was_dir()+ os.sep +"installedAssets"+ os.sep + ASSET_IBM_DOCS
RTC4WEB_BLA_NAME = "IBM Docs RTC4Web"
WAS_ROOT = CFG.local_was_install_root

class InstallRTC4WebBla(command.Command):
  def __init__(self):
    self.docs_bld_dir = WAS_ROOT
    self.osgi_dir = CFG.get_was_dir() + os.sep + OSGI_DIR
    self.backup_dir = CFG.get_temp_dir() + os.sep + RTC4WEB_ASSET_NAME

    #Get the user install path of node on USER_INSTALL_ROOT
    hostname = socket.gethostname()
    log.info("Start to get the USER_INSTALL_ROOT...")
    user_inst_args = CFG.get_was_cmd_line()
    user_inst_args.extend(["-f",  "./docs/tasks/get_user_inst_path_for_node.py"])
    #user_ins_args.extend(["USER_INSTALL_ROOT"])
    user_inst_args.extend([hostname])
    user_inst_succ, user_inst_ws_out = call_wsadmin(user_inst_args)
    if not user_inst_succ:
      raise Exception("Failed to get was profile for given host")

    user_inst_path_var = "UserInstPath"
    user_inst_path_var = "".join([user_inst_path_var,": "])
    user_inst_paths = self._parse_info(user_inst_path_var,user_inst_ws_out)

    if user_inst_paths[0] == "None":
      raise Exception("Failed to get was profile for given host")
    self.user_inst_root = user_inst_paths[0]
    log.info("Get USER_INSTALL_ROOT %s successfully" % self.user_inst_root)

    self.rtc4web_lib_dir = os.path.join(self.user_inst_root, WAS_ASSETS, ASSET_IBM_DOCS)

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
    #TODO
    return True

  def remove_bdl(self):
    bld_num=0
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(RTC4WEB_BLD_NAME_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        os.remove(full_bdl)
        bld_num += 1

    if bld_num == 0:
      #removeBLAFromCluster
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./docs/tasks/undo_create_rtc4web_bla.py"])
      args.extend([RTC4WEB_BLA_NAME,  RTC4WEB_ASSET_NAME])
      suc,ws_out = call_wsadmin(args)

  def install_bdl(self, bdl_zip):
    #addBLAToCluster
    scope_name = ""
    if CFG.get_scope_type().lower() == "server":
      scope_name = "node=" + CFG.get_node_name() + ",server=" + CFG.get_scope_name()
    else:
      scope_name = "cluster=" + CFG.get_scope_name()
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./docs/tasks/create_rtc4web_bla.py"])
    dest_asset_file = os.path.join(self.rtc4web_lib_dir,RTC4WEB_ASSET_NAME)
    dest_asset_file = dest_asset_file.replace("\\", "/")

    args.extend([bdl_zip, RTC4WEB_BLA_NAME,  RTC4WEB_ASSET_NAME, dest_asset_file, scope_name])
    suc,ws_out = call_wsadmin(args)
    if not suc:
      return False

    if ws_out.find("RTC4Web Bla created successfully") == -1:
      raise Exception("Failed to create %s Bla for IBM Docs" % (RTC4WEB_BLA_NAME))

    log.info("Deploy the jar file from %s to scope: %s." %(bdl_zip, scope_name))

    return True

  def do(self):
    log.info("Installing RTC4Web Bla for IBM Docs...")

    bdl_zip = ""
    for f in os.listdir(self.docs_bld_dir):
      if f.find(RTC4Web_Plugin_Name) > -1:
        bdl_zip = os.path.join(self.docs_bld_dir, f)
        break

    if not bdl_zip:
        raise Exception("%sxxx not found from IBM Docs build dir %s" %\
            (RTC4Web_Plugin_Name, self.docs_bld_dir))

    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(self.docs_bld_dir)

    for jar in os.listdir(self.docs_bld_dir):
      if jar.find(RTC4WEB_JAR) > -1:
        jar_bdl_zip = os.path.join(self.docs_bld_dir, jar)
        break

    if not jar_bdl_zip:
        raise Exception("%sxxx not found from IBM Docs build dir %s" %\
            (RTC4WEB_JAR, self.docs_bld_dir))

    self.remove_bdl()
    if self.install_bdl(jar_bdl_zip):
      log.info("RTC4Web Bla installed for IBM Docs.")
    else:
      raise Exception("Failed to install %s for IBM Docs..." %(RTC4WEB_ASSET_NAME))
    return True

  def undo(self):
    log.info("Un-installing RTC4Web Bla for IBM Docs...")

    self.remove_bdl()

    log.info("Remove the jar file from cluster %s." %(CFG.get_scope_name()))
    log.info("RTC4Web Bla un-installed successfully for IBM Docs...")
    return True

  def do_upgrade(self):
    # clean back up dir
    if (os.path.exists(self.backup_dir)):
      try:
        shutil.rmtree(self.backup_dir, True)
      except Exception as e:
        pass
    if not os.path.exists(self.backup_dir):
      os.makedirs(self.backup_dir)

    for f in os.listdir(self.docs_bld_dir):
      if f.find(RTC4Web_Plugin_Name) > -1:
        bdl_zip = os.path.join(self.docs_bld_dir, f)
        break

    if not bdl_zip:
        raise Exception("%sxxx not found from IBM Docs build dir %s" %\
            (RTC4Web_Plugin_Name, self.docs_bld_dir))

    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(self.docs_bld_dir)

    for jar in os.listdir(self.docs_bld_dir):
      if jar.find(RTC4WEB_JAR) > -1:
        jar_bdl_zip = os.path.join(self.docs_bld_dir, jar)
        break

    if not jar_bdl_zip:
        raise Exception("%sxxx not found from IBM Docs build dir %s" %\
            (RTC4WEB_JAR, self.docs_bld_dir))

    log.info("Upgrading RTC4Web Bla for IBM Docs...")
    #back up rtc4web jar
    if os.path.exists(self.rtc4web_lib_dir):
      for bdl in os.listdir(self.rtc4web_lib_dir):
        if bdl.find(RTC4WEB_JAR) > -1:
          full_bdl = os.path.join(self.rtc4web_lib_dir, bdl)
          shutil.copy(full_bdl, self.backup_dir)
          break
    self.remove_bdl()
    if self.install_bdl(jar_bdl_zip):
      log.info("RTC4Web Bla upgraded successfully for IBM Docs")
    else:
      raise Exception("Failed to upgrade %s for IBM Docs..." %(RTC4WEB_ASSET_NAME))
    return True

  def undo_upgrade(self):
    if not os.path.exists(self.backup_dir):
      log.info("No need to undo RTC4Web Bla upgrade for IBM Docs")
      return True
    bdl_zip = ""
    for f in os.listdir(self.backup_dir):
      if f.find(RTC4WEB_JAR) > -1:
        bdl_zip = os.path.join(self.backup_dir, f)
        break
    if not bdl_zip:
      log.info("No need to undo RTC4Web Bla for IBM Docs")
      return True
    else:
      log.info("Undoing RTC4Web Bla upgrade for IBM Docs")
      self.remove_bdl()
      if self.install_bdl(bdl_zip):
        log.info("Undo %s Bla upgrade for IBM Docs completely" %(RTC4WEB_ASSET_NAME))
      else:
        raise Exception("Failed to undo %s Bla upgrade for IBM Docs..." %(RTC4WEB_ASSET_NAME))
      return True
  def _parse_info(self,des,des_prt):
    des_list = []
    for line in des_prt.split('\n'):
      if line.find(des) > -1:
        #raise Exception("Didn't get the node name")
        index_start = line.find(des)
        index_end = index_start + len(des)
        des_name = line[index_end : len(line)]
        if des_name.find('\n') >= 0:
          des_name = des_name[0 : des_name.find('\n')]

        #log.info("Node name is: %s" % node_name)
        des_list.append(des_name)
      #endif line.find
    #endfor
    return des_list

class InstallRTC4WebBundle(command.Command):

  def __init__(self):
    self.docs_bld_dir = CFG.get_build_dir()
    self.osgi_dir = WAS_ROOT + os.sep + OSGI_DIR
    self.backup_dir = CFG.get_temp_dir() + os.sep + RTC4Web_Backup_dir
    self.unzip_dir = self.backup_dir + os.sep + "updated"
    self.updater = None
    self.update_list = None
    self.bak_list = []
    self.failed_list = []

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
    #TODO
    return True

  def get_install_file(self):
    bdl_zip = ""
    for f in os.listdir(self.docs_bld_dir):
      if f.find(Concord_Plugin_Name) > -1:
        bdl_zip = self.docs_bld_dir + "/" + f
        break
    return bdl_zip

  def remove_bdl(self):
    rc = True
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(RTC4WEB_BLD_NAME_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
        except:
          rc = False
          log.info("-->IM:WARNING:Failed to remove the old HTTP queue channel:%s" % full_bdl)
        break

    return rc

  def install_bdl(self):
    bdl_zip = self.get_install_file()
    if not bdl_zip:
      raise Exception("%sxxx not found from Docs build dir %s" %\
        (Concord_Plugin_Name, self.docs_bld_dir))

    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(self.osgi_dir)

  def do(self):
    if self.is_same_bdl_file():
      log.info("The HTTP queue channel plugin for WebSphere is the latest, so don't install it.")
      return True

    log.info("Installing HTTP queue channel plugin for WebSphere...")

    if self.remove_bdl():
      self.install_bdl()
      was_cmd_util.osgi_cfg_init()
      log.info("HTTP queue channel plugin for WebSphere installed")

    return True

  def undo(self):
    log.info("Uninstalling HTTP queue channel plugin for WebSphere...")
    self.remove_bdl()
    was_cmd_util.osgi_cfg_init()
    log.info("HTTP queue channel plugin for WebSphere uninstalled")
    return True

  def do_upgrade(self):
    if self.is_same_bdl_file():
      log.info("The HTTP queue channel plugin for WebSphere is the latest, so don't upgrade it.")
      return True

    log.info("Upgrading HTTP queue channel plugin for WebSphere...")

    rc = True
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(RTC4WEB_BLD_NAME_PRE) > -1:
        if not os.path.exists(self.backup_dir):
          os.makedirs(self.backup_dir)
        self.backup_old_bundles()
        rc = self.remove_bdl()
        break

    if rc:
      self.install_bdl()
      was_cmd_util.osgi_cfg_init()
      log.info("HTTP queue channel plugin for WebSphere upgraded.")

    return True

  def backup_old_bundles(self):
    bld_num=0
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(RTC4WEB_BLD_NAME_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        self.bak_list.append(full_bdl)
        bld_num += 1
        break
    log.info("%s plugins backuped from %s" % ( str(bld_num), self.osgi_dir))

  def undo_upgrade(self):
    log.info("Starting Rollback for HTTP queue channel plugins...")

    succ = True
    if len(self.bak_list) == 0:
      log.info("No need to rollback HTTP queue channel")
    else:
      for bdl in self.bak_list:
        shutil.copy2(bdl, self.osgi_dir)
      was_cmd_util.osgi_cfg_init()

    log.info("HTTP queue channel plugin for WebSphere rolled back")
    return True

  def is_same_bdl_file(self):
    old_file = self.osgi_dir + os.sep + RTC4WEB_BLD_NAME_PRE
    if os.path.isfile(old_file):
      bdl_zip = self.get_install_file()
      if bdl_zip:
        tmp_dir = CFG.get_temp_dir() + os.sep + str(random.randint(1, 100000))
        if not (os.path.exists(tmp_dir)):
          os.makedirs(tmp_dir)

        bdl_zip_file = ZipCompat(bdl_zip)
        bdl_zip_file.extractall(tmp_dir)
        new_file = tmp_dir + os.sep + RTC4WEB_BLD_NAME_PRE
        if os.path.isfile(new_file) and filecmp.cmp(old_file, new_file, 0):
          return True

    return False


SC_PLUGIN_FOLDER="spellcheck_plugins"
SC_PLUGIN_BACKUP_FOLDER = "spellcheck_plugins"
SC_JSON4J_PLUGIN_PRE="com.ibm.json4j_"
SC_LANGUAGEWARE_PLUGIN_PRE="com.ibm.langware."
SC_RCP_SC_PLUGIN_PRE="com.ibm.rcp.spellcheck."
SC_RCP_TA_PLUGIN_PRE="com.ibm.rcp.textanalyzer"
SC_EQUINOX_COMMON_PLUGIN_PRE="org.eclipse.equinox.common_3.4.0."
SC_SPELLCHECKER_HTTP_PRE="com.ibm.lconn.spellchecker.http"

class InstallSpellCheckBundle(command.Command):

  def __init__(self):
    self.plugin_bld_dir = CFG.get_build_dir() + os.sep + SC_PLUGIN_FOLDER
    self.osgi_dir = WAS_ROOT + "/" + OSGI_DIR
    self.backup_dir = CFG.get_temp_dir() + os.sep+ SC_PLUGIN_BACKUP_FOLDER
    self.updater = None
    self.update_list = None
    self.failed_list = []

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
    #TODO
    return True

  def remove_bdl(self):
    bld_num=0
    full_bld = ""
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_JSON4J_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)

    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_LANGUAGEWARE_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)

    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_RCP_SC_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)

    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_RCP_TA_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)

    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_EQUINOX_COMMON_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_SPELLCHECKER_HTTP_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        try:
          os.remove(full_bdl)
          bld_num += 1
        except Exception:
          self.failed_list.append(full_bld)

    log.info("%s plugins removed from %s" % ( str(bld_num), self.osgi_dir))
    if bld_num > 0:
      was_cmd_util.osgi_cfg_init()

  def install_bdl(self):
    plugin_num = 0
    for f in os.listdir(self.plugin_bld_dir):
      f_path = self.plugin_bld_dir + os.sep + f
      shutil.copy2(f_path, self.osgi_dir)
      plugin_num += 1

    log.info("%s plugins installed to %s" % ( str(plugin_num), self.osgi_dir))
    was_cmd_util.osgi_cfg_init()

  def do(self):
    #log.info("Installing Spellcheck service required plugins for WebSphere...")
    #self.remove_bdl()
    #self.install_bdl()

    #log.info("Spellcheck service required plugins for WebSphere installed")
    return True

  def undo(self):
    #log.info("Uninstalling Spellcheck service required plugins for WebSphere...")

    #self.remove_bdl()

    #log.info("Spellcheck service required plugins for WebSphere uninstalled")
    return True

  def do_upgrade(self):
    log.info("Upgrading Spellcheck service required plugins for WebSphere...")
    # 1. backup the old plugin files
    os.makedirs(self.backup_dir)
    self.backup_old_bundles()
    # 2. delete the old plugin files
    self.remove_bdl()
    if len(self.failed_list) > 0:
      list_file_path = os.path.join(CFG.get_logs_dir(), 'OSGi_bundles_need_to_remove_spellcheck.log')
      list_file = open(list_file_path, 'w')
      list_file.write('\n'.join(self.failed_list))
      list_file.close()
      info = ( 'Some old OSGi bundles were not removed in WebSphere plugin folder %s. '
                 'You must remove them manually before you start the IBM Docs Server. '
                 'Close all WebSphere processes before you delete these old OSGi bundles. '
                 'You can find the old OSGi bundles list in file %s ' % (self.osgi_dir, list_file_path) )
      CFG.set_error_info(info)
    # 3. osgiCfgInit.bat to clean cache
    was_cmd_util.osgi_cfg_init()
    log.info("Spellcheck service required plugins for WebSphere upgraded")
    return True

  def backup_old_bundles(self):
    bld_num=0
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_JSON4J_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_LANGUAGEWARE_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_RCP_SC_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_RCP_TA_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_EQUINOX_COMMON_PLUGIN_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1
    for bdl in os.listdir(self.osgi_dir):
      if bdl.find(SC_SPELLCHECKER_HTTP_PRE) > -1:
        full_bdl = self.osgi_dir + "/" + bdl
        shutil.copy2(full_bdl, self.backup_dir)
        bld_num += 1

    log.info("%s plugins backuped from %s" % ( str(bld_num), self.osgi_dir))

  def undo_upgrade(self):
    log.info("Spellcheck service required plugins for WebSphere roll back...")

    """copy the backup file back to plugins folder"""
    for f in os.listdir(self.backup_dir):
      f_path = self.backup_dir + os.sep + f
      if (os.path.isfile(f_path)):
        log.debug("roll back " + f)
        shutil.copy2(f_path,  self.osgi_dir)

    was_cmd_util.osgi_cfg_init()
    log.info("Spellcheck service required plugins for WebSphere rolled back")
    return True
