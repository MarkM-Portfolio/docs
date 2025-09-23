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

import os, sys, stat
import shutil
import logging
import os.path
import datetime
import traceback

from common import command
from common.utils.docs_optparse import OPTIONS
from util import script_template
from docs.config_exception import ConfigException
from common.utils import configfiles

CMD_LIST_MODULE = "docs.install_cmd_list"
UNINSTALL_FOLDER = "installer"

def upgrade():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Upgrade failed, check log file for more detail.")
    return -1

  if OPTIONS.get('-retry', 'false').lower() == 'true':
    cmd_list = command.filter_commands(cmd_list,
                                       lambda x: x.get('exec_in_retry', False))
    roll_list, erro_list = command.exec_commands(cmd_list, False, False, True)
  else:
    roll_list, erro_list = command.exec_commands(cmd_list, False, False, False, True)

  if len(erro_list) == 0:
    error_info = CFG.get_error_info()
    failed_host = None
    if CFG.cluster_info:
      failed_host = [(k, v.get('osType', 'linux')) for k, v in CFG.cluster_info.items()
                     if v.get('finish_status', -1) != 0]
    if len(error_info) == 0:
      if not failed_host or CFG.get_non_job_mgr_mode().lower()=='true':
        logging.info("Upgrade completed successfully.")
        return 0
      else:
        configfiles.write_status(failed_host,
                                 os.path.join(CFG.get_logs_dir(),
                                 'retry_hosts.json'))
        logging.info("Not all remote upgrade jobs complete successfully, please use -retry to restart the upgrade jobs.")
    else:
      logging.info("Upgrade completed successfully with some issues, please read the information below.\n\n" + '\n'.join(error_info))
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
      error_text = '%s Error build path (%s) is invalid, upgrade exit now.' % (current_time,build_path)
      print(error_text)
      raise Exception(error_text)

    #only this point can import config, because cfg_path is valid
    try:
      from common import CFG
      from common import config
    except ConfigException as ce:
      error_text = 'Failed to read the config file.\n' + 'Refer to the cfg.properties.sample file that is in the same location as this script to update the config file.\n' + ce.get_message()
      print(error_text)
      raise Exception(error_text)
    except Exception as e:
      print(str(e))
      raise Exception(e.message)

    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GDB_ADMIN_ID = OPTIONS["-dbadminID"]
    config.GDB_ADMIN_PW = OPTIONS["-dbadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]
    CFG.dealWithLCC()

    from docs import prepare_install
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
        logging.info("Remove temp dir...")
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass

    if result == 0:
      logging.info("Upgrade completed successfully.")
    else:
      raise Exception("Upgrade failed. Check log file for more detail.")
    logging.info('-->IM:END')
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')
