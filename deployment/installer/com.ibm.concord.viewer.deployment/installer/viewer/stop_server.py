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

import logging

from commands import command
from viewer.config import CONFIG as CFG
from viewer import was_cmd_util

class StopServer(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True
    
  def do(self):
    logging.info("Stopping the application server...")
    if CFG.isND():
      return was_cmd_util.stop_nd()
    else:
      baseStopped = was_cmd_util.stop_base()
      if baseStopped:
        was_cmd_util.osgi_cfg_init()
      return baseStopped

  def undo(self):
    logging.info("Starting the application server...")
    if CFG.isND():
      return was_cmd_util.start_nd()
    else:
      return was_cmd_util.start_base()

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()      