# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************


import os, sys, stat, shutil, logging
from datetime import datetime
import os.path
import traceback
from icext.config_exception import ConfigException
from common import command
from common.utils.docs_optparse import OPTIONS

CMD_LIST_MODULE = "icext.install_cmd_list"
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
    #TODO FIXME for better format of failed rollback commands
    logging.error("Rollback failed for commands: " + str(erro_list2))
  return -1

if __name__ == "__main__":
  try:
    cfg_path = OPTIONS["-configFile"]
    if os.path.exists(cfg_path) == False \
            or os.path.isfile(cfg_path) == False:
      error_text =  'configFile path (%s) is invalid, upgrade exit now.' %  cfg_path
      logging.error(error_text)
      raise Exception(error_text)

    build_path = OPTIONS["-build"]
    if os.path.exists(build_path) == False \
            or os.path.isdir(build_path) == False:
      error_text = 'build path (%s) is invalid, upgrade  exit now.' % build_path
      logging.error(error_text)
      raise Exception(error_text)

    #only this point can import config, because cfg_path is valid
    try:
      from icext.config import CONFIG as CFG
      from icext import config
    except ConfigException as ce:
      print('Failed to read the config file')
      print(ce.get_message())
      print('Refer to the cfg.node.properties.sample file that is in the same location as this script to update the config file.')
      raise Exception("Failed to read the config file." + ce.get_message())
    except Exception as e:
      raise Exception(e.message)

    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]

    from icext import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating upgrade prerequisite...")
    if not pi.do_upgrade():
      logging.error("Failed to validate the upgrade prerequisite. \n \
	  Check log file for more detail.")
      raise Exception('Install Failed')

    logging.info("Validation successfully, start upgrade...")
    result = upgrade()

    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        logging.info("Remove temp dir...")
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass

    if result == 0:
      if not CFG.get_restart_connections():
        logging.info("Upgrade completed successfully."
        "\n\nPlease restart HCL Connections Files, News, and Common to load the HCL Docs Extension.\n")
      else:
        logging.info("Upgrade completed successfully.")
    else:
      raise Exception("Upgrade failed. Check log file for more detail.")
    logging.info("-->IM:END")
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')
