# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-
import os, sys, fileinput, subprocess, time
import logging

from util.common import call_wsadmin
from viewer.config import CONFIG as CFG

JYTHON_NAME = "stop_server.py"

def stop_nd():
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/" + JYTHON_NAME])
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
  ws_out = ws_process.stdout.read()
  ws_err = ws_process.stderr.read()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to the server." + \
    	"Detailed error info is"\
    	+ ws_out)
    return False
  
  logging.info("Wait 10 seconds for WAS related process to exit completed.")
  time.sleep(10)
    
  return True

def start_nd():
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "./viewer/tasks/undo_" + JYTHON_NAME])
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
  ws_out = ws_process.stdout.read()
  ws_err = ws_process.stderr.read()
  if ws_out.find("Exception") > -1 or ws_err.find("Exception") > -1:  
    logging.error("Failed to start the server." + \
    	"Detailed error info is"\
    	+ ws_out)
    return False
    
  logging.info("Wait 10 seconds for WAS process to be in STARTED status.")
  time.sleep(10)
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

def osgi_cfg_init():
  cmd_name = ""
  if os.name == "nt":
    cmd_name = "osgiCfgInit.bat"
  else:
    cmd_name = "osgiCfgInit.sh"

  cmd_list = []
  cmd_list.append(CFG.get_was_dir() + os.sep + "bin" + os.sep + cmd_name)

  prof_dir = CFG.get_was_dir() + os.sep + "profiles"
  for f in os.listdir(prof_dir):
    f_path = prof_dir + os.sep + f
    cmd_path = f_path + os.sep + "bin" + os.sep + cmd_name
    if os.path.exists(cmd_path):
      cmd_list.append(cmd_path)

  for cmd in cmd_list:
    args = []
    args.extend([cmd])
    logging.info("Cleaning OSGi cache as " + cmd)
    ws_process = subprocess.Popen(args, stdin=subprocess.PIPE, \
      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    ws_process.wait()


  
