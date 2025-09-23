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

"""Prepare installation folder
"""

import os
import shutil
import logging
import sys
import socket

from common import command, call_wsadmin, CFG, ShowLicense, check_version, precheck_factory, was_cmd_util
from sys import platform

class PrepareInstall(command.Command):

  def __init__(self):
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True

  def verify_json_pkg (self):
    logging.info('Verifying python json parser...')
    if platform == "win32":
      return True
    json_found = True
    simplejson_found = True
    try:
      import json
    except ImportError:
      json_found = False

    try:
      import simplejson
    except ImportError:
      simplejson_found = False

    return json_found or simplejson_found

  def verify_was_name(self, app_name, scope_type, servers, clusters):
    logging.info('Verifying WAS server, node, cluster name that %s application located in' % app_name)

    args = CFG.get_was_cmd_line()

    args.extend(["-f",  "./icext/tasks/" + "verify_was_name.py"])


    args.extend([scope_type]) # server or cluster

    #for server scope
    if servers:
      args.extend([servers[0]["nodename"]])
      args.extend([servers[0]["servername"]])

    if clusters:
      #dupliate argument to keep consisten with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])

    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False
    else:
      result_true = "verify_was_name_result:true"
      if ws_out.find(result_true) > -1 :
          logging.info("WAS server,node,cluster name are valid.")
          return True
      else :
          if servers :
              logging.error("Either WAS server or node name in the configuration file is invalid,please check them")
          else:
              logging.error("WAS cluster name in the configuration file is invalid,please check it")
          return False

  def verify_was(self):
    logging.info("Verifying WebSphere SOAP connection and version...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + "verify_ver.py"])
    args.extend([CFG.get_version_least()])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
        raise Exception('Install Failed')
      return False

    if ws_out.find("CorrectWASVersion") < 0:
      return False

    logging.info("Successfully verify WebSphere SOAP connection and version")
    return True

  def set_is_dmgr_node(self):
    logging.info("Start to check if the host is dmgr node...")
    hostname = socket.gethostname()
    is_dm_args = CFG.get_was_cmd_line()
    is_dm_args.extend(["-f",  "./icext/tasks/is_dmgr_on_host.py"])
    is_dm_args.extend([hostname])
    is_dm_succ, is_dm_ws_out = call_wsadmin(is_dm_args)
    if not is_dm_succ:
      return False
    if is_dm_ws_out.find("IsDMGR: True") >= 0:
      CFG.set_is_dmgr_on_host(True)
    else:
      CFG.set_is_dmgr_on_host(False)
    logging.info("The host has dmgr node? : %s" % CFG.get_is_dmgr_on_host())
    return True

  def do(self):
    logging.info("Start preparing icext service installation")

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False

    if not self.verify_json_pkg():
      logging.error("\n\nCan not find json or simplejson python package, "
        + "please install simplejson or upgrade python to 2.6 or higher, "
        + "then start the installation again.\n\n")
      return False

    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check ext_install_root in cfg.properties, choose a different install directory.\n\n")
      return False


    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    logging.info("Install root is " + CFG.get_install_root())
    servers, clusters = CFG.prepare_scope()
    if not self.verify_was_name('Files', CFG.get_scope_type(), servers, clusters):
      return False

    if not was_cmd_util.is_app_running('Files'):
      logging.error('HCL Connections Files is not running.\n\nPlease start HCL Connections Files and then try again.\n')
      raise Exception('Install Failed')

    app = 'News'
    servers, clusters = CFG.prepare_app_scope(app.lower())
    if not self.verify_was_name(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
      return False

    logging.info("Docs Extension is installed into " + CFG.get_icext_jar_location())
    logging.info("Docs Deamon Install root is " + CFG.get_daemon_location())
    #shutil.rmtree(CFG.getInstallRoot())
    try:
      if not os.path.exists(CFG.get_product_dir()):
        os.makedirs(CFG.get_product_dir())
      if not os.path.exists(CFG.get_version_dir()):
        os.makedirs(CFG.get_version_dir())
      if not os.path.exists(CFG.get_temp_dir()):
        os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    if not self.set_is_dmgr_node():
      return False
    """ Disable precheck 46493
    #Pre-check story 37282, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','icext','precheck_for_ext.xml')
    prechecks = precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
        if not precheck.do():
            return False
    """
    logging.info("End preparing icext service installation")
    return True

  def undo(self):
    return True

  def verify_install_directory (self):
    if os.path.realpath(__file__).find( os.path.realpath(CFG.get_install_root() + "\installer\icext\prepare_install.py") ) > -1 :
      return False
    return True

  def do_upgrade(self):
    logging.info("Start preparing icext service upgrade")

    if not self.verify_json_pkg():
      logging.error("\n\nCan not find json or simplejson python package, "
        + "please install simplejson or upgrade python to 2.6 or higher, "
        + "then start the installation again.\n\n")
      return False

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check ext_install_root in cfg.properties, choose a different install directory.\n\n")
      return False

    new_version = CFG.get_version_value()
    old_version = CFG.get_current_version_value()
    # check version
    if not check_version(old_version, new_version):
      logging.error("This build with version number " + new_version + " cannot be used to upgrade the installed version " + old_version + ".\n" \
	+ "If you still want to install this build, you must uninstall the current version first.")
      return False
    else:
      logging.info("Upgrade from current version to  " + new_version + ".")

    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    logging.info("Install root is " + CFG.get_install_root())

    servers, clusters = CFG.prepare_scope()
    if not self.verify_was_name('Files', CFG.get_scope_type(), servers, clusters):
      return False

    app = 'News'
    servers, clusters = CFG.prepare_app_scope(app.lower())
    if not self.verify_was_name(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
      return False

    logging.info("Docs Extension is installed " + CFG.get_icext_jar_location())
    logging.info("Docs Deamon Install root is " + CFG.get_daemon_location())

    try:
      if not os.path.exists(CFG.get_product_dir()):
        os.makedirs(CFG.get_product_dir())
      if not os.path.exists(CFG.get_version_dir()):
        os.makedirs(CFG.get_version_dir())
      if not os.path.exists(CFG.get_temp_dir()):
        os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    if not self.set_is_dmgr_node():
      return False
    """ Disable precheck 46493
    #Pre-check story 37282, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','icext','precheck_for_ext.xml')
    prechecks = precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
        if not precheck.do():
            return False
    """
    logging.info("End preparing icext service upgrade")
    return True

  def undo_upgrade(self):

    return True
