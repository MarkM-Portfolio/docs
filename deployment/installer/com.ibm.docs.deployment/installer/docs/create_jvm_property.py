# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

import os, shutil
from common import command, CFG, call_wsadmin
import logging as log

SESSION_REUSE = {"name": "HttpSessionIdReuse", "value": "true"}
# WS_EXT_DIR will be deployed in Proxy server side
#WS_EXT_DIR = {"name": "ws.ext.dirs", "value":"${USER_INSTALL_ROOT}/optionalLibrays/docs"}

class CreateJVMProperty(command.Command):
  """ This class creates JVM property for WAS  server, and relevant HttpSessionIdReUse property"""
  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()
    #self.proxy_server_name = CFG.get_proxy_server_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create JVM property for HCL Docs  Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/" + __name__.split(".")[1]+ ".py"])

    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()

    #for server scope
    if servers:
      args.extend([servers[0]["nodename"]])
      args.extend([servers[0]["servername"]])

    if clusters:
      #dupliate argument to keep consisten with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])

    args.extend([SESSION_REUSE["name"], SESSION_REUSE["value"]])
    #args.extend([WS_EXT_DIR["name"], WS_EXT_DIR["value"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Create JVM property for HCL Docs  Server completed")
    return True

  def undo(self):
    log.info("Start to delete JVM property for HCL Docs  Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/undo_" + __name__.split(".")[1]+ ".py"])

    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()

    #for server scope
    if servers:
      args.extend([servers[0]["nodename"]])
      args.extend([servers[0]["servername"]])

    if clusters:
      #dupliate argument to keep consisten with servers
      args.extend([clusters[0]])
      args.extend([clusters[0]])

    args.extend([SESSION_REUSE["name"]])
    #args.extend([WS_EXT_DIR["name"]])
    #log.info(args)

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    log.info("Delete JVM property for HCL Docs  Server completed")
    return True
