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

from common import command, CFG, config
from common.utils.docs_optparse import OPTIONS
from util import script_template
from docs.config_exception import ConfigException
from common.utils import configfiles

CMD_LIST_MODULE = "docs.install_node_cmd_list"
UNINSTALL_FOLDER = "installer"
finish_status = {'status': -1, 'action': 'Upgrade'}

def upgrade():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Upgrade failed, check log file for more detail.")
    raise Exception("Installation Failed")

  roll_list, erro_list = command.exec_commands(cmd_list, False, False, True)
  
  if len(erro_list) == 0:
    error_info = CFG.get_error_info()
    if len(error_info) == 0:
      logging.info("Upgrade completed successfully.")
    else:
      logging.info("Upgrade completed successfully with some issues, please read the information below.\n\n" + '\n'.join(error_info) )
    finish_status['status'] = 0
    return 0

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  erro_list2 = command.rollback_commands(roll_list, True, True)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Upgrade failed. Check log file for more detail.")

if __name__ == "__main__":
  
  try:
    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]

    from docs import prepare_install
    pi = prepare_install.PrepareInstall()
    logging.info("Validating upgrade prerequisite...")
    if not pi.do_upgrade():
      logging.error("Failed to validate the upgrade prerequisite. \n \
	  Check log file for more detail.")
      raise Exception("Installation Failed")

    logging.info("Start upgrade...")
    result = upgrade()

    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        logging.info("Remove temp dir...")
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass    

    if result == 0:
      logging.info("Upgrade completed successfully.")
    else:
      logging.error("Upgrade failed. Check log file for more detail.")
  
  finally:
    configfiles.write_status(finish_status, CFG.finish_status_file_name)
