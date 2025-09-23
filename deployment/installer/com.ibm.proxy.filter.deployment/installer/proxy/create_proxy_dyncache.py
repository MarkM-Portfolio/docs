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

PROXY_NAME_DOCENTRY = 'ProxyDynaCache'
PROXY_JNDI_NAME_DOCENTRY = 'proxy/concord_id_cache'

class CreateProxyDynCache(command.Command):
  def __init__(self):
    #self.scope = CFG.get_scope_type()
    #self.scope_name = CFG.get_scope_name()
    self.target_scope = CFG.get_scope_full_name()


  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """

  def do(self):
    log.info("Start to create Proxy DynaCache for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([PROXY_NAME_DOCENTRY])
    args.extend([PROXY_JNDI_NAME_DOCENTRY])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create Proxy DynaCache for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to delete Proxy DyanCache for HCL Docs proxy server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./proxy/tasks/undo_" + __name__.split(".")[1]+ ".py"])
    #args.extend([self.scope])
    #args.extend([self.scope_name])
    args.extend([self.target_scope])
    args.extend([PROXY_NAME_DOCENTRY])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Delete Proxy DyanCAche for HCL Docs proxy server completed")
    return True
