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

import os, sys, fileinput, subprocess, time
import logging

from common import call_wsadmin, CFG, TASK_DIRECTORY

JYTHON_NAME = "stop_server.py"
profile_root = None
listed_prof = []
if os.name == "nt":
  ext = ".bat"
else:
  ext = ".sh"

profile_cmd = '%s/bin/%s' + ext

def stop_nd():
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  TASK_DIRECTORY + JYTHON_NAME])
  args.extend([CFG.get_scope_type()]) # server or cluster
  servers, clusters = CFG.prepare_scope()
  if clusters:#dupliate argument to keep consisten with servers
    args.extend([clusters[0]]) 
    args.extend([clusters[0]])
  if servers:
    args.extend([servers[0]["servername"]])
    args.extend([servers[0]["nodename"]])
    
  succ, ws_out = call_wsadmin(args)
  if not succ:
    return False
  return True

def stop_base():
  args = []
  args.extend([get_stop_server_cmd()])
  args.extend([CFG.get_scope_name()])
  args.extend(["-username", CFG.get_was_adminid() ])
  args.extend(["-password", CFG.get_was_adminpw() ])
  
  ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  ws_process.wait()
  ws_out = ws_process.stdout.read().decode()
  ws_err = ws_process.stderr.read().decode()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to stop the server. " + \
    	"Detailed error info is "\
    	+ ws_out)
    return False
  
  logging.info("Wait 10 seconds for WAS related process to exit completed.")
  time.sleep(10)
    
  return True

def start_nd():
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  TASK_DIRECTORY + "undo_" + JYTHON_NAME])
  args.extend([CFG.get_scope_type()]) # server or cluster
  servers, clusters = CFG.prepare_scope()
  if clusters:#dupliate argument to keep consisten with servers
    args.extend([clusters[0]]) 
    args.extend([clusters[0]])
  if servers:
    args.extend([servers[0]["servername"]])
    args.extend([servers[0]["nodename"]])

  succ, ws_out = call_wsadmin(args)
  if not succ:
    return False

  return True

def start_base():
  args = []
  args.extend([get_start_server_cmd()])
  args.extend([CFG.get_scope_name()])
  args.extend(["-username", CFG.get_was_adminid() ])
  args.extend(["-password", CFG.get_was_adminpw() ])
    
  ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
    stdout=subprocess.PIPE, stderr=subprocess.PIPE)
  ws_process.wait()
  ws_out = ws_process.stdout.read().decode()
  ws_err = ws_process.stderr.read().decode()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to start the server. " + \
    	"Detailed error info is "\
    	+ ws_out)
    return False
    
  logging.info("Wait 10 seconds for WAS process to be in STARTED status.")
  time.sleep(10)
  return True

def start_node():
  profile_root = CFG.get_profile_root()
  if not profile_root:
    profile_root = get_the_only_profile_path()  
  if profile_root:
    args = []
    args.extend([ profile_cmd % (profile_root, 'startNode') ])
    args.extend(["-username", CFG.get_was_adminid() ])
    args.extend(["-password", CFG.get_was_adminpw() ])
    
    ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ws_process.wait()
    ws_out = ws_process.stdout.read().decode()
    ws_err = ws_process.stderr.read().decode()
   
    logging.debug(ws_out)
    if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
      logging.error("Failed to start the node. " + \
      	"Detailed error info is "\
      	+ ws_out)
      return False
    
    logging.info("Wait 10 seconds for WAS process to be in STARTED status.")
    time.sleep(10)
  else:
    logging.warning("Failed to find profile root")

  return True	

def stop_node():
  profile_root = CFG.get_profile_root()
  if not profile_root:
    profile_root = get_the_only_profile_path()  
  if profile_root:
    args = []
    args.extend([ profile_cmd % (profile_root, 'stopNode') ])
    args.extend(["-username", CFG.get_was_adminid() ])
    args.extend(["-password", CFG.get_was_adminpw() ])
    
    ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ws_process.wait()
    ws_out = ws_process.stdout.read().decode()
    ws_err = ws_process.stderr.read().decode()
    
    logging.debug(ws_out)
    if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
      logging.error("Failed to stop the node. " + \
    	  "Detailed error info is "\
    	  + ws_out)
      return False
    
    logging.info("Wait 10 seconds for WAS process to be in STOPPED status.")
    time.sleep(10)
  else:
    logging.warning("Failed to find profile root")
  
  return True	


def get_stop_server_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = CFG.get_was_dir() + os.sep + "bin" + os.sep + "stopServer.bat"
  else:
    cmd = CFG.get_was_dir() + os.sep + "bin" + os.sep + "stopServer.sh"
    
  return cmd

def get_start_server_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = CFG.get_was_dir() + os.sep + "bin" + os.sep + "startServer.bat"
  else:
    cmd = CFG.get_was_dir() + os.sep + "bin" + os.sep + "startServer.sh"
    
  return cmd
  
def get_stop_node_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = CFG.get_profile_root() + os.sep + "bin" + os.sep + "stopNode.bat"
  else:
    cmd = CFG.get_profile_root() + os.sep + "bin" + os.sep + "stopNode.sh"
    
  return cmd

def get_start_node_cmd():
  cmd = ""
  if os.name == "nt":
    cmd = CFG.get_profile_root() + os.sep + "bin" + os.sep + "startNode.bat"
  else:
    cmd = CFG.get_profile_root() + os.sep + "bin" + os.sep + "startNode.sh"
    
  return cmd

def osgi_cfg_init():
  cmd_name = ""
  if os.name == "nt":
    cmd_name = "osgiCfgInit.bat"
  else:
    cmd_name = "osgiCfgInit.sh"

  cmd_list = []
  cmd_list.append(CFG.get_was_dir() + os.sep + "bin" + os.sep + cmd_name)

  profs = list_profiles()  
  for p in profs:
    prof_path = get_profile_path_from_name(p)
    if prof_path:
      cmd_path = prof_path + os.sep + "bin" + os.sep + cmd_name
      if os.path.exists(cmd_path):
        cmd_list.append(cmd_path)

  for cmd in cmd_list:
    args = []
    args.extend([cmd])
    logging.info("Cleaning OSGi cache as " + cmd)
    ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ws_process.wait()

def get_profile_root():
  if profile_root:
    return profile_root
    
  node_name = CFG.getNodeName()
  if node_name:
  
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  TASK_DIRECTORY + "get_profile_root.py"])
    args.extend([CFG.getNodeName()])
      
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return None

    for line in ws_out.split('\n'):
      if line.find('profile root:') > -1:
        profile_root = line.strip(' \r\n\t').replace('profile root:','')
        break
        
  return profile_root
  
def list_profiles ():
  global listed_prof
  if listed_prof:
    return listed_prof

  listProfiles = [CFG.get_was_dir() + os.sep + "bin" + os.sep + 'manageprofiles' + ext,
    '-listProfiles']
  pcs = subprocess.Popen(listProfiles, stdout=subprocess.PIPE)
  pcs.wait()
  output = pcs.stdout.read().decode().strip()
  output = output.strip('][')
  if pcs.stdout:
    listed_prof = output.split(',')
  listed_prof = [ i.strip() for i in  listed_prof]
  return listed_prof

def get_profile_path_from_name (p):
  prof_path_cmd = [CFG.get_was_dir() + os.sep + "bin" + os.sep + 'manageprofiles' + ext,
    '-getPath', '-profileName', p]
  pcs = subprocess.Popen(prof_path_cmd, stdout=subprocess.PIPE)
  pcs.wait()
  if pcs.returncode != 0:
    return None
  prof_path_output_str = pcs.stdout.read().decode()
  return prof_path_output_str.strip()

def get_the_only_profile_path ():
  prefs = list_profiles()
  pref_count = len(prefs)
  if( pref_count != 1):
    logging.debug("%d profiles found." % pref_count)
    return None
  return get_profile_path_from_name(prefs[0])
  
def is_app_running (app_name):
  args = CFG.get_was_cmd_line()
  args.extend(['-f',  './common_jython/tasks/detect_app.py'])
  args.extend([app_name])
  succ, ws_out = call_wsadmin(args)
  if ws_out.find('detected application is runing') > -1:
    return True
  return False