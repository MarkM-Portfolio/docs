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
import subprocess
import sys, os, shutil,string
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from common import command, CFG, call_wsadmin, TASK_DIRECTORY, was, product_script_directory
import logging as log
import fileinput

try:
  import json
except ImportError:
  import simplejson as json

PLUG_CFG_ORG="org"
PLUG_CFG_PROXY="proxy"
PLUG_CFG_FILE="plugin-cfg.xml"
PLUG_KEY_KDB="plugin-key.kdb"
PLUG_KEY_STH="plugin-key.sth"
OSGI_DIR = "optionalLibraries"+ os.sep +"docs"
WAS_ROOT = CFG.local_was_install_root
PROXY_FILTER_JAR = "concord.proxy.filter"
FILTER_ASSET_NAME = "concord.proxy.filter.jar"
FILTER_ASSET_PATH = WAS_ROOT+ os.sep +"installedAssets"+ os.sep +FILTER_ASSET_NAME+ os.sep +"BASE"
FILTER_BLA_NAME = "HCL Docs Proxy Filter"

def parse_hosts_list (all_lines):
  hosts_list = [line.strip() for line in all_lines.split('\n')]
  s = hosts_list.index('start hosts list') + 1
  e = hosts_list.index('end hosts list')
  return hosts_list[s:e]

class InstallProxyFilter(command.Command):
  def __init__(self):
    self.proxy_bld_dir = CFG.get_build_dir()
    self.backup_dir = CFG.get_temp_dir() + os.sep + FILTER_ASSET_NAME
    if CFG.isDMZ():
      self.proxy_server_name = CFG.get_proxy_server_name()
      self.proxy_lib_dir = os.path.join(WAS_ROOT, OSGI_DIR)
      if not os.path.exists(self.proxy_lib_dir):
        os.makedirs(self.proxy_lib_dir)
    else:
      self.proxy_lib_dir = FILTER_ASSET_PATH

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
    #TODO
    return True

  def remove_bdl(self):
    if CFG.isDMZ():
      for bdl in os.listdir(self.proxy_lib_dir):
        if bdl.find(PROXY_FILTER_JAR) > -1:
          full_bdl = os.path.join(self.proxy_lib_dir, bdl)
          os.remove(full_bdl)
    else:
      #removeBLAToCluster
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./proxy/tasks/undo_create_proxy_bla.py"])
      args.extend([FILTER_BLA_NAME,  FILTER_ASSET_NAME])
      call_wsadmin(args)

  def install_bdl(self, bdl_zip):
    if CFG.isDMZ():
      shutil.copy(bdl_zip, self.proxy_lib_dir)
      log.info("Copy the jar file from %s to %s" %(bdl_zip, self.proxy_lib_dir))
    else:
      #addBLAToCluster
      scope_name = ""
      if CFG.get_scope_type().lower() == "server":
        scope_name = "node=" + CFG.get_proxy_node_name() + ",server=" + CFG.get_scope_name()
      else:
        scope_name = "cluster=" + CFG.get_scope_name()
      args = CFG.get_was_cmd_line()
      args.extend(["-f",  "./proxy/tasks/create_proxy_bla.py"])
      args.extend([bdl_zip, FILTER_BLA_NAME,  FILTER_ASSET_NAME, scope_name])
      call_wsadmin(args)
      log.info("Deploy the jar file from %s to scope: %s." %(bdl_zip, scope_name))

  def do(self):
    log.info("Installing HCL Docs Proxy Filter for proxy server")

    bdl_zip = ""
    for f in os.listdir(self.proxy_bld_dir):
      if f.find(PROXY_FILTER_JAR) > -1:
        bdl_zip = os.path.join(self.proxy_bld_dir, f)
        break
    if not bdl_zip:
      raise Exception("%sxxx not found from HCL Docs proxy filter build dir %s" %\
	(PROXY_FILTER_JAR, self.proxy_bld_dir))
    self.remove_bdl()
    self.install_bdl(bdl_zip)

    log.info("HCL Docs Proxy Filter for proxy server installed")
    return True

  def undo(self):
    log.info("Uninstalling HCL Docs Proxy Filter for proxy server...")

    self.remove_bdl()

    log.info("Remove the jar file from cluster %s." %(CFG.get_scope_name()))
    log.info("HCL Docs Proxy Filter for proxy server uninstalled")
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
    bdl_zip = ""
    for f in os.listdir(self.proxy_bld_dir):
      if f.find(PROXY_FILTER_JAR) > -1:
        bdl_zip = os.path.join(self.proxy_bld_dir, f)
        break
    if not bdl_zip:
      log.info("No need to upgrade HCL Docs proxy filter")
      return True
    else:
      log.info("Upgrading HCL Docs Proxy Filter for proxy server")
      #back up filter jar
      if os.path.exists(self.proxy_lib_dir):
        for bdl in os.listdir(self.proxy_lib_dir):
          if bdl.find(PROXY_FILTER_JAR) > -1:
            full_bdl = os.path.join(self.proxy_lib_dir, bdl)
            shutil.copy(full_bdl, self.backup_dir)
            break
      self.remove_bdl()
      self.install_bdl(bdl_zip)
      log.info("HCL Docs Proxy Filter for proxy server upgraded")
      return True

  def undo_upgrade(self):
    if not os.path.exists(self.backup_dir):
      log.info("No need to undo HCL Docs proxy filter upgrade")
      return True
    bdl_zip = ""
    for f in os.listdir(self.backup_dir):
      if f.find(PROXY_FILTER_JAR) > -1:
        bdl_zip = os.path.join(self.backup_dir, f)
        break
    if not bdl_zip:
      log.info("No need to undo HCL Docs proxy filter upgrade")
      return True
    else:
      log.info("Undoing HCL Docs Proxy Filter for proxy server upgrade")
      self.remove_bdl()
      self.install_bdl(bdl_zip)
      log.info("Undo HCL Docs Proxy Filter for proxy server upgrade completely")
      return True
