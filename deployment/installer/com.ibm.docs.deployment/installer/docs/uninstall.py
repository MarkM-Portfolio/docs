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


import os, sys, shutil
import logging
import traceback

from common import command, CFG
from common.utils.docs_optparse import OPTIONS
from docs import config

UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "docs.install_cmd_list"

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
          logging.exception(e)  
            
  logging.info("Cleaning installation folder completed")            
  

def uninstall():
  # put keep_uninstaller tag file into installer directory
  keep_uninstaller_tag = os.path.join( CFG.get_install_root(), 'installer', 'keep_uninstaller')
  installerPath = os.path.join(CFG.get_install_root(), 'installer')
  if not os.path.exists(installerPath):
    os.makedirs(installerPath)
  open(keep_uninstaller_tag, 'a').close()
  
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


if __name__ == "__main__":
  try:
    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
   
    from docs import prepare_uninstall
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

