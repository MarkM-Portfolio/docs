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

# -*- encoding: utf8 -*-

import os, sys, stat, shutil, logging
from datetime import datetime
import configparser
import traceback
from commands import command

CMD_LIST_MODULE = "icext.install_cmd_list"
UNINSTALL_FOLDER = "installer"
from icext.config_exception import ConfigException

def _init_log():
  #cfg = config.Config()
  log_dir = CFG.get_logs_dir()
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)

  logging.basicConfig(level=logging.DEBUG,\
	format='%(asctime)s %(levelname)s %(message)s',\
	filename=log_dir + os.sep + 'extensionInstall.log',\
	filemode='w')

  console = logging.StreamHandler()
  console.setLevel(logging.INFO)
  formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
  console.setFormatter(formatter)
  logging.getLogger('').addHandler(console)


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
    if not CFG.restart_connections:
      logging.info("Installation Completed Successfully.\n\nPlease restart HCL Connections Files, News, and Common to load the HCL File Viewer Extension.\n")
    else:
      logging.info("Installation completed successfully.")
    return

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  roll_list2, erro_list2 = command.rollback_commands(roll_list, True, True)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    #TODO FIXME for better format of failed rollback commands
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")
  raise Exception('Install Failed')

if __name__ == "__main__":
  try:
    #_init_log()

    #arg list: install.py configFile build wasadminID wasadminPW acceptLicense
    if len(sys.argv) < 6:
      error_text = 'Invalid Arguments (%s) for install.py, installation quit now.\n' \
            'Example: install.py configFile buildDir wasadminID wasadminPW acceptLicense' \
            % sys.argv
      logging.error(error_text)
      raise Exception("Invalid Arguments (%s) for install.py" % sys.argv)

    cfg_path = sys.argv[1]
    if os.path.exists(cfg_path) == False \
            or os.path.isfile(cfg_path) == False:
      error_text =  'configFile path (%s) is invalid, installation exit now.' %  cfg_path
      logging.error(error_text)
      raise Exception("configFile path (%s) is invalid" % cfg_path)

    build_path = sys.argv[2]
    if os.path.exists(build_path) == False \
            or os.path.isdir(build_path) == False:
      error_text = 'build path (%s) is invalid, installation exit now.' % build_path
      logging.error(error_text)
      raise Exception("build path (%s) is invalid." % build_path)

    #only this point can import config, because cfg_path is valid
    try:
      from icext.config import CONFIG as CFG
      from icext import config
    except ConfigException as ce:
      print('Failed to validate config file %s:' % (sys.argv[1]))
      raise Exception(ce.get_message())

    _init_log()

    config.GWAS_ADMIN_ID = sys.argv[3]
    config.GWAS_ADMIN_PW = sys.argv[4]
    config.GACCEPT_LICENSE = sys.argv[5]

    if len(sys.argv) > 6:
      GTIME = sys.argv[6]
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
      process_info.set('info', 'log_file', "extensionInstall.log")

      info_file_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_' + GTIME)
      info_file = open(info_file_path, 'w')
      process_info.write(info_file)
      info_file.close()

      info_file_marker_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_%s_marker' % GTIME)
      info_file_marker = open( info_file_marker_path, 'w')
      info_file_marker.close()

    from icext import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating installation prerequsite...")
    if not pi.do():
      logging.error("Failed to validate the installation prerequisite. \n \
    Check log file for more detail.")
      raise Exception('Install Failed')

    logging.info("Validation successfully, start installation...")

    install()
    logging.info('-->IM:END')
  except Exception as e:
    logging.info( "Exception: " + str(e))
    logging.info('-->IM:FAILED')
