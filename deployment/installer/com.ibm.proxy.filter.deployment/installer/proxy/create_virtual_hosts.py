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

class CreateVirtualHosts(command.Command):
  def __init__(self):
    self.scope = CFG.get_scope_type().lower()
    if self.scope == "server":
      self.node_name = CFG.get_proxy_node_name()
      self.server_name = CFG.get_proxy_server_name()
    else:
      self.cluster_name = CFG.get_scope_name()

    self.proxy_server_port_info = []

  def get_proxy_server_info(self):
    log.info("Geting proxy server and port info...")
    args = []
    command_file = "get_proxyservers.py"
    if self.scope == "server":
      args.extend([self.server_name, self.node_name])
      command_file = "get_proxyserver.py"
    else:
      args.extend([self.cluster_name])
    succ, ws_out = self.call_common_task(command_file, args)

    if not succ:
      return False

    proxy_hosts = None
    for line in ws_out.split('\n'):
      if line.find('proxy_server_port_info =') > -1:
        proxy_hosts = eval(line.strip(' \r\n\t').replace('proxy_server_port_info =',''))
        break

    for i in proxy_hosts:
      self.proxy_server_port_info.append( {'hostname':i[0],'PROXY_HTTP_ADDRESS':i[3], 'PROXY_HTTPS_ADDRESS':i[4]} )

    log.info("Successfully got proxy server and port info...")

    return True

  def do(self):
    if not self.get_proxy_server_info():
      return False
    log.info("Start to add virtual hosts for HCL Docs proxy server")

    for item in self.proxy_server_port_info:
      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  "./common_jython/tasks/create_virtual_hosts.py"])
      args.extend([item['hostname'], item['PROXY_HTTP_ADDRESS'], item['PROXY_HTTPS_ADDRESS']])

      succ, ws_out = call_wsadmin(args)
      if not succ:
        return False

    log.info("Add virtual hosts for HCL Docs proxy server completed")
    return True

  def undo(self):
    if not self.get_proxy_server_info():
      return False

    log.info("Start to remove virtual hosts added for HCL Docs proxy server")

    for item in self.proxy_server_port_info:
      args = CFG.get_was_cmd_line()
      # wasadmin command line arguments
      args.extend(["-f",  "./common_jython/tasks/undo_create_virtual_hosts.py"])
      args.extend([item['hostname'], item['PROXY_HTTP_ADDRESS'], item['PROXY_HTTPS_ADDRESS']])

      succ, ws_out = call_wsadmin(args)
      if not succ:
        return False

    log.info("Remove virtual hosts added for HCL Docs proxy server completed")
    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    #return self.undo()
    log.info("Start to undo upgrade virtual hosts for HCL Docs proxy server")

    log.info("Finish to undo upgrade virtual hosts for HCL Docs proxy server")
    return True
