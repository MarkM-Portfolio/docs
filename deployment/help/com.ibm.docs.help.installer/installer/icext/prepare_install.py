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

import os
import shutil
import logging

from commands import command
from util.common import call_wsadmin
from icext.config import CONFIG as CFG
from show_license import ShowLicense


class PrepareInstall(command.Command):

  def __init__(self):
    #self.config = config.Config()
    pass

  def readCfg(self, cfg=None):
    return True

  def verify_was_name(self, app_name, scope_type, servers, clusters):
    logging.info('Verifying WAS server, node, cluster name that %s application located in' % app_name)
    
    args = CFG.get_was_cmd_line()

    args.extend(["-f",  "./icext/tasks/" + "verify_was_name.py"])
      
	    
    args.extend([scope_type]) # server or cluster
    
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
    args.extend(["-f",  "./icext/tasks/" + "verify_ver.py"])
    args.extend([CFG.get_version_least()])
    
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
   
    logging.info("Successfully verify WebSphere SOAP connection and version")
    return True
  
  def do(self):
    logging.info("Start preparing icext service installation")

    if not CFG.get_license_accept() and not ShowLicense().do():
      return False
    
    
    if not self.verify_was():
      logging.error("Cannot verify WebSphere SOAP connection and version\n" \
	+ "Verify whether your WebSphere has started, and the version is supported by system requirements. " \
	+ "Go the deployment guide for detailed system requirements information.")
      return False

    servers, clusters = CFG.prepare_scope()
    if not self.verify_was_name('Files', CFG.get_scope_type(), servers, clusters):
      return False

    servers, clusters = CFG.prepare_news_scope()
    if not self.verify_was_name('News', CFG.get_news_scope_type(), servers, clusters):
      return False
    
    logging.info("Install root is " + CFG.get_install_root())
    #shutil.rmtree(CFG.getInstallRoot())

    logging.info("End preparing icext service installation")

    return True

  def undo(self):

    return True


