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
from common.utils import configfiles
from util import script_template

try:
  import json
except ImportError: 
  import simplejson as json

CMD_LIST_MODULE = "conversion.install_node_cmd_list"
UNINSTALL_FOLDER = "installer"

finish_status = {'status': -1, 'action': 'Installation'}

def install():

  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Installation failed, check log file for more detail.")
    raise Exception("Installation Failed")

  roll_list, erro_list = command.exec_commands(cmd_list, False, False)
  
  if len(erro_list) == 0:
    logging.info("Deployment on node completed successfully.")
    finish_status['status'] = 0
  else:
    logging.error("Error while executing command, now rollback previous changes...")

    # undo changes in reverse order, force all commands being executed, even if one fail
    erro_list2 = command.rollback_commands(roll_list, True, False)
    if len(erro_list2) == 0:
      logging.info("Rollback successfully.")
    else:
      logging.error("Rollback failed for commands: " + str(erro_list2))
    logging.error("Deployment on node failed. Check log file for more detail.")
    finish_status['status'] = -1

if __name__ == "__main__":

  try:
    build_path = OPTIONS["-build"]
    if not os.path.isdir(build_path):
      print(('%s Error build path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),build_path)))
      raise Exception("Installation Failed")
      
    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]
    config.INSTALL_MODE = 'node'

    from conversion import prepare_install
    pi = prepare_install.PrepareInstall()
    logging.info("Validating installation prerequsite...")
    if not pi.do():
      logging.error("Failed to validate the installation prerequisite.\n"
                    "Check log file for more detail.")
      raise Exception("Installation Failed")

    logging.info("Start installation...")
    install()
  finally:
    configfiles.write_status(finish_status, CFG.finish_status_file_name)
    
  

