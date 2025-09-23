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


import os, sys, stat, time, fileinput, re
import shutil
import subprocess
import logging

SCHTASK_FILENAME = "start_nfs_task.bat"
END_SCHTASK_FILENAME = "end_nfs_task.bat"
MONITOR_DEST = "/nfs_monitor"
CONVERSION_INSTALL_ROOT = "d:/IBMConversion"
NFS_MONITOR_DIR = CONVERSION_INSTALL_ROOT + "/nfs_monitor";
SCH_TASK_SCRIPT = "C:/installer/start_nfs_task.bat"

class InstallNFSMonitor():
  
  def __init__(self, docs_shared_dir, viewer_shared_dir, username, password):
    self.monitor_dest = CONVERSION_INSTALL_ROOT + MONITOR_DEST
    self.docs_shared_dir = docs_shared_dir
    self.viewer_shared_dir = viewer_shared_dir
    self.username = username
    self.password = password
    logging.debug("Conversion nfs monitor folder located: " + self.monitor_dest)
    
  def precheck(self):
    logging.info("TODO: check existince of nfs monitor")
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True
  
  def copy(self):
    shutil.copy("c:/installer/start_nfs_task.bat", self.monitor_dest)
    shutil.copy("c:/installer/end_nfs_task.bat", self.monitor_dest)
  
  def write_schtasks(self):
    sctask_path = os.path.join(self.monitor_dest, SCHTASK_FILENAME)
    logging.info("Reading schtasks.exe template from: " + sctask_path)
    fr = open(sctask_path, "r")
    echo_tmp = fr.readline()
    monitor_tmp = fr.readline()
    monitor_tmp = monitor_tmp.replace("$list_file_path", self.monitor_dest + "/list_file.ps1")
    monitor_tmp = monitor_tmp.replace("$username", self.username)
    monitor_tmp = monitor_tmp.replace("$password", self.password)
    logging.debug("schtask info for monitor: %s" % monitor_tmp)
    other_cnt = fr.readlines()
    fr.close()

    logging.info("Writing schtask file to: " + sctask_path) 
    fw = open(sctask_path, "w")
    fw.write(echo_tmp)
    fw.write("\n")
    fw.write(monitor_tmp)
    fw.write("\n".join(other_cnt))
    fw.close()
    logging.info("Adding nfs monitor tools to Windows 2008 Server Task Scheduler")
    subprocess.call([sctask_path])
  
  def create_ps_file(self):
    if not os.path.exists(NFS_MONITOR_DIR):
      os.makedirs(NFS_MONITOR_DIR)
    #generate powershell script
    list_file = open(NFS_MONITOR_DIR + "/list_file.ps1", "w");
    list_file.write("dir %s" % self.docs_shared_dir)
    list_file.write("\r\n")
    list_file.write("dir %s" % self.viewer_shared_dir)
    list_file.write("\r\n")
    list_file.close()

  def do(self):
    self.create_ps_file()
    self.copy()
    self.write_schtasks();
    return True

  def undo(self):
    end_sctask_path = os.path.join(self.monitor_dest, END_SCHTASK_FILENAME)
    #print end_sctask_path
    subprocess.call([end_sctask_path])
    logging.info("Waiting 10s after ending nfs monitor successfully")
    time.sleep(10)      
    logging.info("Cleaning nfs monitoring tools")

    if os.path.exists(self.monitor_dest):
      shutil.rmtree(self.monitor_dest)
    return True
    
  if __name__ == "__main__":
    if len(sys.argv) != 5:
      print("Errors for arguments number passed to install nfs monitor")
      sys.exit()
    docs_shared_dir = sys.argv[1]
    print(("docs shared dir is %s " % docs_shared_dir))
    
    viewer_shared_dir = sys.argv[2]
    print(("viewer shared dir is %s " % viewer_shared_dir))
    
    username = sys.argv[3]
    password = sys.argv[4]
    
    from .install_nfs_monitor import InstallNFSMonitor
    monitor = InstallNFSMonitor(docs_shared_dir, viewer_shared_dir, username, password)
    monitor.do();
