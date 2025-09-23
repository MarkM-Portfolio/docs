# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
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

  roll_list, erro_list = command.exec_commands(cmd_list, False, False, CFG.get_map_webserver())
#  roll_list, erro_list = command.exec_commands(cmd_list, False, False)

  if len(erro_list) == 0:
    #logging.info("Installation Completed Successfully.")
    #sys.exit()
    failed_host = None
    if CFG.cluster_info:
      failed_host = [(k, v.get('osType', 'linux')) for k, v in CFG.cluster_info.items()
                     if v.get('finish_status', -1) != 0]
    if not failed_host or CFG.get_non_job_mgr_mode().lower()=='true':
      logging.info("All installation jobs complete successfully.")
      logging.info("Installation Completed Successfully.")
      shutil.copy(CFG.get_cfg_path(), CFG.get_install_root()) # copy cfg.properties to install_root for upgrade purpose
      return 0
    else:
      configfiles.write_status(failed_host,
                               os.path.join(CFG.get_logs_dir(),
                               'retry_hosts.json'))
      logging.info("Not all remote installation jobs complete successfully!")

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
      print('Refer to the cfg.properties.sample file that is in the same location as this script to update the config file.')
      raise Exception('Install Failed')
    except Exception as e:
      raise e

    config.GWAS_ADMIN_ID = OPTIONS["-wasadminID"]
    config.GWAS_ADMIN_PW = OPTIONS["-wasadminPW"]
    config.GDB_ADMIN_ID = OPTIONS["-dbadminID"]
    config.GDB_ADMIN_PW = OPTIONS["-dbadminPW"]
    config.GACCEPT_LICENSE = OPTIONS["-acceptLicense"]
    config.GSILENTLY_INSTALL = OPTIONS["-silentlyInstall"]
    config.GMAP_WEBSERVER = OPTIONS["-mapWebserver"]
    #handle LC_config_xml_path for that not able to get info from was env
    CFG.dealWithLCC()

    from docs import prepare_install
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
    if result==0:
      logging.info("Installation Completed Successfully.")
      logging.info('-->IM:END')
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')
