# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

"""Prepare installation folder
"""

import os, subprocess
import shutil
import logging
import sys

from common import command, CFG, ShowLicense, was_log, call_wsadmin, check_version, precheck_factory, was

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

  def verify_was_name(self):
    'Check WAS server,node,cluster name'
    logging.info('Verifying WAS server,node,cluster name in the configuration file...')
    args = CFG.get_was_cmd_line()

    args.extend(["-f",  "./conversion/tasks/" + "verify_was_name.py"])
      
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
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/" + "verify_ver.py"])
    args.extend([CFG.getVersionLeast()])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
      return False
      
    if ws_out.find("IBMConversion=CORRECT_VERSION") < 0:
      return False
    
    if ws_out.find("IBMConversion=NETWORK_DEPLOYMENT") > -1:
      CFG.setND(True)
    else:
      CFG.setND(False)

    logging.info("Successfully verify WebSphere SOAP connection and version, ND is " + str(CFG.isND()))
    
    return True
  
  def verify_version(self):
    logging.info('Verifying the versions of Docs/Conversion/Viewer are the same...')
    
    conversion_version = CFG.get_version_value()

    cell_name = CFG.get_cell_name()
    docs_version = None
    viewer_version = None
    was_dir = CFG.get_was_dir()

    if not cell_name is None:
      docs_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + CONCORD_JSON_NAME
      viewer_json_path = was_dir + "/config/cells/" + cell_name + "/" + CONFIG_JSON_SUB_DIR + "/" + VIEWER_JSON_NAME
      
      if os.path.exists(docs_json_path) and os.path.isfile(docs_json_path):
        docs_json_file = open(docs_json_path)
        try:
          docs_json = json.load(docs_json_file)
          if "build-info" in docs_json:
            docs_version = docs_json["build-info"]["build_version"]
        except Exception as e:
          logging.info('Get Docs version failed, ignore it.')
      
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
      if conversion_version != docs_version and \
         docs_version not in [None, '']:
        version_mismatch = True 

      if conversion_version != viewer_version and \
         viewer_version not in [None, '']:
        version_mismatch = True

      if version_mismatch:
        logging.error('Version not match. '\
        +'Uninstall the old version of Docs/Conversion/Viewer and then start the installation again,'\
        + 'or use upgrade script to upgrade the Docs directly.')
        return False
  
    return True   
    
  def do(self):
    logging.info("Start preparing conversion service installation")

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False 
    was.cache_was_info()  
    if CFG.is_im:
      CFG.setND(True)
    else:          
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    if not self.verify_was_name():
      return False
    
    if not self.verify_version():
      return False

    logging.info("Install root is " + CFG.get_install_root())
    #shutil.rmtree(CFG.get_install_root())
    try:
      os.makedirs(CFG.getProductFolder())
      os.makedirs(CFG.get_version_dir())
      os.makedirs(CFG.get_logs_dir())
      os.makedirs(CFG.getConfigFolder())
      os.makedirs(CFG.getDataFolder())
    except Exception as e:
      pass
    """ Disable precheck 46493
    #Pre-check story 37283, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','conversion','precheck_for_conversion.xml')
    prechecks =  precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
      if not precheck.do():
          return False
    """
    logging.info("End preparing conversion service installation")

    return True

  def undo(self):

    return True

  def do_upgrade(self):
    logging.info("Start preparing conversion service upgrade")

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False 
    
    new_version = "2.0.2"
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

    if not self.verify_was_name():
      return False
    
    #if not self.verify_version():
    #  return False

    logging.info("Install root is " + CFG.get_install_root())
    
    try:
      os.makedirs(CFG.get_temp_dir())
    except Exception as e:
      pass
      #FIXME doing nothing when exceptions???
      #raise Exception(e)
      
    """ Disable precheck 46493
    #Pre-check story 37283, by ZF:
    precheckCfg = os.path.join(CFG.get_build_dir(),'installer','conversion','precheck_for_conversion.xml')
    prechecks =  precheck_factory.load_checks(precheckCfg)
    for precheck in prechecks:
        if not precheck.do():
            return False
    """
    logging.info("End preparing conversion service upgrade")

    return True
    
  def undo_upgrade(self):

    return True
