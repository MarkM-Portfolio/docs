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


import os, sys, stat, shutil, logging
from datetime import datetime
import os.path

from commands import command

CMD_LIST_MODULE = "icext.install_cmd_list"
UNINSTALL_FOLDER = "installer"

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

def install():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception, e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Installation failed, check log file for more detail.")
    sys.exit(-1)

  roll_list, erro_list = command.exec_commands(cmd_list, False, False)
  
  if len(erro_list) == 0:
    logging.info("Installation successfully.")
    sys.exit()

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  roll_list2, erro_list2 = command.exec_commands(roll_list, True, True)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    #TODO FIXME for better format of failed rollback commands
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")
  sys.exit(-1)

if __name__ == "__main__":
  _init_log()
  
  #arg list: install.py configFile build wasadminID wasadminPW
  if len(sys.argv) < 6:
    error_text = 'Invalid Arguments (%s) for install.py, installation quit now.\n' \
          'Example: install.py configFile buildDir wasadminID wasadminPW acceptLicense' \
          % sys.argv
    logging.error(error_text)
    sys.exit()

  cfg_path = sys.argv[1]
  if os.path.exists(cfg_path) == False \
          or os.path.isfile(cfg_path) == False:
    error_text =  'configFile path (%s) is invalid, installation exit now.' %  cfg_path
    logging.error(error_text)
    sys.exit()
  
  build_path = sys.argv[2]
  if os.path.exists(build_path) == False \
          or os.path.isdir(build_path) == False:
    error_text = 'build path (%s) is invalid, installation exit now.' % build_path
    logging.error(error_text)
    sys.exit()

  from icext.config import CONFIG as CFG
  from icext import config


  config.GWAS_ADMIN_ID = sys.argv[3]
  config.GWAS_ADMIN_PW = sys.argv[4]
  config.GACCEPT_LICENSE =  sys.argv[5]

  from icext import prepare_install
  pi = prepare_install.PrepareInstall()

  logging.info("Validating installation prerequisite...")
  if not pi.do():
    logging.error("Failed to validate the installation prerequisite. \n \
	Check log file for more detail.")
    sys.exit(-1)

  logging.info("Validation successfully, start installation...")

  install()

