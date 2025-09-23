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

import os, sys, os.path, shutil, string, subprocess, time
from common import command, CFG, was_cmd_util, ZipCompat, FileInstall
import logging as log

INSTALL_DIR_NAME = "calcserver"

class InstallSpreadsheetNodeJS(command.Command):
  
  def __init__(self):
    pass;

  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    return True
    
  def do(self):
    if not self._is_nodejs_enabled():
      log.info("Skip installing Spreadsheet NodeJS.")
      return True
      
    log.info("Installing Spreadsheet NodeJS...")
    
    self.installRoot = self._get_nodejs_install_root()
    
    if os.path.exists(self.installRoot):
      log.warning("NodeJS install root exists, clean by running uninstall.")
      self.undo()
    
    zipFile = ZipCompat(os.path.join(CFG.get_build_dir(), "spreadsheet_nodejs_offerings.zip"))
    zipFile.extractall(self.installRoot)
    
    if os.name == "nt":
      self._do_windows()
    else:
      self._do_linux()

    CFG._cf.set("Docs", "nodejs_enabled", "true")
    log.info("Spreadsheet NodeJS installed.")
    return True

  def undo(self):
    if not self._is_nodejs_enabled():
      log.info("Skip uninstalling Spreadsheet NodeJS.")
      return True
      
    self.installRoot = self._get_nodejs_install_root()

    log.info("Uninstalling Spreadsheet NodeJS...")
    
    if os.name == "nt":
      log.info("Disabling NodeJS task.")
      os.system('schtasks /Delete /F /TN "node_monitor"')

      log.info("Shutting down NodeJS, wait for 10s for NodeJS completely shut down.")
      os.system("taskkill /F /IM node.exe")
      time.sleep(10)
    else:
      log.info("Removing crontab item...")
      # calls script to remove crontab item
      remove_crontab_file = os.path.join(self.installRoot, "node-monitor", "remove_crontab_item.sh")
      remove_crontab_template_file = open(remove_crontab_file)
      remove_crontab_template_string = remove_crontab_template_file.read()
      remove_crontab_template_file.close()
      remove_crontab_template = string.Template(remove_crontab_template_string)
      
      cronDict = dict([("install_root", self.installRoot)])
      cronString = remove_crontab_template.substitute(cronDict)
      
      remove_crontab_template_file = open(remove_crontab_file, "w")
      remove_crontab_template_file.write(cronString)
      remove_crontab_template_file.close()
      
      subprocess.call(["/bin/sh", remove_crontab_file])

      log.info("Shutting down NodeJS, wait for 10s for NodeJS completely shut down.")
      subprocess.call([os.path.join(self.installRoot, "node-monitor", "restartServer.sh"), "--no-start"])
      time.sleep(10)
    
    shutil.rmtree(self.installRoot, False, self._on_rmtree_error) 
    
    log.info("Spreadsheet NodeJS uninstalled.")
    return True
    
  def do_upgrade(self):
    if not self._is_nodejs_enabled():
      log.info("Skip upgrading Spreadsheet NodeJS.")
      return True

    self.installRoot = self._get_nodejs_install_root()

    log.info("Upgrading Spreadsheet NodeJS.")
    
    if not os.path.isdir(self.installRoot):
      log.info("No Spreadsheet NodeJS installed, goes to normal install.")
      return self.do()
    
    self.backupDir = os.path.join(CFG.get_temp_dir(), "spreadsheet.nodejs")
    log.info("Backing up old Spreadsheet NodeJS to " + self.backupDir)
    
    # copy all current NodeJS installations to temp
    shutil.copytree(self.installRoot, self.backupDir, ignore=shutil.ignore_patterns("*.log", "*.lck"))
    
    log.info("Upgrade installing Spreadsheet NodeJS.")
    
    doRet = self.do()

    if doRet:
      log.info("Spreadsheet NodeJS upgraded.")
    
    return True
    
  def undo_upgrade(self):
    if not self._is_nodejs_enabled():
      log.info("Skip undo upgrading Spreadsheet NodeJS.")
      return True

    self.installRoot = self._get_nodejs_install_root()

    log.info("Undo upgrading Spreadsheet NodeJS.")
    
    self.backupDir = CFG.get_temp_dir() + os.sep + "/spreadsheet.nodejs"
    if not os.path.isDir(self.backupDir):
    	log.warn("No backup dir found, cannot undo upgrade.")
    	return True
    
    # undo current install
    self.undo()
    
    # restore install
    shutil.copytree(self.backupDir, self.installRoot)
    
    # re-start NodeJS and configure monitor
    if os.name == "nt":
      self._do_windows_monitor_and_start()
    else:
      self._do_linux_monitor_and_start()
    
    log.info("Upgrading Spreadsheet NodeJS undo-ed.")
    
    return True 
    
  def _do_linux(self):
    log.info("Detected OS as Linux.")
    
    log.info("Removing Windows executables.")
    shutil.rmtree(os.path.join(self.installRoot, "windows"), False, self._on_rmtree_error)
    
    self._unzip_antlr_dojo();
    
    log.info("Extracting Linux java-node module.")
    os.mkdir(os.path.join(self.installRoot, "node_modules"))
    ZipCompat(os.path.join(self.installRoot, "websheet", "java.node.rhx64.zip")).extractall(os.path.join(self.installRoot, "node_modules"))
    
    self._clean_packages()
    
    self._make_config()
    
    log.info("Making restartServer.sh.")
    shPath = os.path.join(self.installRoot, "node-monitor", "restartServer.sh")
    shFile = open(shPath)
    shTpl = string.Template(shFile.read())
    shFile.close()
    
    shDict = dict([("install_root", self.installRoot), ("jvm_dll_path", self._get_jvm_dll_path())])
    shString = shTpl.substitute(shDict)
    
    shFile = open(shPath, "w")
    shFile.write(shString)
    shFile.close()
    
    self._do_linux_monitor_and_start()

  def _do_windows(self):
    log.info("Detected OS as Windows.")
    
    log.info("Removing NodeJS Linux executables.")
    shutil.rmtree(os.path.join(self.installRoot, "linux"), False, self._on_rmtree_error)
    
    self._unzip_antlr_dojo();
    
    log.info("Extracting Windows java-node module.")
    os.mkdir(os.path.join(self.installRoot, "node_modules"))
    ZipCompat(os.path.join(self.installRoot, "websheet", "java.node.win64.zip")).extractall(os.path.join(self.installRoot, "node_modules"))
    
    self._clean_packages()
    
    self._make_config()
    
    log.info("Making restartServer.bat.")
    batFile = open(os.path.join(self.installRoot, "node-monitor", "restartServer.bat"))
    batTpl = string.Template(batFile.read())
    batFile.close()
    
    batDict = dict([("install_root", self.installRoot), ("jvm_dll_path", self._get_jvm_dll_path())])
    batString = batTpl.substitute(batDict)
    
    batFile = open(os.path.join(self.installRoot, "node-monitor", "restartServer.bat"), "w")
    batFile.write(batString)
    batFile.close()
    
    self._do_windows_monitor_and_start()
    
  def _unzip_antlr_dojo(self):
    log.info("Extracting ANTLR, dojo and concord js deps for NodeJS.")
    ZipCompat(os.path.join(self.installRoot, "websheet", "antlr4node.zip")).extractall(os.path.join(self.installRoot, "websheet"))
    ZipCompat(os.path.join(self.installRoot, "websheet", "compressed_source_1.8.5_IBMdojo.zip")).extractall(os.path.join(self.installRoot, "websheet"))
    ZipCompat(os.path.join(self.installRoot, "websheet", "concordjs.zip")).extractall(os.path.join(self.installRoot, "websheet", "concordjs"))
    
  def _clean_packages(self):
    log.info("Cleaning packages.")
    os.remove(os.path.join(self.installRoot, "websheet", "antlr4node.zip"))
    os.remove(os.path.join(self.installRoot, "websheet", "compressed_source_1.8.5_IBMdojo.zip"))
    os.remove(os.path.join(self.installRoot, "websheet", "concordjs.zip"))
    os.remove(os.path.join(self.installRoot, "websheet", "java.node.win64.zip"))
    os.remove(os.path.join(self.installRoot, "websheet", "java.node.rhx64.zip"))
    
  def _make_config(self):
    log.info("Making config.json.")  	
    config_file = os.path.join(self.installRoot, "config", "config.json")
    config_json_template_file = open(config_file)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)
    
    cfg_dict = dict([("debug", "false"), ("install_root", self.installRoot)])
    config_json_subst_string = config_json_template.substitute(cfg_dict)  

    config_json_subst_file = open(config_file, "w")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()
  
  def _do_windows_monitor_and_start(self):
    log.info("Scheduling NodeJS monitor.")
    # run command schtasks.exe /create /TN "node_monitor" /SC MINUTE /MO 1 /TR "powershell python $installRoot/node_monitor.py"
    schCmd = 'schtasks.exe /create /TN "node_monitor" /SC MINUTE /MO 1 /TR "powershell python ' + os.path.join(self.installRoot, "node-monitor", "node_monitor.py") + '"'
    os.system(schCmd)
    
    log.info("Starting NodeJS.")
    subprocess.Popen(os.path.join(self.installRoot, "node-monitor", "restartServer.bat"))
  
  def _do_linux_monitor_and_start(self):
    log.info("Installing NodeJS monitor crontab item.")

    # calls script to add crontab item
    add_crontab_file = os.path.join(self.installRoot, "node-monitor", "add_crontab_item.sh")
    add_crontab_template_file = open(add_crontab_file)
    add_crontab_template_string = add_crontab_template_file.read()
    add_crontab_template_file.close()
    add_crontab_template = string.Template(add_crontab_template_string)
    
    cronDict = dict([("install_root", self.installRoot)])
    cronString = add_crontab_template.substitute(cronDict)

    add_crontab_template_file = open(add_crontab_file, "w")
    add_crontab_template_file.write(cronString)
    add_crontab_template_file.close()
        
    subprocess.call(["/bin/sh", add_crontab_file])
    
    log.info("Starting NodeJS.")
    
    # chmod restart script and NodeJS executable
    subprocess.call(["/bin/chmod", "+x", os.path.join(self.installRoot, "node-monitor", "restartServer.sh")])
    subprocess.call(["/bin/chmod", "+x", os.path.join(self.installRoot, "linux/bin/node")])
    
    subprocess.Popen(os.path.join(self.installRoot, "node-monitor", "restartServer.sh"))

  def _on_rmtree_error(self, func, path, excinfo):
    log.warning("cannot remove directory %s", path)
  
  def _get_nodejs_install_root(self):
    path = os.path.join(CFG.get_install_root(), INSTALL_DIR_NAME)
    if os.name == "nt":
      # escape "\" for windows in case the string is put into JSON
      path = path.replace("\\", "\\\\")
    return path 
    
  def _is_nodejs_enabled(self):
    return CFG.get_spreadsheet_nodejs_install() == "true"
  
  def _get_jvm_dll_path(self):
    """
    Return jvm.dll/libjvm.so from WAS JDK.
    For windows, the path is $was\java\jre\bin\j9vm\
    For linux, the path is $was/java/jre/lib/amd64/j9vm/
    """
    
    if os.name == "nt":
      return os.path.join(CFG.get_was_dir(), "java/jre/bin/j9vm/")
    else:
      return os.path.join(CFG.get_was_dir(), "java/jre/lib/amd64/j9vm/")
