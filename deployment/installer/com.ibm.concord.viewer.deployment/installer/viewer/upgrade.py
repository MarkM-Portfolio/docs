# -*- encoding: utf8 -*-
# *****************************************************************
#
# Licensed Materials - Property of IBM.
#
# IBM Docs Source Materials
#
# (c) Copyright IBM Corporation 2012. All Rights Reserved.
#
# U.S. Government Users Restricted Rights: Use, duplication or
# disclosure restricted by GSA ADP Schedule Contract with
# IBM Corp.
#
# *****************************************************************

# -*- encoding: utf8 -*-

import os, sys, stat
import shutil
import logging
import datetime
import pdb
import configparser
from commands import command
from util import script_template
from viewer.config_exception import ConfigException
import traceback


CMD_LIST_MODULE = "viewer.install_cmd_list"
UNINSTALL_FOLDER = "installer"

def _init_log():
  log_dir = CFG.get_logs_dir()
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)
  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_dir + os.sep + 'viewerUpgrade.log',
                      filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)

def upgrade():
  try:
    cmd_list = command.load_commands(CMD_LIST_MODULE)
  except Exception as e:
    logging.exception(e)
    logging.error("Failed to load commands from module: " + CMD_LIST_MODULE)
    logging.error("Upgrade failed, check log file for more detail.")
    return -1

  roll_list, erro_list = command.exec_commands(cmd_list, False, False, CFG.get_map_webserver(),True)

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
    #arg list: upgrade.py configFile build wasadminID wasadminPW acceptLicense mapWebserver
    if len(sys.argv) < 6:
      error_msg = '%s Error Invalid Arguments (%s) for upgrade.py, upgrade exit now.\n' \
          'Example: upgrade.py configFile buildDir wasadminID wasadminPW acceptLicense mapWebserver' \
                     % (datetime.datetime.now(),sys.argv)
      print(error_msg)
      raise Exception(error_msg)

    cfg_path = sys.argv[1]
    if os.path.exists(cfg_path) == False \
          or os.path.isfile(cfg_path) == False:
      error_msg = '%s Error configFile path (%s) is invalid, upgrade exit now.' % (datetime.datetime.now(),cfg_path)
      print(error_msg)
      raise Exception(error_msg)

    build_path = sys.argv[2]
    if os.path.exists(build_path) == False \
          or os.path.isdir(build_path) == False:
      error_msg = '%s Error build path (%s) is invalid, upgrade exit now.' % (datetime.datetime.now(),build_path)
      print(error_msg)
      raise Exception(error_msg)

    #only this point can import config, because cfg_path is valid
    try:
      from viewer.config import CONFIG as CFG
      _init_log()
      import viewer.config_check as config_check
      #config_check.check_path_exist = True

      #pdb.set_trace()
      from viewer.config import CONFIG as CFG
      from viewer import config
    except ConfigException as ce:
      print('Failed to validate config file %s:' % (sys.argv[1]))
      print(ce.get_message())
      raise Exception(ce.get_message())

    config.GWAS_ADMIN_ID = sys.argv[3]
    config.GWAS_ADMIN_PW = sys.argv[4]
    config.GACCEPT_LICENSE =  sys.argv[5]
    config.GMAP_WEBSERVER = sys.argv[6]
    if len(sys.argv) > 7:
      GTIME = sys.argv[7]
      for fl in os.listdir(CFG.get_logs_dir()):
        p = os.path.join(CFG.get_logs_dir(), fl)
        if( os.path.isfile(p) and fl.startswith('python_process_info_') ):
          try:
            os.remove(p)
          except:
            pass
      # write python process info
      process_info = configparser.RawConfigParser()
      process_info.add_section('info')
      process_info.set('info', 'log_file', "viewerUpgrade.log")

      info_file_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_' + GTIME)
      info_file = open(info_file_path, 'w')
      process_info.write(info_file)
      info_file.close()

      info_file_marker_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_%s_marker' % GTIME)
      info_file_marker = open( info_file_marker_path, 'w')
      info_file_marker.close()
    from viewer import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating upgrade prerequisite...")
    if not pi.do_upgrade():
      logging.error("Failed to validate the upgrade prerequisite. \n \
	Check log file for more detail.")
      raise Exception("Failed to validate the upgrade prerequisite.")


    logging.info("Validation successfully, start upgrade...")
    result = upgrade()

    tempDir = CFG.get_temp_dir()
    if (os.path.exists(tempDir)):
      try:
        logging.info("Remove temp dir...")
        shutil.rmtree(tempDir, True)
      except Exception as e:
        pass
    #upgrade should remove the previous SIP and config folder in VIEWER_INSTALL_ROOT
    pre_config_dir=CFG.pre_config_dir
    pre_lib_dir=CFG.get_pre_lib_dir()
    if result==0 and os.path.exists(pre_config_dir):
      try:
        logging.info("Remove old config dir...")
        shutil.rmtree(pre_config_dir, True)
      except Exception as e:
        pass
    if result==0 and os.path.exists(pre_lib_dir):
      try:
        logging.info("Remove old libraries dir...")
        shutil.rmtree(pre_lib_dir, True)
      except Exception as e:
        pass

    if result == 0:
      logging.info("Upgrade completed successfully.")
      logging.info('-->IM:END')
    else:
      logging.error("Upgrade failed. Check log file for more detail.")
      logging.info('-->IM:FAILED')
  except Exception as e:
      logging.info("Exception: "+ str(e))
      logging.info('-->IM:FAILED')
