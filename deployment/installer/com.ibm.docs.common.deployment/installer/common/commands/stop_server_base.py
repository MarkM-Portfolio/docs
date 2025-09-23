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

from common import command, CFG, was_cmd_util

class StopServerBase(command.Command):
  
  def __init__(self):
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True
    
  def do(self):
    if CFG.isND():
      return True
    else:
      logging.info("Stopping the application server...")
      return was_cmd_util.stop_base()

  def undo(self):
    if CFG.isND():
      return True
    else:
      logging.info("Starting the application server...")
      return was_cmd_util.start_base()

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()