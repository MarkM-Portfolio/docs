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

from common import command
from common.utils.docs_optparse import OPTIONS
from util import script_template
from proxy.config_exception import ConfigException

CMD_LIST_MODULE = "proxy.update_webserver_cmd_list"

def install():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Installation failed, check log file for more detail.")
    raise Exception('Install Failed')

  roll_list, erro_list = command.exec_commands(cmd_list, False, False)
  
  if len(erro_list) == 0:
    logging.info("Installation Completed Successfully.")    
    return

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  erro_list2 = command.rollback_commands(roll_list, True, False)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")
  raise Exception('Install Failed')

if __name__ == "__main__":
  try:  
    cfg_path = OPTIONS["-configFile"]
    if os.path.exists(cfg_path) == False \
            or os.path.isfile(cfg_path) == False:
      print('%s Error configFile path (%s) is invalid, instalation exit now.' % (datetime.datetime.now(),cfg_path))
      raise Exception('Install Failed')
    
    build_path = OPTIONS["-build"]
    if os.path.exists(build_path) == False \
            or os.path.isdir(build_path) == False:
      print('%s Error build path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),build_path))
      raise Exception('Install Failed')
    
    #only this point can import config, because cfg_path is valid
    try:
      from common import CFG
      from common import config
    except ConfigException as ce:
      print('Failed to read the config file')
      print(ce.get_message())
      raise ce
    except Exception as e:
      raise e
    
    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]

    from proxy import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating installation prerequisite...")
    if not pi.do():
      logging.error("Failed to validate the installation prerequisite. \n \
    Check log file for more detail.")
      raise Exception('Install Failed')
      
    logging.info("Start installation...")
    result = install()
    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        logging.info("Remove temp dir...")
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass 
    logging.info('-->IM:END')  
  except Exception as e:
    logging.info( "Exception: " + str(e))    
    logging.info('-->IM:FAILED')  