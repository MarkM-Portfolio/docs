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


import logging

from common import was_cmd_util, command, CFG

class StartServer(command.Command):
  
  def __init__(self):
    pass

  def readCfg(self, cfg=None):
    return True
    
  def do(self):
    logging.info("Starting the application server...")

    if CFG.isND():
      return was_cmd_util.start_nd()
    else:
      return was_cmd_util.start_base()

  def undo(self):
    logging.info("Stopping the application server...")
    if CFG.isND():
      return was_cmd_util.stop_nd()
    else:
      return was_cmd_util.stop_base()

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()