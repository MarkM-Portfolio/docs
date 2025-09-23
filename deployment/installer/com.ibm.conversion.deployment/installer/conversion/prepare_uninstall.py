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

from common import command, CFG, call_wsadmin, was

class PrepareUninstall(command.Command):

  def __init__(self):
    was.cache_was_info()

  def readCfg(self, cfg=None):
    return True

  def verify_was(self):
    logging.info("Verifying WebSphere SOAP connection and version...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./conversion/tasks/" + "verify_ver.py"])
    args.extend([CFG.getVersionLeast()])
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    if ws_out.find("IBMConversion=CORRECT_VERSION") < 0:
      return False
    
    if ws_out.find("IBMConversion=NETWORK_DEPLOYMENT") > -1:
      CFG.setND(True)
    else:
      CFG.setND(False)

    logging.info("Successfully verify WebSphere SOAP connection and version, ND is " + str(CFG.isND()))
    
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

    logging.info("Install root is " + CFG.get_install_root())

    return True

  def undo(self):

    return True


