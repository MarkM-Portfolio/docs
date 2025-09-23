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

from common import command, call_wsadmin, CFG


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
 
    if CFG.is_im:
      CFG.setND(True)
    else:   
      if not self.verify_was():
        logging.error("Cannot verify WebSphere SOAP connection and version\n" \
    + "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
    + "Go the deployment guide for detailed system requirements information.")
        return False

    logging.info("Docs Extension Install root is " + CFG.get_icext_jar_location())
    logging.info("Docs Deamon Install root is " + CFG.get_daemon_location())

    if not os.path.exists(CFG.get_temp_dir()):      
      os.makedirs(CFG.get_temp_dir())
    
    return True

  def undo(self):

    return True


