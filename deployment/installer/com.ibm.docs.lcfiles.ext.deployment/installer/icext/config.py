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


import os, sys
import string
import configparser
from configparser import NoSectionError, NoOptionError, Error

from util import read_wscred
from .config_exception import ConfigException
from common.utils import config_visitor
from common.utils.files import call_wsadmin
from common.utils.docs_optparse import OPTIONS
from common import version_info

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GACCEPT_LICENSE = None
GSILENTLY_INSTALL = None
GUPGRADE = None
INSTALL_MODE = None
IC_VERSION_MODE = {"3.0": "IS_EAR", "3.5": "IS_JAR"}

key_name_mapping = {'was_dm_profile_root':'was_install_root',}

class Config:
  def __init__(self):
    self.cell_name = None
    self._cf = configparser.SafeConfigParser()
    self.cfg_path = OPTIONS["-configFile"]
    
    self.component_name = "icext"
    # merge cfg.properties for upgrade
    config_visitor.pre_visit(self)

    self._cf.readfp(open(self.cfg_path))
    
    self.error_list = []
    self.update_key_name("ICExt")
    jar_location = self.get_option_value('ICExt','ic_extension_path')
    self.install_root = self.get_option_value("ICExt","ext_install_root") 
    if self.install_root:    
      self.config_dir = self.install_root + "/config"
    self.was_install_root = self.get_option_value("ICExt","was_install_root")
    self.was_soap_port = int(self.get_option_value("ICExt","was_soap_port"))
    self.scope_type = self.get_option_value("ICExt","files_scope")
    self.scope_name = self.get_option_value("ICExt","files_scope_name")    
    if self.get_scope_type().lower() == "server":
      self.node_name = self.get_option_value("ICExt","files_node_name")
    else:
      self.node_name = ""
    
    self.app_scope = {}

    for app in ['news', 'common']:
      self.app_scope[app] = {}
      self.app_scope[app]['scope_type'] = self.get_option_value("ICExt", app + "_scope")
      self.app_scope[app]['scope_name'] = self.get_option_value("ICExt", app + "_scope_name")

      if self.app_scope[app]['scope_type'] and self.app_scope[app]['scope_type'].lower() == "server":
        self.app_scope[app]['node_name'] = self.get_option_value("ICExt", app + "_node_name")
      else:
        self.app_scope[app]['node_name'] = ""

    self.get_option_value("ICExt","docs_admin_j2c_alias")
    
    self.was_adminid = None
    self.was_adminpw = None
    #never read was credentials from cfg file
    #self.was_adminid = self.get_option_value("ICExt","was_admin_id")
    #self.was_adminpw = self.get_option_value("ICExt","was_admin_pw")

    if self.has_option("ICExt", "docs_url_prefix"):
      self.context_root = self.get_option_value("ICExt", "docs_url_prefix") 
    else:
      self.context_root = None

    if self.has_option("ICExt", "docs_ajax_proxy_prefix"):
      self.context_root_proxy = self.get_option_value("ICExt", \
	"docs_ajax_proxy_prefix") 
    else:
      self.context_root_proxy = None

    self.ignore_event = self.get_option_value("ICExt", "ignore_event")
    self.docs_server_url = self.get_option_value("ICExt", "docs_server_url")

    if self.has_option("ICExt", "ibm_docs_entitlement"):
      self.entitlement = self.get_option_value("ICExt", "ibm_docs_entitlement") 
    else:
      self.entitlement = None

    self.ic_version = self.get_option_value("ICExt","ic_version")
    self.restart_connections = self.get_option_value("ICExt","restart_connections")
    # self.ccm_enabled = self.get_option_value("ICExt","ccm_enabled")
    
    self.enabled_upload_new_version = True
    if self.has_option("ICExt", "enable_upload_new_version"):
      tmp = self.get_option_value("ICExt", "enable_upload_new_version")
      if tmp.lower() == 'false':
        self.enabled_upload_new_version = False
    
    config_visitor.visit(self)
    config_visitor.check_missing_options(self)

    if self.install_root :    
      self.product_dir = self.install_root + "/product"
      self.version_dir = self.install_root + "/version"
      self.logs_dir = self.install_root + "/logs"
    
    self.version_value = version_info['build_version'] 
    self.current_version_value = None
    self.get_current_version_value()
    
    self.is_dmgr_on_host = None

  def set_is_dmgr_on_host(self, value):
    self.is_dmgr_on_host = value
  
  def get_is_dmgr_on_host(self):
    return self.is_dmgr_on_host
  
  def get_license_accept(self):
    if GACCEPT_LICENSE.lower() == 'true':
      return True
    else:
      return False
  def is_silently_install(self):
    if GSILENTLY_INSTALL.lower() == 'true':
      return True
    else:
      return False
  
  def get_config_dir(self):
    return self.config_dir
  
  def get_context_root_proxy(self):
    return self.context_root_proxy 
  
  def get_product_dir(self):
    return self.product_dir
  
  def get_ignore_event(self):
    return self.ignore_event
  
  def get_docs_server_url(self):
    return self.docs_server_url
  
  def get_cfg_path(self):
    return self.cfg_path
  
  def get_entitlement(self):
    return self.entitlement 

  def get_context_root(self):
    return self.context_root 

  def get_icext_jar_location(self):

    if self.has_option('ICExt','ic_extension_path'):
      jar_location = self.get_option_value('ICExt','ic_extension_path')
      if jar_location.strip() != '':
          return jar_location
    
    location_map = {
        '4.x' : 'data/shared/provision/webresources',
        '3.x' : 'Data/provision/webresources'
        }
    
    version_text = self.ic_version.strip()
    if version_text.startswith('4.') or version_text.startswith('5.'): # 4.x, 5.x
      jar_location = os.path.join(self.install_root,location_map['4.x'])
    elif version_text.startswith('3.'): # 3.x
      jar_location = os.path.join(self.install_root,location_map['3.x'])
    else:
      raise Exception('ic_version setting in cfg.properties is invalid: %s' % version_text)

    return jar_location
  
  def get_daemon_location(self):

    if self.has_option('ICExt','deamon_shared_path'):
      jar_location = self.get_option_value('ICExt','deamon_shared_path')
      if jar_location.strip() != '':
          return jar_location

    location_map = {
        '4.x' : 'data/shared/docs.daemon',
        '3.x' : 'Data/docs.daemon'
    }
    
    version_text = self.ic_version.strip()
    if version_text.startswith('4.') or version_text.startswith('5.'): # 4.x, 5.x
      daemon_location = os.path.join(self.install_root,location_map['4.x'])
    elif version_text.startswith('3.'): # 3.x
      daemon_location = os.path.join(self.install_root,location_map['3.x'])
    else:
      raise Exception('ic_version setting in cfg.properties is invalid: %s' % version_text)

    return daemon_location

  def get_icext_mode(self):
    #ic_version = "3.0" #FIXME logic to retrieve IC versions
    
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

  def get_build_dir(self):
    return OPTIONS["-build"]
  
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
    return self.version_value
  
  def update_key_name(self, section):
    for k in key_name_mapping:
      if self._cf.has_option(section, k):
        v = self._cf.get(section, k)
        self._cf.remove_option(section, k)
        self._cf.set(section, key_name_mapping[k], v)
  
  def get_option_value(self, section, option):
    try:
      value = self._cf.get(section, option)
      return value
    except NoOptionError as noe:
      self.error_list.append(option)
      return None
    except Error as err:
      raise ConfigException(err)

  def has_option(self, section, option):
    return self._cf.has_option(section, option)

  def get_component_name(self):
    return self.component_name

  def get_install_root(self):
    return self.install_root
  
  def get_temp_dir(self):
    return self.temp_dir
    
  def get_was_install_root(self):
    return self.was_install_root

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

  def get_raw_key_value (self):
    return self._cf.items("ICExt")

  def get_was_adminpw(self):
    self._read_was_credential()
    return self.was_adminpw

  def get_soap_port(self):
    return self.was_soap_port

  def get_scope_type(self):
    if self.scope_type:
      return self.scope_type
    else:
      return "server"

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

  def isND(self):
    return False
  def setND(self, isND) :
    pass
  def get_app_name(self):
    return "com.ibm.concord.lcfiles.ext"

  def get_restart_connections (self):
    if self.restart_connections.lower() == "true":
      return True
    return False
    
  # def get_ccm_enabled (self):
  #   if self.ccm_enabled.lower() == "true":
  #     return True
  #   return False    
    
  def get_was_cmd_line(self):
    args = []
    args.extend([self.get_wsadmin_script()])
    args.extend(["-lang", "jython"])
    args.extend(["-port", str(self.get_soap_port())])
    args.extend(["-user", self.get_was_adminid() ])
    args.extend(["-password", self.get_was_adminpw() ])
    return args
    
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
  
  def get_logs_dir(self):
    return self.logs_dir
    
  def get_enable_upload_new_version(self):
    return self.enabled_upload_new_version  

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
CONFIG=Config()
