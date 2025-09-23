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

"""
This command will stop the conversion node
"""

import logging

from common import command, CFG, was_cmd_util

class StartNode(command.Command):
  
  def __init__(self):
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True
    
  def do(self):
    logging.info("Starting the node...")
    return was_cmd_util.start_node()

  def undo(self):
    logging.info("Stopping the node...")
    return was_cmd_util.stop_node()

  def do_upgrade(self):
    return self.do()
    
  def undo_upgrade(self):
    return self.undo()