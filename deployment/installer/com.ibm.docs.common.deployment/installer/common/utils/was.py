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

from common import CFG, call_wsadmin
import getpass
import sys
import os

osmap = { 'w': 'windows',
          'l': 'linux', 
          'windows': 'windows',
          'linux': 'linux' }

def verify_job_manager_hosts (cluster_info):
    to_be_verified = [ [  k, 
                          v.get('user', ''), 
                          v.get('passwd', ''), 
                          v.get('osType', ''), 
                          v.get('verified', 0) ] 
                       for k, v in cluster_info.items() 
                       if not v.get('verified', 0) ]
    if not to_be_verified:
      return 1
    args = CFG.get_was_cmd_line()
    args.extend( ['-f',  './common_jython/tasks/prepare_job_targets.py', escapes_for_was( to_be_verified )] )
    succ, ws_out = call_wsadmin(args)
    
    if ws_out.find("job target setting task complete successfully!") == -1:
      return 0

    for x in parse_hosts_list(ws_out):
      cluster_info[x]['verified'] = 1

    if( len([1 for k, v in cluster_info.items() if v.get('verified', 0)]) == 
        len(cluster_info)):
      return 1 # verified
    return 0

  
  
# collect nodes' hostname, admin name and password from cluster, add them into job manager target list
#Here the data structure of arg_hosts should be provided
#art_scope:"webserver","cluster" and "server"
def collect_hosts_info (scope=None):
  
  websrv_msg="\n\nPlease enter root/administrator user name, password and os type for jobmanager target WebServer host '%s'. " \
                     "If this host is already registered as a job manager target, press enter to skip.\n\n"
  cluster_srv_msg="\n\nPlease enter administrator user name, password and os type for jobmanager target application server host '%s'. " \
                     "If this host is already registered as a job manager target, press enter to skip.\n\n"
  info_center = {'cluster':{'msg':cluster_srv_msg,'hosts':CFG.cluster_info},'webserver':{'msg':websrv_msg,'hosts':CFG.webserver_info}}
  info_type = ['cluster','webserver']
  for arg_scope in info_type:
    if scope and scope != arg_scope:
      continue
      
    hosts_info = info_center[arg_scope]['hosts']
    for h in hosts_info:
      if arg_scope=="cluster":
        servers, clusters = CFG.prepare_scope()
        if servers:
          return []
  
      if hosts_info[h].get('verified', 0):
        continue
      
      #sys.stdout.write("\n\nPlease enter administrator user name, password and os type for jobmanager target host '%s'."
      #                 "If this host is already registered as a job manager target, press enter to skip.\n\n" % (h))
      sys.stdout.write( info_center[arg_scope]['msg'] % (h))
      sys.stdout.write("User:")
    
      # collect administrator name and password
      user = sys.stdin.readline().strip()
      if not user:
        if arg_scope=="cluster":
          CFG.cluster_info[h]['verified'] = 1
        elif arg_scope=="webserver":
          CFG.webserver_info[h]['verified'] = 1
        continue
      passwd = getpass.getpass("Password:")

      # collect os type.
      while True:      
        sys.stdout.write("OS type((w)indows, (l)inux):")
        osType = sys.stdin.readline().strip()
        if osType not in osmap:
          print('Unknow os type "%s", please try again.' % osType)
          continue      
        osType = osmap[osType]
        break
      if arg_scope=="cluster":
        #CFG.cluster_info[h] = {'user': user, 'passwd':passwd, 'osType':osType, 'verified':0}
        CFG.cluster_info[h]['user'] = user
        CFG.cluster_info[h]['passwd'] = passwd
        CFG.cluster_info[h]['osType'] = osType
        CFG.cluster_info[h]['verified'] = 0        
      elif arg_scope=="webserver":
        #CFG.webserver_info[h] = {'user': user, 'passwd':passwd, 'osType':osType, 'verified':0}
        CFG.webserver_info[h]['user'] = user
        CFG.webserver_info[h]['passwd'] = passwd
        CFG.webserver_info[h]['osType'] = osType
        CFG.webserver_info[h]['verified'] = 0
  
  return

def escapes_for_was (input):
  input = str(input)
  input = input.replace("'", r"\'")
  input = input.replace('"', r'\"')  
  return input
  
def parse_hosts_list (all_lines):
    hosts_list = [line.strip() for line in all_lines.split('\n')]
    s = hosts_list.index('start hosts list') + 1
    e = hosts_list.index('end hosts list')
    return hosts_list[s:e]


def parse_return_value (all_lines_string):
  lines = [line.strip() for line in all_lines_string.split('\n')]
  s = lines.index('return value start') + 1
  e = lines.index('return value end')
  return lines[s:e]

def get_local_was_install_root():
  args = CFG.get_was_cmd_line()
  args.extend(["-f", './common_jython/tasks/get_local_was_install_root.py'])
  succ, ws_out = call_wsadmin(args)
  if not succ:
    raise Exception('Failed to get was install root.')
  values = parse_return_value(ws_out)
  if len(values) == 1 and values[0] != 'None':
    return values[0]
  return None

def check_wasadmin_script():
  script_path = CFG.get_wsadmin_script()
  if not os.path.isfile(script_path):
    raise Exception( ("The script %s cannot be found on this computer. "
                      "Check the value of the property was_install_root or was_proxy_profile_root in the "
                      "cfg.properties/cfg.node.properties file!") % script_path)
def cache_was_info():
  check_wasadmin_script()
  setattr(CFG, 'local_was_install_root', get_local_was_install_root())

   