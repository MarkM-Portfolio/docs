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


import os, sys, shutil, logging
from datetime import datetime

from icext.config import CONFIG as CFG
from commands import command
from icext import config

UNINSTALL_FOLDER = "installer"
CMD_LIST_MODULE = "icext.install_cmd_list"

def _init_log():
  #cfg = config.Config()
  logging.basicConfig(level=logging.DEBUG,\
	format='%(asctime)s %(levelname)s %(message)s',\
	filename='./%s.log' % (datetime.now().strftime("%Y-%m-%d")),\
	filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def uninstall():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception, e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Uninstall failed, check log file for more detail.")
    sys.exit(-1)

  roll_list, erro_list = command.exec_commands(cmd_list, True, True)
  
  if len(erro_list) == 0:
    #_clean()
    logging.info("Uninstall successfully.")
    sys.exit()
  else:
    logging.error("Uninstall completed with errors, check log file for more detail.")
    sys.exit(-1)


if __name__ == "__main__":
  _init_log()
 
  if len(sys.argv) < 3:
    logging.error("Invalid Arguments")
    sys.exit()
 
  config.GWAS_ADMIN_ID = sys.argv[3]
  config.GWAS_ADMIN_PW = sys.argv[4]

  from icext import prepare_uninstall
  pi = prepare_uninstall.PrepareUninstall()

  logging.info("Validating uninstallation prerequsite...")
  if not pi.do():
    logging.error("Failed to validate the uninstallation prerequisite. \n \
	Check log file for more detail.")
    sys.exit(-1)

  logging.info("Validation successfully, start uninstalling...")
  uninstall()

