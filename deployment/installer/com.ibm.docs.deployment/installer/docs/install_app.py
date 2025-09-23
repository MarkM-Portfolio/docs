# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************
import subprocess
import sys
import os, shutil,string
import logging
from common import command, CFG, call_wsadmin, TASK_DIRECTORY, was, product_script_directory

try:
  import json
except ImportError:
  import simplejson as json

JYTHON_NAME = "install_ear.py"
JYTHON_UPGRADE_NAME = "upgrade_ear.py"
JYTHON_MAP2WEB = "map2webserver.py"
PLUG_CFG_ORG="org"
PLUG_CFG_NEW="new"
PLUG_CFG_MERGE="merge"
PLUG_CFG_FILE="plugin-cfg.xml"
REM_CFG_ORG="remote_org"
REM_CFG_MERGE="remote_merge"


def parse_hosts_list (all_lines):
  hosts_list = [line.strip() for line in all_lines.split('\n')]
  s = hosts_list.index('start hosts list') + 1
  e = hosts_list.index('end hosts list')
  return hosts_list[s:e]

class InstallEar(command.Command):

  def __init__(self):
    self.build_dir = CFG.get_build_dir()
    logging.debug("build dir: " + self.build_dir)
    self.updated = None

  def readCfg(self, cfg=None):
    self.app_name = cfg['app']
    self.ear_name = CFG.get_ear_name(self.app_name)
#    if self.check_ids_installable():
#      return True
    for f in os.listdir(self.build_dir):
      #logging.info("f: " + f + "; ear_name: " + self.ear_name)
      if f.find(self.ear_name) > -1:
        self.ear_path = self.build_dir + "/" + f
        logging.debug(self.app_name + " ear located: " + self.ear_path)
        break

    if "options" in cfg:
      self.options = cfg['options']
    else:
      self.options = None

    return True

  def do(self):
    if self.check_ids_installable():
      return True
    logging.info("Installing %s EAR application..." % (self.app_name))
    succ = self._install_app()

    if not succ:
      return False

    self.updated = "install"
    logging.info("Install %s EAR application completed" % (self.app_name))
    return True

  def undo(self):
    if self.check_ids_installable():
      return True
    logging.info("Uninstalling %s EAR application..." % (self.app_name))

    if self._check_app(self.app_name):
      succ, ws_out = self.call_task("undo_" +  JYTHON_NAME, [self.app_name])
      if not succ:
        return False
      logging.info("Uninstall %s EAR application completed" % (self.app_name))
    else:
      logging.info("%s EAR application doesn't exist, not need to uninstall." % (self.app_name))

    return True

  def do_upgrade(self):
    if self.check_ids_installable():
      return True
    logging.info("Upgrading %s EAR application..." % (self.app_name))

    if self._check_app(self.app_name):
      succ, ws_out = self.call_task(JYTHON_UPGRADE_NAME, [self.ear_path])
      self.updated = "upgrade"
      if not succ:
        return False
    else:
      logging.info("%s EAR application has not been installed, install it" % (self.app_name))
      self.updated = "install"
      succ = self._install_app()
      if not succ:
        return False

    logging.info("Upgrade %s EAR application completed" % (self.app_name))
    return True

  def undo_upgrade(self):
    if self.check_ids_installable():
      return True
    logging.info("Rollback %s EAR application..." % (self.app_name))
    if not self.updated:
      logging.info("No need to roll back %s EAR application" %(self.app_name))

    if self.updated == "install":
      #uninstall the ear
      succ, ws_out = self.call_task("undo_" +  JYTHON_NAME, [self.app_name])
    else:
      #find out the old ear file and update to the old ear file
      prod_dir = CFG.get_product_dir()
      old_ear_path = None
      for f in os.listdir(prod_dir):
        if f.find(self.ear_name) > -1:
          old_ear_path = prod_dir + "/" + f
          logging.debug("Old %s EAR located: %s" % (self.app_name, self.ear_path) )
          break

      if not old_ear_path:
        logging.info("Failed to find the old %s EAR, ignore" % (self.app_name))
      else:
        succ, ws_out = self.call_task("upgrade_ear.py", [old_ear_path])
        if not succ:
          return False

    logging.info("Rollback %s EAR application completed" % (self.app_name))
    return True

  def _install_app(self):
    logging.info("ear name: " + self.ear_name)
    logging.info("app name: " + self.app_name + "; build dir: " + self.build_dir + "; ear_name: " + self.ear_name + "; ear_path: " + self.ear_path)
    args = []
    args.extend([self.ear_path])
    args.extend([CFG.get_scope_type()]) # server or cluster

    servers, clusters = CFG.prepare_scope()
    if clusters:#dupliate argument to keep consisten with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])
    if self.options:
      args.extend(self.options)
    succ, ws_out = self.call_task(JYTHON_NAME, args)
    if not succ:
      return False

    return True

  def _check_app(self,appName):
    logging.info("Checking %s EAR application..." % (appName))
    args = []
    args.extend([appName])
    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()
    if clusters:
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])

    succ, ws_out = self.call_task("is_application_installed.py", args)
    if not succ:
      logging.info("The %s EAR application doesn't exist." % (appName))
      return False

    if ws_out.find("yes") != -1 :
      logging.info("The %s EAR application is existing..." % (appName))
      return True
    elif ws_out.find("uninstall") != -1 :
      logging.info("The %s EAR application is existing in other server,and it should be uninstalled firstly." % (appName))
      uninst_succ, uninst_ws_out = self.call_task("undo_" +  JYTHON_NAME, [appName])
      return False
    else:
      logging.info("The %s EAR application doesn't exist." % (appName))
      return False

  def check_ids_installable(self):
    if CFG.get_software_mode().lower()=="sc" and self.app_name==CFG.get_ids_app_name():
      return True
    else:
      return False

class Map2WebServer(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.build_dir = CFG.get_build_dir()

  def readCfg(self, cfg=None):
    self.app_name = cfg['app']
    #self.ear_name = CFG.get_ear_name(self.app_name)
    self.ear_name = cfg['ear_name']
    for f in os.listdir(self.build_dir):
      if f.find(self.ear_name) > -1:
        self.ear_path = self.build_dir + "/" + f
        logging.info(self.app_name + " ear located: " + self.ear_path)
        break
    return True

  def do(self):
    logging.info("Map %s EAR application to WebServer..." % (self.app_name))

    succ, ws_out = self.call_task(JYTHON_MAP2WEB, [self.ear_path, self.app_name])
    if not succ:
      logging.info("-->IM:WARNING:Failed to automatically configure WebServer for %s EAR application, please refer to the guide and configure it manually after installation..." % (self.app_name))
      return True
    logging.info("Map %s EAR application to WebServer completed" % (self.app_name))
    return True

  def undo(self):
    logging.info("NO UNDO required for Map EAR app to WebServer...")
    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    return self.undo()
