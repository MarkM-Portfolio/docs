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
from datetime import datetime 
import shutil
import logging
import os.path
import datetime
import traceback

from common import command
from common.utils.docs_optparse import OPTIONS
from util import script_template
from proxy.config_exception import ConfigException

CMD_LIST_MODULE = "proxy.install_cmd_list"
UNINSTALL_FOLDER = "installer"

def upgrade():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Upgrade failed, check log file for more detail.")
    return -1

  roll_list, erro_list = command.exec_commands(cmd_list, False, False, True)
  
  if len(erro_list) == 0:
    return 0

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes, force all commands being executed, even if one fail
  erro_list2 = command.rollback_commands(roll_list, True, True)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  return -1

if __name__ == "__main__":
  try:
    cfg_path = OPTIONS["-configFile"]
    if os.path.exists(cfg_path) == False \
            or os.path.isfile(cfg_path) == False:
      current_time = datetime.datetime.now()
      print('%s Error configFile path (%s) is invalid, upgrade exit now.' % (current_time,cfg_path))
      raise Exception('%s Error configFile path (%s) is invalid, upgrade exit now.' % (current_time,cfg_path))
  
    build_path = OPTIONS["-build"]
    if os.path.exists(build_path) == False \
            or os.path.isdir(build_path) == False:
      current_time = datetime.datetime.now()
      print('%s Error build path (%s) is invalid, upgrade exit now.' % (current_time,build_path))
      raise Exception('%s Error build path (%s) is invalid, upgrade exit now.' % (current_time,build_path))
  
    #only this point can import config, because cfg_path is valid
    try:
      from common import CFG
      from common import config
    except ConfigException as ce:
      print('Failed to read the config file')
      print(ce.get_message())
      raise Exception('Failed to read the config file' + ce.get_message())    
    except Exception as e:
      raise Exception('Failed to read the config file' + str(e))

    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]

    from proxy import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating upgrade prerequisite...")
    if not pi.do_upgrade():
      logging.error("Failed to validate the upgrade prerequisite. \n \
	  Check log file for more detail.")
      raise Exception("Failed to validate the upgrade prerequisite. \n \
	  Check log file for more detail.")

    logging.info("Validation successfully, start upgrade...")
    result = upgrade()

    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        logging.info("Remove temp dir %s ..." % tempDir)
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass    

    if result == 0:
        logging.info("Upgrade completed successfully.")
    else:
        raise Exception("Upgrade failed. Check log file for more detail.")        
    logging.info("-->IM:END")
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')      	     
