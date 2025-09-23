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

import os, sys, shutil
import logging
import traceback

from viewer.config import CONFIG as CFG
from commands import command
from viewer import config

UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "viewer.install_node_cmd_list"

def _init_log():
  log_dir = CFG.get_logs_dir()
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)
  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_dir + os.sep + 'viewerUninstall.log',
                      filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def _clean():
  logging.info("Cleaning installation folder")
  prod_dir = CFG.get_product_dir()
  if os.path.exists(prod_dir):
    shutil.rmtree(prod_dir)


  ins_dir = CFG.get_install_root() + os.sep + UNINSTALL_FOLDER
  if os.path.exists(ins_dir):
    try:
      shutil.rmtree(ins_dir)
    except Exception as e:
      pass

def uninstall():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Uninstall failed, check log file for more detail.")
    raise Exception("Failed to load commands from module: " + CMD_LIST_MODULE)

  roll_list, erro_list = command.exec_commands(cmd_list, True, True)
  
  if len(erro_list) == 0:
    _clean()
    logging.info("Uninstall successfully.")
  else:
    logging.error("Uninstall completed with errors, check log file for more detail.")
  

if __name__ == "__main__":
  try:	
    _init_log()
 
    if len(sys.argv) < 5:
      logging.error("Invalid Arguments")
      raise Exception("Invalid Arguments")

    config.GWAS_ADMIN_ID = sys.argv[3]
    config.GWAS_ADMIN_PW = sys.argv[4]
 
    from viewer import prepare_uninstall
    pi = prepare_uninstall.PrepareUninstall()

    logging.info("Validating uninstallation prerequsite...")
    if not pi.do():
      logging.error("Failed to validate the uninstallation prerequisite. \n \
	Check log file for more detail.")
      raise Exception("Failed to validate the uninstallation prerequisite.")

    logging.info("Validation successfully, start uninstalling...")
    uninstall()
    logging.info('-->IM:END')
  except Exception as e:
    logging.info("Exception: "+str(e))    
    logging.info('-->IM:FAILED')

