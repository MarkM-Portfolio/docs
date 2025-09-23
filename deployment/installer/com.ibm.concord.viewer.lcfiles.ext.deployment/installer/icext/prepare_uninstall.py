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

import os
import shutil
import logging

from commands import command
from util.common import call_wsadmin
from icext.config import CONFIG as CFG
from icext import config

class PrepareUninstall(command.Command):

  def __init__(self):
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True

  def verify_was(self):
    logging.info("Verifying WebSphere SOAP connection and version...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + "verify_ver.py"])
    args.extend([CFG.get_version_least()])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      if ws_out.find("authentication failure") > -1:
        logging.error("Authentication failed. Please make sure the WebSphere user and password are correct and then try again.\n\n")
      else:
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
        + "Verify whether your WebSphere has started, and the version is supported by system requirements.  Go to the deployment guide for detailed system requirements information.")
      return False

    logging.info("Successfully verify WebSphere SOAP connection and version")
    return True
  
  def do(self):
    if not self.verify_was():
#      logging.error("Cannot verify WebSphere SOAP connection and version." \
#	+ "  Verify whether your WebSphere has started, and the version is either 8.0.0.8 or 8.5.5.1." \
#	+ "  Also make sure the username and password you entered are correct.")
      return False

    logging.info("Start to get CONNECTIONS_PROVISION_PATH")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/get_ic_variable.py"])
    succ, ws_out = call_wsadmin(args)
    provision_path=None
    for line in ws_out.split('\n'):
      if line.find('CONNECTIONS_PROVISION_PATH:') > -1:
        provision_path=line.strip(' \r\n\t').replace('CONNECTIONS_PROVISION_PATH:','').strip(" ")
    if provision_path!=None:
      logging.info("Get CONNECTIONS_PROVISION_PATH : %s successfully."%provision_path)
      config.IC_PROVISION_PATH=provision_path
    else:
      raise Exception("Get CONNECTIONS_PROVISION_PATH error from WAS variable.")
      
    logging.info("Viewer Extension Install root is " + CFG.get_icext_jar_location())
    logging.info("Viewer Daemon Install root is " + CFG.get_daemon_location())

    return True

  def undo(self):

    return True


