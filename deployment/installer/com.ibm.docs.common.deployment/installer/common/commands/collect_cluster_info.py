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


import os, sys
import logging as log
from common import command, CFG, call_wsadmin, product_script_directory
from common.utils.docs_optparse import OPTIONS
try:
  import json
except ImportError:
  import simplejson as json

class CollectClusterInfo(command.Command):

  def __init__(self):
    pass

  def do(self):
    servers, clusters = CFG.prepare_scope()
    if servers:
      return True

    if OPTIONS.get('-retry', 'false').lower() == 'true':
      log.info("Reading failed hosts from retry_hosts.json...")
      retry_hosts_file = os.path.join(CFG.get_logs_dir(), 'retry_hosts.json')
      if not os.path.isfile(retry_hosts_file):
        log.info("Cannot find file %s..." % retry_hosts_file)
        return False
      retry_hosts = json.load(open(retry_hosts_file))
      CFG.cluster_info = dict((i[0], {'osType': i[1]}) for i in retry_hosts)
      os.remove(retry_hosts_file)
      log.info("Finish reading failed hosts from retry_hosts.json...")
      return True


    log.info("Start collecting cluster informations...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f", './common_jython/tasks/collect_cluster_info.py'])
    args.extend([clusters[0]])

    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False

    hosts = None
    for line in ws_out.split('\n'):
      if line.find('cluster_hosts =') > -1:
        hosts = eval(line.strip(' \r\n\t').replace('cluster_hosts =',''))
        break
    cluster_hosts = []

    for i in hosts:
      cluster_hosts.append( {'hostname':i[0], 'WC_defaulthost':i[1]} )

    data = {'cluster_hosts':cluster_hosts, 'cluster_name':clusters[0]}
    local_json_file_path = os.path.join(CFG.get_install_root(), '%s_sanity.json' % product_script_directory)
    local_json_file_file = open(local_json_file_path, 'w')
    json.dump( data, local_json_file_file, indent=2 )
    local_json_file_file.close()

    # check into cell config

    args = CFG.get_was_cmd_line()
    args.extend(["-f", './common_jython/tasks/check_in_config.py'])
    args.extend(['do', local_json_file_path])

    succ, ws_out = call_wsadmin(args)

    if os.path.isfile(local_json_file_path):
      os.remove(local_json_file_path)

    if not succ:
      return False

    # CFG.cluster_info = dict((i[0], dict()) for i in hosts)
    for i in hosts:
      CFG.cluster_info[i[0]] = {'osType': i[2]}

    log.info("Finish collecting cluster informations...")
    return True

  def undo(self):
    servers, clusters = CFG.prepare_scope()
    if servers:
      return True

    if OPTIONS.get('-retry', 'false').lower() == 'true':
      return True

    log.info("Start clearing cluster informations from HCL Docs config...")

    args = CFG.get_was_cmd_line()
    args.extend(["-f", './common_jython/tasks/check_in_config.py'])
    args.extend(['undo', '%s_sanity.json' % product_script_directory])

    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False
    log.info("Finish clearing cluster informations from HCL Docs config...")
    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    return True
