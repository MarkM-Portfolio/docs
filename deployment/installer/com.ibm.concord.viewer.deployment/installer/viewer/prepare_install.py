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
"""Prepare installation folder
"""

import os
import shutil
import logging

from commands import command
from util.common import call_wsadmin
from viewer.config import CONFIG as CFG
from .show_license import ShowLicense
from util.common import get_upgrade_type
from util.common import check_version

try:
  from viewer.config import IS_FIXPACK
except ImportError: 
  IS_FIXPACK = None

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
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True
    
  def verify_was_name(self):
    'Check WAS server,node,cluster name'
    logging.info('Verifying WAS server,node,cluster name in the configuration file...')
    args = CFG.get_was_cmd_line()
    
    args.extend(["-f",  "./viewer/tasks/" + "verify_was_name.py"])
      
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
              logging.error("WAS server,node name in the configuration file are invalid,please check them")
          else:
              logging.error("WAS cluster name in the configuration file are invalid,please check it")
          return False
   
  def verify_was(self):
    logging.info("Verifying WebSphere SOAP connection and version...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/" + "verify_ver.py"])
    args.extend([CFG.get_version_least()])
    succ, ws_out = call_wsadmin(args)
    #logging.info(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
      else:
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
        + "Verify whether your WebSphere has started, and the version is supported by system requirements.  Go to the deployment guide for detailed system requirements information.")
      return False
      
    if ws_out.find("Viewer=CORRECT_VERSION") < 0:
      logging.error("Cannot verify WebSphere SOAP connection and version\n" \
      + "Verify whether your WebSphere has started, and the version is supported by system requirements.  Go to the deployment guide for detailed system requirements information.")
      return False
    
    if ws_out.find("Viewer=NETWORK_DEPLOYMENT") > -1:
      CFG.setND(True)
    else:
      CFG.setND(False)

    logging.info("Successfully verify WebSphere SOAP connection and version, ND is " + str(CFG.isND()))
    
    return True

  def verify_version(self):
    logging.info('Verifying whether the versions of Docs/Conversion/Viewer are same...')
    
    viewer_version=CFG.get_version_value()
    
    cell_name = CFG.get_cell_name()
    docs_version = None
    conversion_version = None
    was_dir = CFG.get_was_dir()

    if not cell_name is None:
      docs_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + CONCORD_JSON_NAME
      conversion_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + CONVERSION_JSON_NAME
      
      if os.path.exists(docs_json_path) and os.path.isfile(docs_json_path):
        docs_json_file = open(docs_json_path)
        docs_json = json.load(docs_json_file)
        if "build-info" in docs_json:
          docs_version = docs_json["build-info"]["build_version"]
        
      if os.path.exists(conversion_json_path) and os.path.isfile(conversion_json_path):
        conversion_json_file = open(conversion_json_path)
        conversion_json = json.load(conversion_json_file)
        if "build-info" in conversion_json:
          conversion_version = conversion_json["build-info"]["build_version"]        

      logging.info('Docs/Conversion/Viewer version are : %s/%s/%s', docs_version, conversion_version, viewer_version)

      version_mismatch = False
      if conversion_version != viewer_version and \
         conversion_version not in [None, '']:
        version_mismatch = True 

      if docs_version != viewer_version and \
         docs_version not in [None, '']:
        version_mismatch = True

      if version_mismatch:
        logging.error('Version not match. '\
        +'Uninstall the old version of Docs/Conversion/Viewer and then start the installation again,'\
        + 'or use upgrade script to upgrade the Docs directly.')
        return False
  
    return True   
  

  def do(self):
    logging.info("Start preparing Viewer application installation")
    
    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check viewer_install_root in cfg.properties, choose a different install directory.\n\n")
      return False     
    if not self.verify_was():
#      logging.error("Cannot verify WebSphere SOAP connection and version." \
#	+ "  Verify whether your WebSphere has started, and the version is either 8.0.0.8 or 8.5.5.1." \
#	+ "  Also make sure the username and password you entered are correct.")
      return False
    
    if not self.verify_was_name():
      return False
    if not self.verify_version():
      return False
      
    logging.info("Install root is " + CFG.get_install_root())
    #shutil.rmtree(CFG.getInstallRoot())
    try:
      os.makedirs(CFG.get_product_dir())
      os.makedirs(CFG.get_version_dir())
      # log dir is created when installation started to write logs
      #os.makedirs(CFG.get_logs_dir())
      #os.makedirs(CFG.config_dir)
      os.makedirs(CFG.get_journal_dir())

      # TODO FIXME change to method call
      os.makedirs(CFG.get_shared_data_dir())
      os.makedirs(CFG.conversion_dir)
      os.makedirs(CFG.cache_dir)
      os.makedirs(CFG.filer_dir)
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)

    logging.info("End preparing Viewer application installation")

    return True

  def undo(self):

    return True

  # should not be installed into the dir which contains install package
  def verify_install_directory (self):
    if os.path.realpath(__file__).find( os.path.realpath(CFG.get_install_root() + "\installer\viewer\prepare_install.py") ) > -1 :
      return False
    return True

  def do_upgrade(self):
    logging.info("Start preparing Viewer application upgrade")

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    new_version = CFG.get_version_value()
    old_version = CFG.get_current_version_value()
    # check version
    if IS_FIXPACK:
      if new_version != old_version:
        logging.error("This fixpack build can be applied only to version %s." % new_version)
        return False

      old_version_info = CFG.get_installed_version_info()
      if not old_version_info:
        logging.error("Can not get the installed version.")
        return False   
  
      version_info = CFG.get_version_info()
      if not version_info:
        logging.error("Can not get the latest version.")
        return False   
        
      if version_info["build_timestamp"] <= old_version_info["build_timestamp"]:
        logging.error("This build is version %s.%s. It can not be used to upgrade the installed version %s.%s. "
                      "Please choose a newer build." %
                      ( new_version, version_info["build_timestamp"],
                        old_version, old_version_info["build_timestamp"]) )
        return False
    else:
      if not check_version(old_version, new_version):
        logging.error("This build with version number (" + new_version + ") cannot be used to upgrade the installed version (" + old_version + ").\n" \
    + "If you still want to install this build, you must uninstall the current version first.")
        return False

    logging.info("Upgrade from current version to " + new_version + ".")
      
    if not self.verify_install_directory():
      logging.error("\n\nInstall package found in " + CFG.get_install_root() + ", please check viewer_install_root in cfg.properties, choose a different install directory.\n\n")
      return False
      
    if not self.verify_was():
#      logging.error("Cannot verify WebSphere SOAP connection and version." \
#	+ "  Verify whether your WebSphere has started, and the version is either 8.0.0.8 or 8.5.5.1." \
#	+ "  Also make sure the username and password you entered are correct.")
      return False

    if not self.verify_was_name():
      return False
      
    try:
      os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)
      
    logging.info("Install root is " + CFG.get_install_root())
    
    logging.info("End preparing Viewer application upgrade")

    return True
    
  def undo_upgrade(self):

    return True
