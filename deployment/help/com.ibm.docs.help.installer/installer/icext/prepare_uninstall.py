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


import os
import shutil
import logging

from commands import command
from util.common import call_wsadmin
from icext.config import CONFIG as CFG


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
      return False

    logging.info("Successfully verify WebSphere SOAP connection and version")
    return True
  
  def do(self):
    if not self.verify_was():
      logging.error("Cannot verify WebSphere SOAP connection and version\n" \
	+ "Please verify if your WebSphere started, and version at least " \
	+ CFG.get_version_least())
      return False

    logging.info("Install root is " + CFG.get_install_root())

    return True

  def undo(self):

    return True


