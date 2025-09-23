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


import os, sys, fileinput, subprocess, shutil
import logging, tempfile, zipfile
import socket
try:
  import json
except ImportError: 
  import simplejson as json
from common import command, CFG, TASK_DIRECTORY, call_wsadmin, was, product_script_directory

def zipdir(src, zip_file_path):
  zf = zipfile.ZipFile(zip_file_path, "w")
  abs_src = os.path.realpath(src)
  for dirname, subdirs, files in os.walk(src):
    for filename in files:
      if CFG.get_component_name() != 'docs' or dirname.find("installer") >= 0 or filename == "DocsApp_Plugins.zip":      
        absname = os.path.realpath(os.path.join(dirname, filename))
        arcname = absname[len(abs_src) + 1:]
        zf.write(absname, arcname)
  zf.close()

# read the finish status json file in host's log directory
def check_finish_status ():
  logging.info("Checking remote installation jobs status ...")
  status_map = {0:'succeed', -1:'failed'}
  for host in CFG.cluster_info:
    if not os.path.isfile(CFG.finish_status_node_file_name % host):
      logging.info("Cannot get job status of node %s." % host)
      CFG.cluster_info[host]['finish_status'] = -1
      continue
    finish_status_file = open(CFG.finish_status_node_file_name % host)
    status_json = json.load(finish_status_file)
    status = status_json.get('status', -1)
    action = status_json.get('action', 'unknown')
    CFG.cluster_info[host]['finish_status'] = status
    logging.info("%s on node %s %s" % (action, host, status_map[status]))      
    finish_status_file.close()

def parse_hosts_list (all_lines):
    hosts_list = [line.strip() for line in all_lines.split('\n')]
    s = hosts_list.index('start hosts list') + 1
    e = hosts_list.index('end hosts list')
    return hosts_list[s:e]

def add_cluster_hosts_into_target_list():
  added = False
  if CFG.me_hostname not in CFG.cluster_info:
    added = True
    CFG.cluster_info[CFG.me_hostname] = dict()
    
  while(not was.verify_job_manager_hosts(CFG.cluster_info)):
    print('Some hosts are not added into job manager as targets, please enter information for them.')
    was.collect_hosts_info()
    print('\nVerifiying target hosts ...\n')

  if added:
    del CFG.cluster_info[CFG.me_hostname]
  
def install_a_version (install_type):
  install_type_prop = {
    'do': {'action':'installation'},
    'do_upgrade': {'action':'upgrade'}
    }
  add_cluster_hosts_into_target_list()
  logging.info("Preparing remote installers...")    
  tmp_dir = CFG.get_temp_dir() + '/' + CFG.timestamp
  logging.info("Temp dir is %s" % tmp_dir)
  if (os.path.exists(tmp_dir)):
    try:
      shutil.rmtree(tmp_dir, True)
    except Exception as e:
      logging.warn("Cannot remove the directory %s" % tmp_dir)
  os.makedirs(tmp_dir) 
  
  build_dir = os.path.realpath(CFG.get_build_dir()).replace('\\', '/')
  zipped_installer = os.path.join(tmp_dir, 'docs_remote_installer.zip')
  zipdir(build_dir, zipped_installer)

  keys = list(CFG.cluster_info.keys())
  os_type = CFG.cluster_info[keys[0]]['osType'] # assuming that all the nodes having the same os type
  if os_type == 'windows':
    shutil.copy("remote_starter.ps1", tmp_dir)
  else:
    shutil.copy("remote_starter.sh", tmp_dir)

  logging.info("Start remote %s jobs, timestamp %s..." % ( install_type_prop[install_type]['action'], CFG.timestamp))
  from_directory = tmp_dir.replace('\\', '/')
  args = CFG.get_was_cmd_line()
  args.extend(['-f',  './common_jython/tasks/start_remote_jobs.py', install_type, 
            was.escapes_for_was( list(CFG.cluster_info.keys()) ), 
            from_directory, 
            CFG.get_install_root(), 
            CFG.install_root_on_node,
            CFG.get_was_adminid(), 
            CFG.get_was_adminpw(),
            CFG.timestamp,
            CFG.get_component_name(),
            os_type,
            CFG.me_hostname
            ])
  succ, ws_out = call_wsadmin(args)
  if ws_out.find("jobmanager task complete successfully!") > -1:
    shutil.rmtree(tmp_dir)
    check_finish_status()
    return True
  else:
    msg = '\n'.join( was.parse_return_value(ws_out))
    logging.info('-->IM:ERROR:' + msg)

def get_all_hostnames():
  args = CFG.get_was_cmd_line()
  args.extend(["-f", './common_jython/tasks/get_all_node_hostnames.py'])
  succ, ws_out = call_wsadmin(args)
  if not succ:
    raise Exception('Failed to get nodes information.')
  hosts = None
  for line in ws_out.split('\n'):
    if line.find('host_names:') > -1:
      hosts = eval(line.strip(' \r\n\t').replace('host_names:',''))
      break
  return hosts

class RemoteJobManager(command.Command):
  def __init__(self):
    try:
      if CFG.me_hostname not in CFG.cluster_info:
        me_ip = socket.gethostbyname(CFG.me_hostname)
        hostname_list = get_all_hostnames()
        for hn in hostname_list:          
            if me_ip == socket.gethostbyname(hn):
              CFG.me_hostname = hn
              break
    except:
      pass

  def do(self):
    return install_a_version('do')


  def undo(self):
    servers, clusters = CFG.prepare_scope()
    if servers:
      return True
    logging.info("Start remote uninstallation jobs, timestamp %s..." % CFG.timestamp)
    args = CFG.get_was_cmd_line()
    args.extend(['-f',  './common_jython/tasks/start_remote_jobs.py', 'undo', 
                clusters[0],
                CFG.get_install_root(), 
                CFG.install_root_on_node,
                CFG.get_was_adminid(), 
                CFG.get_was_adminpw(),
                CFG.timestamp,
                CFG.get_component_name(),
                CFG.me_hostname])
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("jobmanager task complete successfully!") == -1:
      return False
    target_list = was.parse_hosts_list(ws_out)
    CFG.cluster_info=dict()
    for host in target_list:
      CFG.cluster_info[host]=dict()
    check_finish_status()
    return True

  def do_upgrade(self):
    logging.info('Start remote upgrade jobs...')
    return install_a_version('do_upgrade')

  def undo_upgrade(self):
    logging.info('Start remote undo upgrade jobs...')
    return True