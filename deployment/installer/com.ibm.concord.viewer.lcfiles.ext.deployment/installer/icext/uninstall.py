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

import os, sys, shutil, logging
from datetime import datetime
import configparser
import traceback
from icext.config import CONFIG as CFG
from commands import command
from icext import config

UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "icext.install_cmd_list"

def _init_log():
  #cfg = config.Config()
  log_dir = CFG.get_logs_dir()
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)
  logging.basicConfig(level=logging.DEBUG,\
	format='%(asctime)s %(levelname)s %(message)s',\
	filename=log_dir + os.sep + 'extensionUninstall.log',\
	filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def uninstall():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Uninstall failed, check log file for more detail.")
    raise Exception('Install Failed')

  roll_list, erro_list = command.exec_commands(cmd_list, True, True)
  
  if len(erro_list) == 0:
    _clean()
    logging.info("Uninstall successfully.")    
  else:
    logging.error("Uninstall completed with errors, check log file for more detail.")

def _clean():
  logging.info("Cleaning installation folder")
  install_root = CFG.get_install_root()
  for f in os.listdir(install_root):
      f_path = os.path.join(install_root, f)
      if f.find(UNINSTALL_FOLDER) >= 0 or f.find("product") >= 0:
        try:
          if os.path.isdir(f_path):
            shutil.rmtree(f_path, True)
          else:
            os.remove(f_path)
        except Exception as e:
          log.exception(e)  
            
  logging.info("Cleaning installation folder completed")

if __name__ == "__main__":
  try:
    _init_log()
   
    if len(sys.argv) < 3:
      logging.error("Invalid Arguments")
      raise Exception('Install Failed')
   
    config.GWAS_ADMIN_ID = sys.argv[3]
    config.GWAS_ADMIN_PW = sys.argv[4]

    if len(sys.argv) > 5:    
      GTIME = sys.argv[5]
      for fl in os.listdir(CFG.get_logs_dir()):
        p = os.path.join(CFG.get_logs_dir(), fl)
        if( os.path.isfile(p) and fl.startswith('python_process_info_') ):
          try:
            os.remove(p)
          except:
            pass
      # write python process info
      process_info = configparser.RawConfigParser()
      process_info.add_section('info')
      process_info.set('info', 'log_file', "extensionUninstall.log")

      info_file_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_' + GTIME)
      info_file = open(info_file_path, 'w')
      process_info.write(info_file)
      info_file.close()

      info_file_marker_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_%s_marker' % GTIME)
      info_file_marker = open( info_file_marker_path, 'w')
      info_file_marker.close()

    from icext import prepare_uninstall
    pi = prepare_uninstall.PrepareUninstall()

    logging.info("Validating uninstallation prerequsite...")
    if not pi.do():
      logging.error("Failed to validate the uninstallation prerequisite. \n \
    Check log file for more detail.")
      raise Exception('Install Failed')

    logging.info("Validation successfully, start uninstalling...")
    uninstall()
    logging.info('-->IM:END')
  except Exception as e:
    logging.info( "Exception: " + str(e))    
    logging.info('-->IM:FAILED')
