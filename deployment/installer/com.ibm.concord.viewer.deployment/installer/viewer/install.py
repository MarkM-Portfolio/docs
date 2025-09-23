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
import configparser
import traceback

from commands import command
from util import script_template
from viewer.config_exception import ConfigException

CMD_LIST_MODULE = "viewer.install_cmd_list"
UNINSTALL_FOLDER = "installer"

def _init_log():
  #cfg = config.Config()
  log_dir = CFG.get_logs_dir()
  if not os.path.exists(log_dir):
    os.makedirs(log_dir)
  logging.basicConfig(level=logging.DEBUG,
                      format='%(asctime)s %(levelname)s %(message)s',
                      filename=log_dir + os.sep + 'viewerInstall.log',
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

  roll_list, erro_list = command.exec_commands(cmd_list, False, False, CFG.get_map_webserver())
  
  if len(erro_list) == 0:
    logging.info("Installation completed successfully.")
    return None

  logging.error("Error while executing command, now rollback previous changes...")

  # undo changes in reverse order, force all commands being executed, even if one fail
  roll_list2, erro_list2 = command.rollback_commands(roll_list, True, False)
  if len(erro_list2) == 0:
    logging.info("Rollback successfully.")
  else:
    logging.error("Rollback failed for commands: " + str(erro_list2))
  logging.error("Installation failed. Check log file for more detail.")
  raise Exception('Install Failed')

if __name__ == "__main__":
 
  try:
    #arg list: install.py configFile build wasadminID wasadminPW acceptLicense mapWebserver
    if len(sys.argv) < 6:
      print('%s Error Invalid Arguments (%s) for install.py, installation exit now.\n' \
            'Example: install.py configFile buildDir wasadminID wasadminPW acceptLicense mapWebserver' \
                       % (datetime.datetime.now(),sys.argv))
      raise Exception('Install Failed')
    
    cfg_path = sys.argv[1]
    if os.path.exists(cfg_path) == False \
            or os.path.isfile(cfg_path) == False:
      print('%s Error configFile path (%s) is invalid, instalation exit now.' % (datetime.datetime.now(),cfg_path))
      raise Exception('Install Failed')
    
    build_path = sys.argv[2]
    if os.path.exists(build_path) == False \
            or os.path.isdir(build_path) == False:
      print('%s Error build path (%s) is invalid, installation exit now.' % (datetime.datetime.now(),build_path))
      raise Exception('Install Failed')
    
    #only this point can import config, because cfg_path is valid
    try:
      from viewer.config import CONFIG as CFG
      from viewer import config      
    except ConfigException as ce:
      print('Failed to validate config file %s:' % (sys.argv[1]))
      print(ce.get_message())
      raise Exception('Install Failed')
    except Exception as e:
      print(e)
      raise Exception('Install Failed')
    
    _init_log()  
         
    config.GWAS_ADMIN_ID = sys.argv[3]
    config.GWAS_ADMIN_PW = sys.argv[4]
    config.GACCEPT_LICENSE =  sys.argv[5]
    config.GMAP_WEBSERVER = sys.argv[6]
    if len(sys.argv) > 7:    
      GTIME = sys.argv[7]
      # write python process info
      for fl in os.listdir(CFG.get_logs_dir()):
        p = os.path.join(CFG.get_logs_dir(), fl)
        if( os.path.isfile(p) and fl.startswith('python_process_info_') ):
          try:
            os.remove(p)
          except:
            pass
      process_info = configparser.RawConfigParser()
      process_info.add_section('info')
      process_info.set('info', 'log_file', "viewerInstall.log")

      info_file_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_' + GTIME)
      info_file = open(info_file_path, 'w')
      process_info.write(info_file)
      info_file.close()

      info_file_marker_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_%s_marker' % GTIME)
      info_file_marker = open( info_file_marker_path, 'w')
      info_file_marker.close()
    
    from viewer import prepare_install
    pi = prepare_install.PrepareInstall()

    logging.info("Validating installation prerequsite...")
    logging.info('-->IM:Prepare installing viewer server.')
    if not pi.do():
      logging.error("Failed to validate the installation prerequisite. \n \
    Check log file for more detail.")
      raise Exception('Install Failed')

    logging.info("Validation installation prerequsite successfully...")
      
    logging.info("Start installation...")
    install()
    logging.info('-->IM:END')
  except Exception as e:
    logging.info( "Exception: " + str(e))    
    logging.info('-->IM:FAILED')

