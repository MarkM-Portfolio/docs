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

# -*- encoding: utf8 -*-

import os, sys
import string
import configparser
import logging
import pdb
from configparser import NoSectionError, NoOptionError

from util import read_wscred
from util.common import call_wsadmin
from .config_exception import ConfigException

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GACCEPT_LICENSE = None
IC_PROVISION_PATH=None
INSTALL_MODE = None
#IC_VERSION_MODE = {"3.0": "IS_EAR", "3.5": "IS_JAR"}

class Config:
  def __init__(self):
    self._cf = configparser.SafeConfigParser()
    if len(sys.argv) > 1:
      #self._cf.readfp(open(sys.argv[1]))
      self.cfg_path = sys.argv[1]
    else:
      #self._cf.readfp(open("cfg.properties"))
      self.cfg_path = "./cfg.properties"
    #try:
    self._cf.readfp(open(self.cfg_path))
      
    items = dict(self._cf.items("ICExt"))
    # hard code fix for was_dm_profile_root
    if 'was_dm_profile_root' in items:
       logging.error("'was_dm_profile_root' is an outdated configuration item.  Please remove it and specify 'was_install_root' in %s, and start the installation again." % self.cfg_path) 
       raise Exception("'was_dm_profile_root' is an outdated configuration item.")
        
    from .config_check import do_check
    do_check(items)
      
    #except Exception, e:
    #  logging.error(e)
      #logging.error("Error occurred when validating the configuration file %s" % self.cfg_path)
    #  sys.exit()
      
    self.error_list = []
    self.component_name = "icext"
    self.install_root = self.get_option_value("ICExt","ext_install_root")
    #pdb.set_trace()
    if self.install_root == None:
      logging.error("Please specify 'ext_install_root' in %s, and start the installation again." % self.cfg_path)
      raise Exception("Cannot find 'ext_install_root'.")
    else:
      if not os.path.exists(self.install_root):
      	try:
      	  os.makedirs(self.install_root)
      	except Exception as e:
      	  logging.error("Can not creating install root directory '%s'.  Please check your configuration file." % self.install_root)
      	  raise Exception("Can not creating install root directory '%s'." % self.install_root)
      else:
        if not os.access(self.install_root, os.W_OK):
          logging.error("Can not access install root directory '%s'.  Please check your configuration file." % self.install_root)
          raise Exception("Can not access install root directory '%s'." % self.install_root)

    self.temp_dir = self.install_root + "/temp"
    self.config_dir = self.install_root + "/config"
    
    self.was_install_root = self.get_option_value("ICExt","was_install_root")
    
    self.was_soap_port = int(self.get_option_value("ICExt","was_soap_port"))
    
    try:
      self.get_option_value("ICExt","files_scope").lower()
      self.get_option_value("ICExt","news_scope").lower()
      self.get_option_value("ICExt","common_scope").lower()
      self.get_option_value("ICExt","restart_connections").lower()
      self.get_option_value("ICExt","ic_extension_path").lower()
      self.get_option_value("ICExt","deamon_shared_path").lower()
      # self.get_option_value("ICExt","ccm_enabled").lower()
    except Exception:
      self.create_new_config(self.cfg_path, \
        os.path.join(self.get_build_dir(), "installer", "cfg.properties"), \
        self.cfg_path + ".latest", False, False, True)
      logging.error("The configuration file is out of date.\n  A new file %s is generated with the values merged.  Please fill in all configuration options, and rename it to %s." \
        % (self.cfg_path + ".latest", self.cfg_path))
      raise Exception("The configuration file is out of date.")
      
    scope_option = self.get_option_value("ICExt","files_scope").lower()
    if scope_option == "a" or scope_option.lower() == 'cluster':
      self.scope_type ="cluster"
    elif scope_option == "b" or scope_option.lower() == 'server':
      self.scope_type ="server"
    else:
      logging.error("Exception thrown while checking files scope type.Make sure scope is set correctly.")
      raise Exception("Failed to check files scope type.")
      
    self.scope_name = self.get_option_value("ICExt","files_scope_name")
    
    #self.ic_version = self.get_option_value("ICExt","ic_version")
    if self.scope_type.lower() == "server":
      self.node_name = self.get_option_value("ICExt","files_node_name")
    else:
      self.node_name = ""

    self.app_scope = {}
    for app in ['news', 'common']:
      self.app_scope[app] = {}
      scope_option2 = self.get_option_value("ICExt",app + "_scope").lower()
      if scope_option2 == "a" or scope_option2.lower() == 'cluster':
        self.app_scope[app]['scope_type'] ="cluster"
      elif scope_option2 == "b" or scope_option2.lower() == 'server':
        self.app_scope[app]['scope_type'] ="server"
      else:
        logging.error("Exception thrown while checking news scope type.Make sure scope is set correctly.")
        raise Exception("Failed to check news scope type.")
      
      self.app_scope[app]['scope_name'] = self.get_option_value("ICExt", app + "_scope_name")
      if self.app_scope[app]['scope_type'].lower() == "server":
        self.app_scope[app]['node_name'] = self.get_option_value("ICExt", app + "_node_name")
      else:
        self.app_scope[app]['node_name'] = ""

    self.was_adminid = None
    self.was_adminpw = None
    #never read was credentials from cfg file
    #self.was_adminid = self.get_option_value("ICExt","was_admin_id")
    #self.was_adminpw = self.get_option_value("ICExt","was_admin_pw")

    enable_upload_conversion= self.get_option_value("ICExt", "enable_upload_conversion")
    if enable_upload_conversion == None:
      self.ignore_event = self.get_option_value("ICExt", "ignore_event").lower()
    else:
      if enable_upload_conversion.lower() == "yes":
        self.ignore_event ="false"
      elif enable_upload_conversion.lower() == "no":
        self.ignore_event ="true"
      else:
        logging.error("Exception thrown while checking enable_upload_conversion.Make sure enable_upload_conversion is set correctly.")
        raise Exception("Failed to check enable_upload_conversion.")
    self.viewer_server_url = self.get_option_value("ICExt", "viewer_server_url")
    self.context_root="/viewer"
    self.restart_connections = self.get_option_value("ICExt", "restart_connections").lower() == 'true'
    # self.ccm_enabled = self.get_option_value("ICExt", "ccm_enabled").lower() == 'true'

    #if self.has_option("ICExt", "viewer_url_prefix"):
    #  self.context_root = self.get_option_value("ICExt", "viewer_url_prefix") 
    #else:
    #  self.context_root = None
    #self.get_connection_share_path()
  
    self.product_dir = self.install_root + "/product"
    self.version_dir = self.install_root + "/version"
    self.logs_dir = self.install_root + "/logs"
    self.temp_dir = self.install_root + "/temp"
    
    self.version_value = None    
    self.current_version_value = None
    self.get_current_version_value()
    self.lc_config = ['LotusConnections-config', 'LotusConnections-config.xml']
	
    self.is_dmgr_on_host = None

    self.cell_name = None

  def get_cell_name(self):
    if self.cell_name == None: 
      args = self.get_was_cmd_line()
      args.extend(["-f",  "./icext/tasks/get_cell_name.py"])
      succ, ws_out = call_wsadmin(args)
      if ws_out.find("cellname: ") < 0:
        raise Exception("Didn't get the cell name")
    
      cell_name = ws_out[(ws_out.find('cellname: ') + 10) : len(ws_out)]
      if cell_name.find('\n') >= 0:
        cell_name = cell_name[0 : cell_name.find('\n')]
      self.cell_name = cell_name
    return self.cell_name

  def set_is_dmgr_on_host(self, value):
    self.is_dmgr_on_host = value
  
  def get_is_dmgr_on_host(self):
    return self.is_dmgr_on_host
    
  def get_license_accept(self):
    if GACCEPT_LICENSE.lower() == 'true':
      return True
    else:
      return False

  def get_config_dir(self):
    return self.config_dir
      
  def get_context_root(self):
    return self.context_root 

  def get_product_dir(self):
    return self.product_dir
  
  def get_ignore_event(self):
    return self.ignore_event
  
  def get_viewer_server_url(self):
    return self.viewer_server_url
  
  def get_cfg_path(self):
    return self.cfg_path

  def get_temp_dir(self):
    return self.temp_dir

  def get_icext_jar_location(self):
    jar_location = ''
    if self.has_option('ICExt','ic_extension_path'):
      jar_location = self.get_option_value('ICExt','ic_extension_path')
    return jar_location.strip()

  def get_daemon_location(self):
    daemon_location = ''
    if self.has_option('ICExt','deamon_shared_path'):
      daemon_location = self.get_option_value('ICExt','deamon_shared_path')
    return daemon_location.strip()
    
  def get_old_daemon_location(self):
    try:
      return self.get_option_value("ICExt", "daemon_shared_path")
    except Exception as e:
      return None

  def get_icext_mode(self):
    #ic_version = "3.0" #FIXME logic to retrieve IC versions
    
    '''
    High_Version = 3.5
    Low_Version = 3.0 

    try:
        version_text = self.ic_version.strip()
        if version_text == '': # No input value
            version = High_Version
        elif version_text.find('.') < 0 : # for example: 3, 4 
            version = float(version_text)
        else:
            version = float('.'.join(version_text.split('.')[0:2])) # for 3.0.1 or 3.6.0.1
    except ValueError:
        version = High_Version # for other characters


    if version < High_Version :
        version = str(Low_Version)
    else :
        version = str(High_Version)

    return IC_VERSION_MODE[version]  
    '''
    return "IS_JAR"
	
  def get_build_dir(self):
    if len(sys.argv) < 3:
      return "../"
    else:
      return sys.argv[2]

  def has_option(self, section, option):
    return self._cf.has_option(section, option)

  def get_option_value(self, section, option):
    value = self._cf.get(section, option)
    return value

  def get_component_name(self):
    return self.component_name

  def get_install_root(self):
    return self.install_root

  def get_wsadmin_script(self):
    was_admin = ""
    if os.name == "nt":
      was_admin = self.was_install_root + "/bin/wsadmin.bat"
    else:
      was_admin = self.was_install_root + "/bin/wsadmin.sh"

    return was_admin

  def _read_was_credential(self):
    global GWAS_ADMIN_ID
    global GWAS_ADMIN_PW
    if GWAS_ADMIN_ID == None or GWAS_ADMIN_PW == None or \
    GWAS_ADMIN_ID == '' or GWAS_ADMIN_PW == '' :
      if self.was_adminid == None or self.was_adminpw == None or \
        self.was_adminid == "" or self.was_adminpw == "" :
        name, pw = read_wscred.read_was_credential()
        self.was_adminid = name
        self.was_adminpw = pw
        GWAS_ADMIN_ID = name
        GWAS_ADMIN_PW = pw
    else:
      self.was_adminid = GWAS_ADMIN_ID
      self.was_adminpw = GWAS_ADMIN_PW

  def get_was_adminid(self):
    self._read_was_credential()
    return self.was_adminid

  def get_was_adminpw(self):
    self._read_was_credential()
    return self.was_adminpw

  def get_soap_port(self):
    return self.was_soap_port

  def get_scope_type(self):
    return self.scope_type

  def get_scope_name(self):
    return self.scope_name

  def get_node_name(self):
    return self.node_name
  
  def get_app_scope_type(self, app):
    if self.app_scope[app]['scope_type']:
      return self.app_scope[app]['scope_type']
    else:
      return "server"

  def get_app_scope_name(self, app):
    return self.app_scope[app]['scope_name']

  def get_app_node_name(self, app):
    return self.app_scope[app]['node_name']

  def get_scope_full_name(self):
    fullname = ""
    if self.scope_type.lower() == "server":
      fullname = "".join(["/Node:", \
                 self.node_name, \
                 "/Server:", self.scope_name, \
                 "/"])
    else:
      fullname = "/ServerCluster:" + self.scope_name + "/"

    return fullname

  def get_version_least(self):
    return "8.0.0.0"

  def get_app_name(self):
    return "ViewerLCCustomizeApp"

  def get_unstall_app_name(self):
    return "ViewerLCCustomizeApp"
  def get_was_cmd_line(self):
    args = []
    args.extend([self.get_wsadmin_script()])
    args.extend(["-lang", "jython"])
    args.extend(["-port", str(self.get_soap_port())])
    args.extend(["-user", self.get_was_adminid() ])
    args.extend(["-password", self.get_was_adminpw() ])
    return args

  def prepare_scope(self):
    servers = []
    clusters = []
    if self.get_scope_type().lower() == "cluster":
      clusters.append(self.get_scope_name())
    else:
      server={}
      server["nodename"] = self.get_node_name()
      server["servername"] = self.get_scope_name()
      servers.append(server)

    return (servers, clusters)

  def prepare_app_scope(self, app):
    servers = []
    clusters = []
    if self.app_scope[app]['scope_type'].lower() == "cluster":
      clusters.append(self.app_scope[app]['scope_name'])
    else:
      server={}
      server["nodename"] = self.app_scope[app]['node_name']
      server["servername"] = self.app_scope[app]['scope_name']
      servers.append(server)

    return (servers, clusters)

  
  def get_version_dir(self):
    return self.version_dir
  
  def get_current_version_value(self):
    if self.current_version_value:
      return self.current_version_value
      
    version_txt = os.path.join(self.get_version_dir(), 'version.txt')
    # check version.txt in install root first
    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
      # if not find version.txt in install root, check it in product dir
      version_txt = os.path.join(self.get_product_dir(),'installer','version.txt')
      if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
        # this is installation without install root.
        self.current_version_value = '1.0.0'
        return self.current_version_value
    version_info = ''
    for line in open(version_txt):
      version_info += line.strip(' \r\n\t')
    version_info = eval(version_info)
    self.current_version_value = version_info['build_version']
    
    return self.current_version_value

  def get_version_value(self):
    if self.version_value is not None:
      return self.version_value
      
    version_txt = os.path.join(self.get_build_dir(),'installer','version.txt')
    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
      return None
      
    version_info = ''
    for line in open(version_txt):
      version_info += line.strip(' \r\n\t')
    version_info = eval(version_info)
    self.version_value = version_info['build_version']
    
    return self.version_value
  
  def get_option_value(self, section, option):
    try:
      value = self._cf.get(section, option)
      return value
    except NoOptionError as noe:
      self.error_list.append(option)
      return None
    except Error as err:
      raise ConfigException(err)

  def get_restart_connections (self):
    return self.restart_connections
  
  # def get_ccm_enabled (self):
  #   return self.ccm_enabled
      
  def get_raw_key_value (self):
    return self._cf.items("ICExt")
  
  def get_logs_dir(self):
    return self.logs_dir
  
  def create_new_config(self, old, template, target, exit_on_no_value, v102, merge):
    logging.info("Start to create new response file")
    
    section = "ICExt"
    new_conf = configparser.SafeConfigParser()
    new_conf.readfp(open(template))
    keys = new_conf.options(section)
    
    old_conf = configparser.SafeConfigParser()
    old_conf.readfp(open(old))
    old_keys = old_conf.options(section)
    
    #compare two option sets, if keys are identical, return
    if len(keys) == len(old_keys) :
      same = True
      for key in keys :
        if key not in old_keys :
          same = False
          break
      if same:
      	logging.info("Response files are same, skip creating new configuration file") 
      	return False
    
    
    changed_keys = {"ignore_event": "enable_upload_conversion"}
    # new_keys = ["ext_install_root"]  ext_install_root is always required to be filled in
    new_keys = []
    if v102:
      changed_keys = {"ignore_event": "enable_upload_conversion", \
        #"was_install_root": "was_dm_profile_root", \
        "scope": "files_scope", \
        "scope_name" : "files_scope_name", \
        "node_name" : "files_node_name"}
      # new_keys = ["ext_install_root", "news_scope", "news_scope_name", "news_node_name", "viewer_server_url", "was_dm_profile_root"]
      new_keys = ["auth_type","viewer_admin_j2c_alias","news_scope", "news_scope_name", "news_node_name","common_scope", "common_scope_name", "common_node_name", "viewer_server_url", "was_dm_profile_root", 'restart_connections', 'ccm_enabled']
      
    optional_keys = {}
    # optional_keys are not requred anymore, should be removed
    if os.name == "nt":
      optional_keys['ext_install_root'] ="C:/IBM/FileViewer/extension"
    else:
      optional_keys['ext_install_root'] ="/opt/IBM/FileViewer/extension"	

    
    for key in old_keys:
      if new_conf.has_option(section, key):
        new_conf.set(section, key, self.get_option(old_conf, section, key))
      elif key in changed_keys:
        new_conf.set(section, changed_keys[key], self.get_option(old_conf, section, key))

    for key in new_keys:
      if key in old_keys:
        logging.info(key + " is available in cfg.properties")
      elif key in optional_keys:
        # set the optional property to nothing
        new_conf.set(section, key, optional_keys[key])
      else:
        logging.info("No value for " + key)
        if exit_on_no_value:
          return False

    #begin to copy file
    if os.path.exists(target):
      os.remove(target)
    new_cfg = open (target, "w")
    template_cfg = open(template)
    for line in template_cfg:
      line= line.strip(' \r\n\t')
      if not line.startswith("#") and not line.startswith("["):
        try:
          items = line.split("=")
          if new_conf.has_option(section, items[0]):
            if items[0] in new_keys and merge:
              new_cfg.write(items[0] + "=")
            else:
              new_cfg.write(items[0] + "=" + new_conf.get(section, items[0]))
        except Exception as e:
          print(e)
      else:
        new_cfg.write(line)
      new_cfg.write("\n")
    new_cfg.close()
    
    logging.info("Successfully created new response file")

  def get_option(self, conf, section, option):
    ret = conf.get(section, option)
    if option == 'files_scope' or option == 'news_scope' or option == 'scope':
      value = conf.get(section, option)
      if(value.lower() == 'cluster' or value.lower() == 'a'):
        ret = 'Cluster'
      elif(value.lower() == 'server' or value.lower() == 'b'):
        ret = 'Server'
    elif option == 'ignore_event':
      if not conf.getboolean(section, option):
        ret = 'Yes'
      else:
        ret = 'No'
    return ret
    

CONFIG=Config()
