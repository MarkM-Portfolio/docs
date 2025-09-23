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


import os, shutil
from common import command, CFG, call_wsadmin
import logging as log
import sys

WEB_CONTAINER_NAME = "com.ibm.ws.webcontainer.HTTPOnlyCookies"
WEB_CONTAINER_VALUE = "LtpaToken,LtpaToken2,JSESSIONID,WASReqURL"


class SetWCHttpOnlyCookie(command.Command):
  """This command will set HttpOnly cookie into WebContainer, to prevent local JS to hack cookies"""

  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()  	
    pass

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
       
    log.info("Set WebContainer Property for HttpOnly Cookie start")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([self.scope])
    args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([WEB_CONTAINER_NAME])
    args.extend([WEB_CONTAINER_VALUE])   
    #log.info(args)
    
    succ, ws_out = call_wsadmin(args)	         
    if not succ:
      return False
    log.info("Set WebContainer Property for HttpOnly Cookie complete")
    return True
    
  def undo(self):
    log.info("Unset WebContainer Property for HttpOnly Cookie start")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([self.scope])
    args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([WEB_CONTAINER_NAME])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False   
      
    log.info("Unset WebContainer Property for HttpOnly Cookie complete")
    return True



