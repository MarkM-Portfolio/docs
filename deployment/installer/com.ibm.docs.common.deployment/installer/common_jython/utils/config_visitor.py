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

import os
import logging
import sys
import datetime
import ConfigParser
import socket
from common_jython.utils.docs_optparse import OPTIONS
import shutil

# component to properties map
name_map = {
  'conversion' : {'install_root_key': 'conversion_install_root',
                  'section' : 'Conversion'},
  'docs' : {'install_root_key': 'docs_install_root',
            'section' : 'Docs'},
  'proxy' : {'install_root_key': 'docs_install_root',
             'section' : 'Proxy'},
  'icext' : {'install_root_key': 'ext_install_root',
             'section' : 'ICExt' }
}

def _samefile(src, dst):
    # Macintosh, Unix.
    if hasattr(os.path,'samefile'):
        try:
            return os.path.samefile(src, dst)
        except OSError:
            return False

    # All other platforms: check for same pathname.
    return (os.path.normcase(os.path.abspath(src)) ==
            os.path.normcase(os.path.abspath(dst)))

def check_missing_options(CFG, refer_file='cfg.properties'):
  missing_count = len(CFG.error_list)
  if not missing_count: 
    return
  
  options = [ '"%s"' % o for o in CFG.error_list]
  options_tense = 'option'
  if missing_count > 1:
    options = options[:-2] + [' and '.join(options[-2:])]
    options_tense = 'options'
  options = ', '.join(options)

  old_cfg = os.path.abspath(CFG.cfg_path)
  new_cfg_dir = os.path.join(os.path.abspath(CFG.get_build_dir()), 'installer')
  error_msg = 'The configure file %s is not up to date. ' \
          'You must add the missing %s: %s. ' \
          'See the latest %s template in %s.' \
          % (old_cfg, options_tense, options, refer_file, new_cfg_dir)
  logging.error(error_msg)
  raise Exception(error_msg)

def check_zlib():
  try:
    import zlib
    message = 'abcdefg'
    compressed = zlib.compress(message)
    decompressed = zlib.decompress(compressed)
    if message != decompressed:
       logging.error('Check zlib module failed.')
       return False
       
    return True    
  except ImportError, e:
    logging.error('Import zlib module failed.')
    logging.error( "Exception: " + str(e))
    return False
  except Exception, e:
    logging.error('Check zlib module failed.')
    logging.error( "Exception: " + str(e))
    return False
    
def pre_visit(CFG):
  """Merge cfg.properties for upgrade."""
  component = CFG.get_component_name()
  section = name_map[component]['section']
  command_line = OPTIONS["command"]
  build_path = OPTIONS["-build"]
  if command_line.find("upgrade_node") > 0:
    src_cfg_path = build_path + os.sep + "installer" + os.sep + "cfg.node.properties"
    merge_cfg_file(section, src_cfg_path, CFG.get_cfg_path())
  elif command_line.find("upgrade") > 0:
    src_cfg_path = build_path + os.sep + "installer" + os.sep + "cfg.properties"
    merge_cfg_file(section, src_cfg_path, CFG.get_cfg_path())

  copy_cfg_files()
  
  if check_zlib() == False:
    raise Exception('Install Failed') 

  im = OPTIONS["-im"]
  if im == 'true':
    setattr(CFG, 'is_im', True)
  else:
    setattr(CFG, 'is_im', False)

    
# for non-default -configFile parameter
def copy_cfg_files():
  input_cfg_path = OPTIONS["-configFile"]
  if not _samefile(input_cfg_path, "./cfg.properties"):
    shutil.copy(input_cfg_path, "./cfg.properties")
    input_cfg_node_path = os.path.join(os.path.dirname(input_cfg_path), "./cfg.node.properties")
    if os.path.isfile(input_cfg_node_path) and not _samefile(input_cfg_node_path, "./cfg.node.properties"):
      shutil.copy(input_cfg_node_path, "./cfg.node.properties")  

def merge_cfg_file(section, src_cfg_path, dest_cfg_path):
  """
  Merge two config file, copying the key-value pairs from src_cfg_path 
  to dest_cfg_path if they do not exist in dest_cfg_path.
  """
  src_cfg_parser = ConfigParser.SafeConfigParser()
  src_cfg_parser.readfp(open(src_cfg_path))
  src_cfg_options = src_cfg_parser.options(section)
  
  dest_cfg_parser = ConfigParser.SafeConfigParser()
  dest_cfg_parser.readfp(open(dest_cfg_path))
  dest_cfg_options = dest_cfg_parser.options(section)
  
  to_merge = {}
  for option in src_cfg_options:
    if option not in dest_cfg_options:
      value = src_cfg_parser.get(section, option)
      to_merge[option] = value
  
  dest_cfg_file = open(dest_cfg_path, 'a')
  for option, value in to_merge.iteritems():
    dest_cfg_file.write('\n%s=%s\n' % (option, value))
  dest_cfg_file.close()

def visit (CFG):
  add_common_options(CFG)
  set_temp_directory(CFG)
  
def add_common_options (CFG):
  setattr(CFG, 'timestamp', datetime.datetime.now().strftime("%Y%m%d_%H%M%S"))  # add install root on node property
  hostname = socket.getfqdn()
  if hostname == None or hostname.strip() == '':
    hostname = socket.gethostname()
  setattr(CFG, 'me_hostname', hostname) # add me_hostname
  # add install root on node property
  setattr(CFG, 'install_root_on_node', None)
  cfg_node_path = os.path.join(CFG.get_build_dir(), 'installer', 'cfg.node.properties')
  cfg_path = os.path.join(CFG.get_build_dir(), 'installer', 'cfg.properties')
  if CFG.get_scope_type().lower() == "server":
    shutil.copy(cfg_path, cfg_node_path)      	
  logging.info("server scope is " + CFG.get_scope_type())
  if os.path.isfile(cfg_node_path):  
    section = name_map[CFG.component_name]['section']
    install_root_key = name_map[CFG.component_name]['install_root_key']
    cfg_parser= ConfigParser.SafeConfigParser()
    prop_file=open(cfg_node_path)
    cfg_parser.readfp(prop_file)
    prop_file.close()
    if cfg_parser.has_option(section, install_root_key):    
      install_root_on_node = cfg_parser.get(section, install_root_key)
      install_root_on_node = install_root_on_node.replace("\\","/")
      setattr(CFG, 'install_root_on_node', install_root_on_node)

def set_temp_directory(CFG):
  str = sys.argv[0]
  if str.endswith("_node.py"):
     CFG.temp_dir = CFG.install_root + '/' + "temp_node"
  else:
     CFG.temp_dir = CFG.install_root + '/' + "temp"    
