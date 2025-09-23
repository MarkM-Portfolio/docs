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

"""
This command will stop the whole was server or cluster
"""
import os, sys, fileinput, subprocess
from common import command, call_wsadmin, CFG
import logging as log

class StartServerCluster(command.Command):

  def __init__(self):
    self.scope = CFG.get_scope_type()
    self.scope_name = CFG.get_scope_name()
    self.node_name = CFG.get_node_name()

  def readCfg(self, cfg=None):
    return True

  def do(self):
    servers, clusters = CFG.prepare_scope()
    if not self.start_servers('Files', self.scope, servers, clusters):
      return False

    for app in ['News', 'Common']:
      servers, clusters = CFG.prepare_app_scope(app.lower())
      if not self.start_servers(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
        return False

    return True

  def undo(self):
    if not CFG.get_restart_connections():
      log.info("The configuation property 'restart_connections' is set as False, so the stop actions for HCL Connections Files, News, and Common servers are skipped.")
      return True

    servers, clusters = CFG.prepare_scope()
    if not self.stop_servers('Files', self.scope, servers, clusters):
      return False

    for app in ['News', 'Common']:
      servers, clusters = CFG.prepare_app_scope(app.lower())
      if not self.stop_servers(app, CFG.get_app_scope_type(app.lower()), servers, clusters):
        return False

    return True

  def start_servers(self, app_name, scope_name, servers, clusters):
    log.info("Begin to start servers that %s application located in" % app_name)

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/" + __name__.split(".")[1]+ ".py"])
    args.extend([scope_name]) # server or cluster
    if clusters:
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])

    if not call_wsadmin(args):
      return False

    log.info("End to start servers that %s application located in" % app_name)

    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    return self.undo()

  def stop_servers(self, app_name, scope_name, servers, clusters):
    log.info("Begin to stop servers that %s application located in" % app_name)

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    args.extend([scope_name]) # server or cluster
    if clusters:
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])

    if not call_wsadmin(args):
      return False

    log.info("End to stop servers that %s application located in" % app_name)

    return True
