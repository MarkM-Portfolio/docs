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

from common import CFG, config, command
from common.utils.docs_optparse import OPTIONS
from common.utils import configfiles


UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "conversion.install_cmd_list"

def _clean():
  logging.info("Cleaning installation folder")
  cfg = CFG
  install_root = cfg.get_install_root()
  for f in os.listdir(install_root):
      f_path = os.path.join(install_root, f)
      if f.find("product") >= 0:
        try:
          if os.path.isdir(f_path):
            shutil.rmtree(f_path, True)
          else:
            os.remove(f_path)
        except Exception as e:
          logging.exception(e)

  sym_dir = cfg.getSymphonyFolder()
  try:
    if os.path.exists(sym_dir):
      shutil.rmtree(sym_dir)
  except:
    pass
  ins_dir = cfg.get_install_root() + os.sep + UNINSTALL_FOLDER
  if os.path.exists(ins_dir):
    try:
      os.remove(ins_dir + os.sep + "version.txt")
      shutil.rmtree(ins_dir)
    except Exception as e:
      pass

def uninstall():
  # put keep uninstaller tag file into installer directory
  try:
    keep_uninstaller_tag = os.path.join( CFG.get_install_root(), 'installer', 'keep_uninstaller')
    installerPath = os.path.join( CFG.get_install_root(), 'installer')
    if not os.path.exists(installerPath):
      os.makedirs( installerPath )
    open(keep_uninstaller_tag, 'a').close()
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
      failed_host = None
      if CFG.cluster_info:    
        failed_host = [k for k, v in list(CFG.cluster_info.items()) 
                     if v.get('finish_status', -1) != 0]
      if not failed_host:    
        logging.info("All uninstallation jobs complete successfully.")
        logging.info("Uninstall successfully.")
      else:
        configfiles.write_status(failed_host, 
                                 os.path.join(CFG.get_logs_dir(), 
                                 'retry_hosts.json'))
        logging.info("Not all remote uninstallation jobs complete successfully!")    
      logging.info('-->IM:END')
    else:
      logging.error("Uninstall completed with errors, check log file for more detail.")
      logging.info('-->IM:END')
  except Exception as e:
    logging.error("Uninstall completed with errors, check log file for more detail.")
    logging.info('-->IM:END')      	

if __name__ == "__main__":
  
  config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
  config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
 
  from conversion import prepare_uninstall  

  try:
    pi = prepare_uninstall.PrepareUninstall()
    logging.info("Validating uninstallation prerequsite...")
    if not pi.do():
      logging.error("Failed to validate the uninstallation prerequisite. \n \
    Check log file for more detail.")
      raise Exception("Validating uninstallation prerequsite Failed")

    logging.info("Validation successfully, start uninstalling...")
    uninstall()
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')

