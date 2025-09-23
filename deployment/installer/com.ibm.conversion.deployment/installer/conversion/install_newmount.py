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


import os, sys, stat
import shutil
import logging
import os.path
import datetime

from common import command
from util import script_template

CMD_LIST_MODULE = "conversion.newmount_cmd_list"
UNINSTALL_FOLDER = "installer"

def _create_uninstaller():
  #cfg = config.Config()
  shutil.copy(sys.argv[1], CFG.get_install_root())
  installer_src = sys.argv[2] + os.sep + UNINSTALL_FOLDER
  installer_dest = CFG.get_install_root() + os.sep + UNINSTALL_FOLDER
  
  if os.path.exists(installer_dest):
    try:
      shutil.rmtree(installer_dest, True)
    except Exception as e:
      pass
  
  if not os.path.exists(installer_dest):
    os.makedirs(installer_dest)
  
  for f in os.listdir(installer_src):
    f_path = installer_src + os.sep + f
    f_path_dest = installer_dest + os.sep + f
    if os.path.isfile(f_path):
      shutil.copy2(f_path, f_path_dest)
    else:
      shutil.copytree(f_path, f_path_dest)
  
  #clean build
  prod_dir = CFG.getProductFolder()
  if os.path.exists(prod_dir):
    for f in os.listdir(prod_dir):
      f_path = prod_dir + os.sep + f
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        shutil.rmtree(f_path)

  #copy build
  if not os.path.exists(prod_dir):
    os.makedirs(prod_dir)

  build_dir = sys.argv[2]
  for f in os.listdir(build_dir):
    f_path = build_dir + os.sep + f
    if os.path.isfile(f_path):
      shutil.copy(f_path, prod_dir)
    else:
      shutil.copytree(f_path, prod_dir + os.sep + f)

  #create installer
  cfg_path = os.path.abspath(CFG.get_install_root() + os.sep + os.path.basename(sys.argv[1]))
  pf_path = os.path.abspath(CFG.getProductFolder())
  #if os.name == "nt":
  _w32_create_installer(installer_dest, cfg_path, pf_path)
  #else:
  _lnx_create_installer(installer_dest, cfg_path, pf_path)

  # create uninstaller
  #if os.name == "nt":
  _w32_create_uninstaller(installer_dest, cfg_path, pf_path)
  #else:
  _lnx_create_uninstaller(installer_dest, cfg_path, pf_path)
  
def _lnx_create_installer(dest, cfgf, pf):
  ins_content = []
  ins_content.append("#!/bin/sh\n")
  ins_content.append("export PYTHONPATH=$PYTHONPATH:$PWD\n")
  ins_content.append("python3 conversion/install.py ")
  ins_content.append(cfgf)
  ins_content.append(" ")
  ins_content.append(pf)
  ins_content.append("\n")
  
  f_ins = open (dest + os.sep + "install.sh", "w")
  f_ins.write("".join(ins_content))
  f_ins.close()

def _lnx_create_uninstaller(dest, cfgf, pf):
  content = script_template.GUNINSTALL_LNX
  content = content.replace('${cfgFile}',cfgf)
  content = content.replace('${buildDir}',pf)

  f_uni = open (dest + os.sep + "uninstall.sh", "w")
  f_uni.write(content)
  f_uni.close()

def _w32_create_installer(dest, cfgf, pf):
  ins_content = []
  ins_content.append("@echo off\n")
  ins_content.append("set PYTHONPATH=%PYTHONPATH%;%CD%\n")
  ins_content.append("python conversion\install.py ")
  ins_content.append('"')
  ins_content.append(cfgf)
  ins_content.append('"')
  ins_content.append(" ")
  ins_content.append('"')
  ins_content.append(pf)
  ins_content.append('"')
  ins_content.append("\n")
  
  f_ins = open (dest + os.sep + "install.bat", "w")
  f_ins.write("".join(ins_content))
  f_ins.close()

def _w32_create_uninstaller(dest, cfgf, pf):
  content = script_template.GUNINSTALL_W32
  content = content.replace('%cfgFile%',cfgf)
  content = content.replace('%buildDir%',pf)

  f_uni = open (dest + os.sep + "uninstall.bat", "w")
  f_uni.write(content)
  f_uni.close()

def install():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Installation failed, check log file for more detail.")
    sys.exit(-1)

  roll_list, erro_list = command.exec_commands(cmd_list, False, False)
  
  if len(erro_list) == 0:
    logging.info("Installation Completed Successfully.")
    sys.exit()

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  roll_list2, erro_list2 = command.exec_commands(roll_list, True, True)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")
  sys.exit(-1)

if __name__ == "__main__":
  
  #arg list: install.py configFile build wasadminID wasadminPW acceptLicense silentlyInstall
  if len(sys.argv) < 7:
    print(('%s Error Invalid Arguments (%s) for install.py, installation quit now.\n' \
          'Example: install.py configFile buildDir wasadminID wasadminPW acceptLicense silentlyInstall' \
          % (datetime.datetime.now(),sys.argv)))
    sys.exit()

  cfg_path = sys.argv[1]
  if os.path.exists(cfg_path) == False \
          or os.path.isfile(cfg_path) == False:
    print(('%s Error configFile path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),cfg_path)))
    sys.exit()
  
  build_path = sys.argv[2]
  if os.path.exists(build_path) == False \
          or os.path.isdir(build_path) == False:
    print(('%s Error build path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),build_path)))
    sys.exit()

  #only this point can import config, because cfg_path is valid
  from common import CFG, config

  config.GWAS_ADMIN_ID = sys.argv[3]
  config.GWAS_ADMIN_PW = sys.argv[4]
  config.GACCEPT_LICENSE =  sys.argv[5]
  config.GSILENTLY_INSTALL = sys.argv[6]

  #from conversion import prepare_install
  #pi = prepare_install.PrepareInstall()

  #logging.info("Validating installation prerequisite...")
  #if not pi.do():
  #  logging.error("Failed to validate the installation prerequisite. \n \
  #	Check log file for more detail.")
  #  sys.exit(-1)

  #logging.info("Validation successfully, creating uninstaller...")
  #_create_uninstaller()

  logging.info("Start installation...")
  install()

