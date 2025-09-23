# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

"""
The common package for installers, include common command and utls.
"""
import sys
if not sys.platform.lower().startswith('java'):

  import logging, sys, os
  import inspect
  import ConfigParser
  import shutil
  from common_jython.utils.docs_optparse import OPTIONS

  (frame, caller_filename, line_number,
   function_name, lines, index) = inspect.getouterframes(inspect.currentframe())[1]

  main_entry = os.path.basename(caller_filename)[:-3]

  # init essential config first
  def init_essential(properties_section, install_root_key, caller_filename):
    cfg_parser= ConfigParser.SafeConfigParser()
    cfg_path = OPTIONS["-configFile"]
    if caller_filename.endswith('upgrade_node.py'):
      real_cfg_path = cfg_path[0:-19] + 'cfg.properties'
      if not os.path.isfile(cfg_path):
        shutil.copy(real_cfg_path, cfg_path)
    try:
      cfg_path = os.path.normpath(cfg_path)
      cfg_parser.readfp(open(cfg_path))
      install_root = cfg_parser.get(properties_section, install_root_key)
      if properties_section == 'Proxy':
        logs_dir = os.path.join( install_root, "proxy", 'logs')
      else:
        logs_dir = os.path.join( install_root, 'logs')
    except Exception, e:
      print repr(e) + '.',
      error_msg = "Cannot get the property %s from the configuration file: %s." % (install_root_key, cfg_path)
      print error_msg
      raise Exception(error_msg)

    # init logs
    global log_file
    log_file = '%s_%s.log' % (properties_section, os.path.basename(caller_filename)[:-3])
    log_file = log_file.lower()
    if not os.path.exists(logs_dir):
      os.makedirs(logs_dir)
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(message)s',
                        filename=os.path.join(logs_dir, log_file),
                        filemode='w')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

  # read the version.txt in the install directory.
  product_path = OPTIONS["-build"]
  version_txt = os.path.join(product_path, 'installer', 'version.txt')
  if not os.path.isfile(version_txt):
    print "No version.txt found!"

  version_info = "".join( [line.strip(' \r\n\t') for line in open(version_txt)] )
  version_info = eval(version_info)
  log_file = ""
  # product specified variable, supply common names for this package
  product_script_directory = ''
  if version_info['product_name'] == 'IBM Conversion' or version_info['product_name'] == 'HCL Conversion':
    product_script_directory = 'conversion'
    init_essential('Conversion', 'conversion_install_root', caller_filename)
    from conversion.config import CONFIG as CFG
    from conversion import config
    from common_jython.utils.log import conversion_config_log as config_log
  elif version_info['product_name'] == 'HCL Docs' or version_info['product_name'] == 'HCL Docs' or version_info['product_name'] == 'HCL Connections Docs':
    product_script_directory = 'docs'
    init_essential('Docs', 'docs_install_root', caller_filename)
    from docs.config import CONFIG as CFG
    from docs import config
    from common_jython.utils.log import concord_config_log as config_log
  elif version_info['product_name'] == 'HCL Docs Proxy' or version_info['product_name'] == 'HCL Docs Proxy':
    product_script_directory = 'proxy'
    init_essential('Proxy', 'docs_install_root', caller_filename)
    from proxy.config import CONFIG as CFG
    from proxy import config
    from common_jython.utils.log import concord_config_log as config_log
  elif version_info['product_name'] == 'HCL Docs Extension' or version_info['product_name'] == 'HCL Docs Extension':
    product_script_directory = 'icext'
    init_essential('ICExt', 'ext_install_root', caller_filename)
    from icext.config import CONFIG as CFG
    from icext import config
    from common_jython.utils.log import docs_daemon_config_log as config_log


  TASK_DIRECTORY = ''.join( [ './', product_script_directory, '/tasks/' ] )

  for fl in os.listdir(CFG.get_logs_dir()):
    p = os.path.join(CFG.get_logs_dir(), fl)
    if( os.path.isfile(p) and ( fl.startswith('python_process_info_') or fl == 'retry_hosts.json') ):
      try:
        os.remove(p)
      except:
        pass

  # write python process info
  process_info = ConfigParser.RawConfigParser()
  process_info.add_section('info')
  process_info.set('info', 'log_file', log_file)

  info_file_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_' + OPTIONS.get('-time', CFG.timestamp))
  info_file = open(info_file_path, 'w')
  process_info.write(info_file)
  info_file.close()

  info_file_marker_path = os.path.join(CFG.get_logs_dir(), 'python_process_info_%s_marker' % OPTIONS.get('-time', CFG.timestamp))
  info_file_marker = open( info_file_marker_path, 'w')
  info_file_marker.close()

  # names exported from common_jython package
  from common.commands import command
  from common.commands.show_license import ShowLicense
  from common_jython.utils.files import call_wsadmin, ZipCompat, FileInstall, check_version, get_upgrade_type, parse_ws_map, split_lines, backup_file
  from common_jython.utils import was_cmd_util, configfiles
  from common_jython.utils.log import was_log
  from common_jython.utils import common_dict
  from common_jython.utils.hunging_check import HungingCheck
  from common_jython.utils.promoting_check import PromotingCheck
  from common_jython.utils import check_tasks
  from common_jython.utils import precheck_factory
  from common_jython.utils import was_cmd_util
  from common_jython.utils import was

  __all__ = [
    'was',
    'was_cmd_util',
    'product_script_directory',
    'version_txt',
    'version_info',
    'TASK_DIRECTORY',
    'Command',
    'load_commands',
    'exec_commands',
    'CFG',
    'config',
    'config_log',
    'configfiles',
    'was_log',
    'call_wsadmin',
    'was_cmd_util',
    'ShowLicense',
    'ZipCompat',
    'FileInstall',
    'check_version',
    'get_upgrade_type',
    'parse_ws_map',
    'split_lines',
    'backup_file',
    'common_dict',
    'HungingCheck',
    'PromotingCheck',
    'check_tasks',
    'precheck_factory',
    'OPTIONS'
  ]
