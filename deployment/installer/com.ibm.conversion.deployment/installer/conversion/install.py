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
import traceback

from common import command, CFG, config
from util import script_template
from common.utils.docs_optparse import OPTIONS
from common.utils import configfiles

CMD_LIST_MODULE = "conversion.install_cmd_list"
UNINSTALL_FOLDER = "installer"

def install():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Installation failed, check log file for more detail.")    
    return -1

  if OPTIONS.get('-retry', 'false').lower() == 'true':
    cmd_list = command.filter_commands(cmd_list, 
                                       lambda x: x.get('exec_in_retry', False))
      
  roll_list, erro_list = command.exec_commands(cmd_list, False, False)
  
  if len(erro_list) == 0:
    failed_host = None
    if CFG.cluster_info:    
      failed_host = [(k, 'windows') for k, v in list(CFG.cluster_info.items()) 
                     if v.get('finish_status', -1) != 0]
    if not failed_host or CFG.get_non_job_mgr_mode().lower()=='true':
      logging.info('-->IM:END')
      logging.info("All installation jobs complete successfully.")
      logging.info("Installation Completed Successfully.")
      shutil.copy(CFG.get_cfg_path(), CFG.get_install_root())    
      return 0	  
    else:
      configfiles.write_status(failed_host, 
                               os.path.join(CFG.get_logs_dir(), 
                               'retry_hosts.json'))
      logging.info("Not all remote installation jobs complete successfully!")

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  erro_list2 = command.rollback_commands(roll_list, True, False)
  logging.info('-->IM:Python script failed. Start rollback the installation.')
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")  
  raise Exception('Installation failed. Check log file for more detail.')  

if __name__ == "__main__":
  try:
    build_path = OPTIONS["-build"]
    if not os.path.isdir(build_path):
      error_msg = '%s Error build path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),build_path)    	
      print(error_msg)
      raise Exception(error_msg)

    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]

    from conversion import prepare_install
    pi = prepare_install.PrepareInstall()
    logging.info('-->IM:Prepare installation')
    logging.info("Validating installation prerequisite...")
    if not pi.do():
      logging.error("Failed to validate the installation prerequisite. \nCheck log file for more detail.")
      raise Exception("Failed to validate the installation prerequisite.")  
    logging.info("Start installation...")
    install()
    logging.info('-->IM:END')      
    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass  
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')      	 