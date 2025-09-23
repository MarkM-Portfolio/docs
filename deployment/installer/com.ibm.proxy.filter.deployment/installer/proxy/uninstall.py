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
from datetime import datetime 

from common import command, CFG, config
from common.utils.docs_optparse import OPTIONS

UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "proxy.install_cmd_list"

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
    raise e

  roll_list, erro_list = command.exec_commands(cmd_list, True, True)
  
  if len(erro_list) == 0:
    #_clean()
    logging.info("Uninstall successfully.")    
  else:
    logging.error("Uninstall completed with errors, check log file for more detail.")    


if __name__ == "__main__":
  try:
    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
   
    from proxy import prepare_uninstall
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
