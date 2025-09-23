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

from common import command, CFG, call_wsadmin, ShowLicense, check_version, precheck_factory, was

try:
  import json
except ImportError:
  import simplejson as json

CONFIG_JSON_SUB_DIR = "IBMDocs-config"
CONCORD_JSON_NAME = "concord-config.json"
VIEWER_JSON_NAME = "viewer-config.json"
CONVERSION_JSON_NAME = "conversion-config.json"

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

  def verify_was_name(self):
    'Check WAS server,node,cluster name'
    logging.info('Verifying WAS server,node,cluster name in the configuration file...')
    args = CFG.get_was_cmd_line()

    args.extend(["-f",  "./docs/tasks/" + "verify_was_name.py"])

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
    cfg_was_install_root = CFG.get_was_install_root()
    if not os.path.isdir(cfg_was_install_root):
      logging.error("\n\nCannot find WAS, please check value of was_install_root in cfg.properties, make sure it is the WAS install root!\n")
      return False
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./docs/tasks/" + "verify_ver.py"])
    args.extend([CFG.get_version_least()])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
        return False
      else:
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
        + "\nVerify whether your WebSphere has started, and the version is supported by system requirements. " \
        + "Go the deployment guide for detailed system requirements information." + "\n\n")
      return False

    if ws_out.find("IBMDocs=CORRECT_VERSION") < 0:
      #logging.error("Wrong HCL Docs version.")
      return False

    if ws_out.find("IBMDocs=NETWORK_DEPLOYMENT") > -1:
      CFG.setND(True)
    else:
      CFG.setND(False)

    logging.info("Successfully verify WebSphere SOAP connection and version, ND is " + str(CFG.isND()))

    return True

  def verify_db(self):

    #return True
    package_name = 'com.ibm.docs.deployment'
    logging.info('Verifying database driver location/host/port/username/password...')
    db_type = CFG.get_db_type()
    if db_type.lower() not in ["db2", "oracle"]:
      raise Exception("Database type must be DB2 or ORACLE for HCL Docs, please fix your cfg.properties")
    driver_location = CFG.get_db_driver()
    db_hostname = CFG.get_db_hostname()
    db_port = CFG.get_db_port()
    db_user = CFG.get_db_adminid()
    db_password = CFG.get_db_adminpw()
    db_name = CFG.get_db_name()

    was_root = CFG.local_was_install_root
    jvm_path = was_root+os.sep+'java'+os.sep+'jre'+os.sep+'bin'+os.sep+'java'
    args = [jvm_path]
    args.append('-classpath')
    args.append(driver_location+os.sep+'*'+os.pathsep+'.'+os.sep+'util'+os.sep+package_name+'.jar')

    #print "************" + str(args)
    if db_type.lower() == "db2":
      args.append('%s.%s' % (package_name, "TestDBConnection"))
    elif db_type.lower() == "oracle":
      args.append('%s.%s' % (package_name, "OracleDatasourceConnectoin"))

    args.extend([db_hostname,db_port,db_user,db_password,db_name])
    succ, out = call_wsadmin(args)

    #not check succ
    if db_type.lower() == "db2":
      result,output = out.split(':',1)
    elif db_type.lower() == "oracle":
      (output, result) = (out, out)

    if result.find('Successful') > -1:
      logging.info(output)
      return True
    else:
      #no output, because if exception throwed, call_wsadmin() function \
      #would print these error result, no need duplicate.
      return False

  def verify_version(self):
    logging.info('Verifying the versions of Docs/Conversion/Viewer are the same...')

    docs_version = CFG.get_version_value()

    cell_name = CFG.get_cell_name()
    conversion_version = None
    viewer_version = None
    was_dir = CFG.get_was_dir()

    if not cell_name is None:
      conversion_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + CONVERSION_JSON_NAME
      viewer_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + VIEWER_JSON_NAME

      if os.path.exists(conversion_json_path) and os.path.isfile(conversion_json_path):
        conversion_json_file = open(conversion_json_path)
        try:
          conversion_json = json.load(conversion_json_file)
          if "build-info" in conversion_json:
            conversion_version = conversion_json["build-info"]["build_version"]
        except Exception as e:
          logging.info('Get Conversion version failed, ignore it.')

      if os.path.exists(viewer_json_path) and os.path.isfile(viewer_json_path):
        viewer_json_file = open(viewer_json_path)
        try:
          viewer_json = json.load(viewer_json_file)
          if "build-info" in viewer_json:
            viewer_version = viewer_json["build-info"]["build_version"]
        except Exception as e:
          logging.info('Get Viewer version failed, ignore it.')

      logging.info('Docs/Conversion/Viewer version are : %s/%s/%s', docs_version, conversion_version, viewer_version)

      version_mismatch = False
      if docs_version !=  conversion_version and \
         conversion_version not in [None, '']:
        version_mismatch = True

      if docs_version != viewer_version and \
         viewer_version not in [None, '']:
        version_mismatch = True

      if version_mismatch:
        logging.error('Version not match. '\
        +'Uninstall the old version of Docs/Conversion/Viewer and then start the installation again,'\
        + 'or use upgrade script to upgrade the Docs directly.')
        return False

    return True

  # should not be installed into the dir which contains install package
  def verify_install_directory (self):
    if os.path.realpath(__file__).find( os.path.realpath(CFG.get_install_root() + "\installer\docs\prepare_install.py") ) > -1 :
      return False
    return True

  # check if it is installing node
  def is_node_install(self):
    cfg_path = CFG.get_cfg_path()
    if cfg_path.find('node') >= 0:
      return True
    return False

  def do(self):
    logging.info("Start preparing docs service installation")

    if not self.verify_json_pkg():
      logging.error("\n\nCan not find json or simplejson python package, "
        + "please install simplejson or upgrade python to 2.6 or higher, "
        + "then start the installation again.\n\n")
      return False

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check docs_install_root in cfg.properties, choose a different install directory.\n\n")
      return False
    was.cache_was_info()
    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
          + "\nVerify whether your WebSphere has started, and the version is supported by system requirements. " \
          + "Go the deployment guide for detailed system requirements information." + "\n\n")
        return False

    """ Disable database connection validation and move it to sanity check
    if not self.is_node_install() and not self.verify_db():
      logging.error('Failed to verify database connection, Please check the configuration')
      return False
    """
    if not self.verify_was_name():
      return False
    if not self.verify_version():
      return False

    logging.info("Install root is " + CFG.get_install_root())
    #shutil.rmtree(CFG.getInstallRoot())
    try:
      self.makedirs_safely(CFG.get_product_dir())
      self.makedirs_safely(CFG.get_version_dir())
      # log dir is created when installation started to write logs
      #os.makedirs(CFG.get_logs_dir())
      self.makedirs_safely(CFG.get_config_dir())
      self.makedirs_safely(CFG.get_lib_dir())
      self.makedirs_safely(CFG.get_lib_spi_concord())#spi concord
      self.makedirs_safely(CFG.get_lib_spi_adpaters())# spi adapters

      # TODO FIXME change to method call
      self.makedirs_safely(CFG.get_shared_data_dir())
      self.makedirs_safely(CFG.draft_dir)
      self.makedirs_safely(CFG.conversion_dir)
      self.makedirs_safely(CFG.cache_dir)
      self.makedirs_safely(CFG.filer_dir)
      self.makedirs_safely(CFG.job_home)
    except Exception as e:
      #pass
      #FIXME doing nothing when exceptions???
      raise Exception(e)
    """ Disable precheck 46493
    # Pre-check story 37282, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','docs','precheck_for_docs.xml')
    prechecks =  precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
        if not precheck.do():
            return False
    logging.info("End preparing docs service installation")
    """
    return True

  def makedirs_safely(self, dir_name):
    try:
      if os.path.exists(dir_name):
        logging.warn("Directory %s existed",  dir_name)
      else:
        os.makedirs(dir_name)
    except Exception as e:
      logging.error("Failed to create directory %s", dir_name)
      raise Exception(e)

  def undo(self):

    return True

  def do_upgrade(self):
    logging.info("Start preparing docs service upgrade")

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

    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check docs_install_root in cfg.properties, choose a different install directory.\n\n")
      return False

    if CFG.is_im:
      CFG.setND(True)
    else:
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
          + "\nVerify whether your WebSphere has started, and the version is supported by system requirements. " \
          + "Go the deployment guide for detailed system requirements information." + "\n\n")
        return False

    if not self.verify_was_name():
      return False

    #if not self.verify_version():
    #  return False

    try:
      os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    """ Disable precheck 46493
    #Pre-check story 37282, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','docs','precheck_for_docs.xml')
    prechecks =  precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
        if not precheck.do():
            return False
    """
    logging.info("Install root is " + CFG.get_install_root())

    logging.info("End preparing docs service upgrade")

    return True

  def undo_upgrade(self):

    return True
