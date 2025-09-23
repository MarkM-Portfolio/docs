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
import subprocess
import sys, platform
import os, shutil,string
import logging
from common import command, CFG, call_wsadmin, TASK_DIRECTORY, was, product_script_directory

try:
  import json
except ImportError: 
  import simplejson as json

JYTHON_NAME = "install_ear.py"
JYTHON_UPGRADE_NAME = "upgrade_ear.py"
JYTHON_MAP2WEB = "map2webserver.py"
CVT_IDS_OLD_NAME = "IBMDocsSanity"
CVT_EAR_PRE = "com.ibm.symphony.conversion.service.rest.was.ear"
CVT_SANITY_EAR_PRE = "com.ibm.docs.sanity.ear"

PLUG_CFG_ORG="org"
PLUG_CFG_NEW="new"
PLUG_CFG_MERGE="merge"
PLUG_CFG_FILE="plugin-cfg.xml"
REM_CFG_ORG="remote_org"
REM_CFG_MERGE="remote_merge"

def parse_hosts_list (all_lines):
  hosts_list = [line.strip() for line in all_lines.split('\n')]
  s = hosts_list.index('start hosts list') + 1
  e = hosts_list.index('end hosts list')
  return hosts_list[s:e]

class InstallEar(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.build_dir = CFG.get_build_dir()
    self.updated = None    
    
  def readCfg(self, cfg=None):
    self.app_name = cfg['app']
    self.ear_name = CFG.get_ear_name(self.app_name)
    
    for f in os.listdir(self.build_dir):
      if f.find(self.ear_name) > -1:
        self.ear_path = os.path.join( self.build_dir, f ).replace('\\', '/')
        logging.debug(self.app_name+" conversion ear located: " + self.ear_path)
        break
    
    if "options" in cfg:
      self.options = cfg["options"]
    else:
      self.options = None
    
    return True

  def do(self):
    #if self.check_ids_installable():
    #  return True
    logging.info("Installing %s EAR application..." % (self.app_name))
    
    if self.app_name == CFG.get_ids_app_name() and self._check_app(CVT_IDS_OLD_NAME):
      self.undo(CVT_IDS_OLD_NAME)
          
    succ = self._install_app()
    if not succ:
      return False
    
    self.updated = "install"
    logging.info("Install %s EAR application completed" % (self.app_name))
    return True

  def undo(self,appName=None):
    #if self.check_ids_installable():
    #  return True
    if appName is not None:
      logging.info("Uninstalling %s EAR application..." % (appName))
    else:
      logging.info("Uninstalling %s EAR application..." % (self.app_name))
        
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./conversion/tasks/undo_" + JYTHON_NAME])
    #args.extend([CFG.get_app_name()])    
    if appName is not None:
      args.extend([appName])
    else:
      args.extend([self.app_name])
    
    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    if appName is not None:
      logging.info("Uninstall %s EAR application completed" % (appName))
    else:
      logging.info("Uninstall %s EAR application completed" % (self.app_name))
    return True

  def do_upgrade(self):
    #if self.check_ids_installable():
    #  return True
    logging.info("Upgrade %s EAR application..." % (self.app_name))
    
    if self.app_name == CFG.get_ids_app_name() and self._check_app(CVT_IDS_OLD_NAME):
      self.undo(CVT_IDS_OLD_NAME)
    
    if self._check_app(self.app_name):    
      succ, ws_out = self.call_task(JYTHON_UPGRADE_NAME, [self.ear_path])    
      self.updated = "upgrade"
      if not succ:
        return False 
    else:
      logging.info("%s EAR application has not been installed, install it" % (self.app_name))
      self.updated = "install"
      succ0 = self._install_app()
      if not succ0:
        return False     
    
    logging.info("Upgrade %s EAR application complete" % (self.app_name))
    return True
  
  def undo_upgrade(self):    
    #if self.check_ids_installable():
    #  return True
    logging.info("Undo upgrade %s EAR application..." % (self.app_name))
    
    if self.updated is None:
      logging.info("No need to undo upgrade %s EAR application..." % (self.app_name))
    
    if self.updated == 'install':
      #uninstall
      succ, ws_out = self.call_task("undo_" +  JYTHON_NAME, [self.app_name])
    else:
      #find out the old ear file and update to the old ear file
      prod_dir = CFG.getProductFolder()
      old_ear_path = None
      
      for f in os.listdir(prod_dir):
        if f.find(self.ear_name) > -1:
          old_ear_path = prod_dir + "/" + f
          logging.debug("Old %s EAR located: %s" % (self.app_name, self.ear_path) )
          break
    
      if not old_ear_path:
        logging.info("Failed to find the old %s EAR, ignore" % (self.app_name))
      else:
        succ, ws_out = self.call_task(JYTHON_UPGRADE_NAME, [old_ear_path])
        if not succ:
          return False
      
      logging.info("Finish to undo upgrade %s EAR application" % (self.app_name))
      return True

  def _install_app(self):
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments    
    args.extend(["-f",  "./conversion/tasks/" + JYTHON_NAME])

    args.extend([self.ear_path])    
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
  
  def _check_app(self,appName):
    logging.info("Checking %s EAR application..." % (appName))
    args = []
    args.extend([appName])
    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()
    if clusters:
      args.extend([clusters[0]]) 
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])
 
    succ, ws_out = self.call_task("is_application_installed.py", args)    
    if not succ:
      logging.info("The %s EAR application doesn't exist." % (appName))
      return False
    
    if ws_out.find("yes") != -1 :
      logging.info("The %s EAR application is existing..." % (appName))
      return True
    else:
      logging.info("The %s EAR application doesn't exist." % (appName))
      return False
         
  #def check_ids_installable(self):
  #  if CFG.get_software_mode().lower()=="sc" and self.app_name==CFG.get_ids_app_name():
  #    return True
  #  else:
  #    return False

class InstallSanityEar(command.Command):

  def __init__(self):
    #self.config = config.Config()
    self.build_dir = CFG.get_build_dir()
    for f in os.listdir(self.build_dir):
      if f.find(CVT_SANITY_EAR_PRE) > -1:
        self.ear_path = self.build_dir + "/" + f
        logging.debug("Conversion sanity ear located: " + self.ear_path)
        break

  def readCfg(self, cfg=None):
    return True

  def do(self):
    logging.info("Installing conversion sanity EAR application...")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./conversion/tasks/" + JYTHON_NAME])

    args.extend([self.ear_path])

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
    logging.info("Install conversion sanity EAR application completed")
    return True

  def undo(self):
    logging.info("Uninstalling conversion sanity EAR application...")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./conversion/tasks/undo_" + JYTHON_NAME])
    args.extend([CFG.get_app_name()]) 

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
    logging.info("Uninstall conversion sanity EAR application completed")
    return True
  
  def do_upgrade(self):   
    return True
    
  def undo_upgrade(self):
    return True
          
class Map2WebServer(command.Command):

  def __init__(self):
    self.build_dir = CFG.get_build_dir()
    self.webserver_name = CFG.get_webserver_name()
    if self.webserver_name=="":
      self.webserver_name = "all_webservers"

  def readCfg(self, cfg=None):
    self.app_name = cfg['app']
    self.ear_name = CFG.get_ear_name(self.app_name)    
    
    for f in os.listdir(self.build_dir):
      if f.find(self.ear_name) > -1:
        self.ear_path = self.build_dir + "/" + f
        logging.debug(self.app_name+" conversion ear located: " + self.ear_path)
        break
    
    if "options" in cfg:
      self.options = cfg["options"]
    else:
      self.options = None
    
    self.plug_cfg_backup_dir = CFG.get_temp_dir() + os.sep + "webserver"
    
    sysstr = platform.system()
    if(sysstr == "Windows"):
      self.plug_cfg_backup_dir = self.plug_cfg_backup_dir.replace('\\','/')
      
    self.ins_upg = False
    
    return True

  def do(self):
    logging.info("Map %s EAR application to WebServer..." % (self.app_name))
    
    if not CFG.webserver_info or len(CFG.webserver_info)==0:
      logging.info("Invalid webserver name %s configuration or No Web Server found in this cell..." % (self.webserver_name))
      return self.msg_for_failure()
      
    args = []
    args.extend([self.ear_path])
    args.extend([self.app_name])
    args.extend([CFG.get_scope_type()]) # server or cluster
    servers, clusters = CFG.prepare_scope()
    if clusters:
      args.extend([clusters[0]])
      args.extend([clusters[0]])
    if servers:
      args.extend([servers[0]["servername"]])
      args.extend([servers[0]["nodename"]])    
    
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task(JYTHON_MAP2WEB, args)    
    if not succ:
      return self.msg_for_failure()
    
    if ws_out.find("Web Server should be installed first") > -1:
      logging.info("No Web Server found in this cell...")
      return self.msg_for_failure()
    
    logging.info("Map %s EAR application to WebServer completed" % (self.app_name))    
    
    if not self.backup_ihs_plug_cfg():
      return self.msg_for_failure()
    
    if CFG.get_restart_webservers():
      self.stop_web_servers()
   
    if not self.generate_ihs_plug():
      return self.msg_for_failure()
          
    if not self.get_remote_webserver_plug_cfg_dir():
      return self.msg_for_failure()
      
    if not self.register_webserver():
      return self.msg_for_failure()
    
    if not self.get_remote_webserver_plug_cfg_file():
      return self.msg_for_failure()
    
    if not self.merge_ihs_plug_cfg():
      return self.msg_for_failure()
    
    if not self.propagate_ihs_plug():
      return self.msg_for_failure()      
    
    if not self.transfer_to_remote_node(REM_CFG_MERGE):
      return self.msg_for_failure()
      
    if CFG.get_restart_webservers():
      self.start_web_servers()      
    
    self.ins_upg = True
    
    return True

  def undo(self):    
    if self.ins_upg:
      return self.rollback_ihs_plug_cfg()
    else:
      return True
    
  def do_upgrade(self):
    return self.do()
  
  def undo_upgrade(self):
    return self.undo()
  
  def backup_ihs_plug_cfg(self):
    logging.info("Backing up Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args = []
    args.extend([self.plug_cfg_backup_dir])    
    args.extend([PLUG_CFG_ORG])
    args.extend([PLUG_CFG_FILE])
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("backup_webserver_plugin_cfg.py", args)
    
    if not succ:
      return False
        
    logging.info("Successfully Backed up Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    
    return True  
  
  def stop_web_servers(self):
    logging.info("Starting to stop webservers...")
    
    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("stop_webserver.py", args)
    
    if not succ:
      return False
      
    logging.info("Stopped webservers successfully...")
    return True
    
  def start_web_servers(self):
    logging.info("Starting webservers...")
    
    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("start_webserver.py", args)
    
    if not succ:
      return False
      
    logging.info("Started webservers successfully...")
    return True
  
  def generate_ihs_plug(self):
    logging.info("Generating Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args = []
    args.extend([self.plug_cfg_backup_dir])    
    args.extend([PLUG_CFG_NEW])
    args.extend([PLUG_CFG_FILE])
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("generate_webserver_plugin_cfg.py", args)
    
    if not succ:
      return False
   
    logging.info("Successfully Generated Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    return True

  def get_remote_webserver_plug_cfg_dir(self):
    logging.info("Getting Configuration Directory for Remote WebServer plugin-cfg.xml...")
    
    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("get_webserver_cfg_path.py", args)
    
    if not succ:
      return False   
      
    remote_webserver_plug_cfg_files = []
    for line in ws_out.split('\n'):
      if line.find('RemoteConfigFilename:') > -1:
        plug_cfg_file = line.replace('RemoteConfigFilename:','').split(',')
        print("plug_cfg_file: ")
        print(plug_cfg_file)
        remote_webserver_plug_cfg_files.append(plug_cfg_file)
    
    self.remote_webserver_plug_cfg = dict((i[0], dict({'plugincfgpath':i[1],'nodename':i[2],'servername':i[3]})) for i in remote_webserver_plug_cfg_files)
    logging.info("Successfully Got Configuration Directory for Remote WebServer plugin-cfg.xml...")
    
    return True
    
  def register_webserver(self):
    logging.info("Registering Remote WebServer for JobManager...")
    while(not was.verify_job_manager_hosts(CFG.webserver_info)):
      print('Some hosts are not added into job manager as targets, please enter information for them.')
      was.collect_hosts_info("webserver")
      print('\nVerifiying target hosts ...\n')
      
    logging.info("Successfully Registered Remote WebServer for JobManager...")
    
    return True
        
  def get_remote_webserver_plug_cfg_file(self):
    logging.info("Getting Remote WebServer plugin-cfg.xml...")
    args = []
    
    webserver_hosts = json.dumps(list(CFG.webserver_info.keys())) 
    remote_webserver_cfg_info = json.dumps(self.remote_webserver_plug_cfg)
    
    args = CFG.get_was_cmd_line()
    args.extend(['-f',  './conversion/tasks/start_jobs.py', 'do', 
              webserver_hosts, 
              remote_webserver_cfg_info, 
              self.plug_cfg_backup_dir, 
              REM_CFG_ORG, 
              PLUG_CFG_FILE,
              CFG.timestamp
              ])
    succ, ws_out = call_wsadmin(args)
    
    if ws_out.find("jobmanager task complete successfully!") == -1:
      return False
       
    logging.info("Successfully Got Remote WebServer plugin-cfg.xml...")
    
    return True
  
  def propagate_ihs_plug(self):
    logging.info("Propagating Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args = []
    args.extend([self.plug_cfg_backup_dir])    
    args.extend([PLUG_CFG_MERGE])
    args.extend([PLUG_CFG_FILE])
    args.extend([self.webserver_name])
    succ, ws_out = self.call_task("propagate_webserver_plugin_cfg.py", args)
    
    if not succ:
      return False
   
    logging.info("Successfully Propagated Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    return True
    
  def merge_ihs_plug_cfg(self):
    logging.info("Merging Webserver Plugin Settings in Cell Config for %s EAR application..." % (self.app_name))
    
    was_admin_cmd = None
    if os.name == "nt":
      was_admin_cmd = CFG.get_was_dir() + "/bin/pluginCfgMerge.bat"
    else:
      was_admin_cmd = CFG.get_was_dir() + "/bin/pluginCfgMerge.sh"
    
    for webnode_dir in os.listdir(self.plug_cfg_backup_dir):
      websrv_dirs= os.path.join(self.plug_cfg_backup_dir,webnode_dir)
      for websrv_dir in os.listdir(websrv_dirs):
        org_file = os.path.join(websrv_dirs,websrv_dir,PLUG_CFG_ORG,PLUG_CFG_FILE)
        new_file = os.path.join(websrv_dirs,websrv_dir,PLUG_CFG_NEW,PLUG_CFG_FILE)
        #check whether needing merge action
        merge_dir = os.path.join(websrv_dirs,websrv_dir,PLUG_CFG_MERGE)
        if os.path.exists(org_file) and os.path.exists(new_file):          
          if not os.path.exists(merge_dir):
            os.makedirs(merge_dir)
          merged_file = os.path.join(merge_dir,PLUG_CFG_FILE)
    
          try:
            merg_args = []
            merg_args.extend([was_admin_cmd])
            merg_args.extend([org_file])
            merg_args.extend([new_file])
            merg_args.extend([merged_file])
            ws_log = open("wsadmin.log", "w")
            ws_process = subprocess.Popen(merg_args, \
            stdout=ws_log, stderr=ws_log)
            ws_process.wait()
            ws_log.close()
            ws_log = open("wsadmin.log", "r")
            ws_out = ws_log.read()
            ws_log.close()
    
            if ws_out.find("Exception") > -1:  
              print(("Exception thrown while merging plugin-cfg.xml for WebServer %s of node %s:" % (websrv_dir,webnode_dir) + ws_out)) 
              return False
          except:
            logging.info("Error while merging plugin-cfg.xml for WebServer %s of node %s:" % (websrv_dir,webnode_dir) + ws_out )
            ws_process.terminate()
            return False
        
        
        remote_merge_new = None
        if os.path.exists(merge_dir):
          remote_merge_new = os.path.join(merge_dir,PLUG_CFG_FILE)
        elif os.path.exists(new_file):
          remote_merge_new = new_file
        
        if remote_merge_new and os.path.exists(remote_merge_new):
          remote_cfg_org = os.path.join(websrv_dirs,websrv_dir,REM_CFG_ORG,PLUG_CFG_FILE)
          if os.path.exists(remote_cfg_org):
            #remote_cfg_merge = os.path.join(websrv_dirs,websrv_dir,REM_CFG_MERGE,PLUG_CFG_FILE)
            remote_cfg_merge = os.path.join(websrv_dirs,websrv_dir,REM_CFG_MERGE)
            if not os.path.exists(remote_cfg_merge):
              os.makedirs(remote_cfg_merge)
            remote_cfg_merge_file = os.path.join(remote_cfg_merge,PLUG_CFG_FILE)
            try:
              merg_args2 = []
              merg_args2.extend([was_admin_cmd])
     
              merg_args2.extend([remote_cfg_org])
              merg_args2.extend([remote_merge_new])
              merg_args2.extend([remote_cfg_merge_file])
              ws_log2 = open("wsadmin2.log", "w")
                    
              ws_process2 = subprocess.Popen(merg_args2, \
              stdout=ws_log2, stderr=ws_log2)
              ws_process2.wait()
              ws_log2.close()
            
              ws_log2 = open("wsadmin2.log", "r")
              ws_out2 = ws_log2.read()
              ws_log2.close()
              
              if ws_out2.find("Exception") > -1:
                print(("Exception thrown while merging plugin-cfg.xml for WebServer %s of node %s:" % (websrv_dir,webnode_dir) + ws_out))
                return False
            except:
              logging.info("Error while merging plugin-cfg.xml for WebServer %s of node %s:" % (websrv_dir,webnode_dir) + ws_out )
              ws_process2.terminate()
              return False
          
    logging.info("Successfully Merged Webserver Plugin Settings in Cell Config for %s EAR application..." % (self.app_name))
    return True
  
  def transfer_to_remote_node(self,subdir):    
    logging.info("Transfering plugin-cfg.xml to remote WebServer...")
    webserver_hosts = json.dumps(list(CFG.webserver_info.keys())) 
    remote_webserver_cfg_info = json.dumps(self.remote_webserver_plug_cfg)    
    args = CFG.get_was_cmd_line()    
    args.extend(['-f',  './conversion/tasks/start_jobs.py', 'undo', 
              webserver_hosts, 
              remote_webserver_cfg_info, 
              self.plug_cfg_backup_dir, 
              subdir, 
              PLUG_CFG_FILE,
              CFG.timestamp
              ])    
    succ, ws_out = call_wsadmin(args)
    
    if not succ:
      return False
      
    if ws_out.find("jobmanager task complete successfully!") == -1:
      return False
     
    logging.info("Successfully Transfered plugin-cfg.xml to remote WebServer...")
    
    return True

  def rollback_ihs_plug_cfg(self):
    logging.info("Rolling back Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args1 = []
    args1.extend([self.plug_cfg_backup_dir])    
    args1.extend([PLUG_CFG_ORG])
    args1.extend([PLUG_CFG_FILE])
    args1.extend([self.webserver_name])
    succ1, ws_out1 = self.call_task("undo_gene_webserver_plug_cfg.py", args1)
    if not succ1:
      return False
    
    if not self.transfer_to_remote_node(REM_CFG_ORG):
      return False
    
    logging.info("Successfully Rolled back Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    
    return True
  
  def msg_for_failure(self):
    logging.info("Failed to automatically configure WebServer for %s EAR application,please refer to the guide and configure it manually after installation..." % (self.app_name))
    return True

