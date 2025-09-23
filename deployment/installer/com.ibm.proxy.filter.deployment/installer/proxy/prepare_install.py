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

from common import command, CFG, call_wsadmin, ShowLicense, check_version, was

class PrepareInstall(command.Command):

  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True

  def verify_json_pkg (self):
    logging.info('Verifying python json parser...')
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

  def verify_was(self):
    logging.info("Verifying proxy server connection and version...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./proxy/tasks/" + "verify_ver.py"])
    if CFG.get_scope_type().lower() == "server":
      args.extend(["server", CFG.get_version_least(), CFG.get_proxy_node_name()])
    else:
      args.extend(["cluster", CFG.get_version_least()])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
      return False

    if ws_out.find("IBMDocs=CORRECT_VERSION") < 0:
      return False

    if ws_out.find("IBMDocs=NETWORK_DEPLOYMENT") > -1:
      CFG.setND(True)
    else:
      CFG.setND(False)

    logging.info("Successfully verify proxy server connection and version, ND is " + str(CFG.isND()) + ", DMZ is " + str(CFG.isDMZ())+ ".")

    return True

  def verify_was_name(self):
    #'Check WAS server,node,cluster name'
    logging.info('Verifying WAS server, node, cluster name in the configuration file...')
    args = CFG.get_was_cmd_line()

    args.extend(["-f",  "./proxy/tasks/verify_was_name.py"])

    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()

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
        if servers:
          logging.info("WAS server and node name in the configuration file are valid.")
        else:
          logging.info("WAS cluster name in the configuration file is valid.")
        return True
      else:
        if servers:
          logging.error("WAS server or node name in the configuration file are invalid, please check them.")
        else:
          logging.error("WAS cluster name in the configuration file are invalid, please check it.")
        return False

  # should not be installed into the dir which contains install package
  def verify_install_directory (self):
    if os.path.realpath(__file__).find( os.path.realpath(CFG.get_install_root() + "\installer\proxy\prepare_install.py") ) > -1 :
      return False
    return True

  def do(self):
    logging.info("Start preparing proxy service installation")

    if not self.verify_json_pkg():
      logging.error("\n\nCan not find json or simplejson python package, "
        + "please install simplejson or upgrade python to 2.6 or higher, "
        + "then start the installation again.\n\n")
      return False

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    was.cache_was_info()
    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check proxy_install_root in cfg.properties, choose a different install directory.\n\n")
      return False

    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify proxy server connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    if not self.verify_was_name():
      return False

    logging.info("Install root is " + CFG.get_install_root())

    #shutil.rmtree(CFG.getInstallRoot())
    try:
      os.makedirs(CFG.get_product_dir())
      os.makedirs(CFG.get_version_dir())
      # log dir is created when installation started to write logs
      #os.makedirs(CFG.get_logs_dir())
      os.makedirs(CFG.get_config_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    logging.info("End preparing proxy service installation")

    return True

  def undo(self):

    return True

  def do_upgrade(self):
    logging.info("Start preparing proxy service upgrade")

    if not self.verify_json_pkg():
      logging.error("\n\nCan not find json or simplejson python package, "
        + "please install simplejson or upgrade python to 2.6 or higher, "
        + "then start the installation again.\n\n")
      return False
    was.cache_was_info()
    if not CFG.get_license_accept() and not ShowLicense().do():
      return False

    new_version = CFG.get_version_value()
    old_version = CFG.get_current_version_value()
    # check version
    if not check_version(old_version, new_version):
      logging.error("This build with version number " + new_version + " cannot be used to upgrade the installed version " + old_version + ".\n" \
	+ "If you still want to install this build, you must uninstall the current version first.")
      return False
    else:
      logging.info("Upgrade from current version to " + new_version + ".")

    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    try:
      os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    logging.info("Install root is " + CFG.get_install_root())
    logging.info("End preparing proxy service upgrade")

    return True

  def undo_upgrade(self):

    return True
