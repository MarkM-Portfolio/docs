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

import datetime
import os, sys
import string
import configparser
from configparser import NoSectionError, NoOptionError, Error

from util import read_wscred
from .config_exception import ConfigException
from common.utils import config_visitor
from common.utils.docs_optparse import OPTIONS
from common.utils.files import call_wsadmin
from common import version_info

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GDB_ADMIN_ID = None
GDB_ADMIN_PW = None
GACCEPT_LICENSE = None

class Config:
  def __init__(self):
    self.cell_name = None
    self.error_list = []
    self._cf = configparser.SafeConfigParser()
    self.cfg_path = OPTIONS["-configFile"]
    
    self.component_name = "proxy"
    # merge cfg.properties for upgrade
    config_visitor.pre_visit(self)

    self._cf.readfp(open(self.cfg_path))
    docs_install_root = self.get_option_value("Proxy","docs_install_root")
    self.was_install_root = self.get_option_value("Proxy","was_proxy_profile_root")
    self.proxy_scope_type = self.get_option_value("Proxy","scope")
    if self.get_scope_type().lower() == "server":
      self.proxy_node_name = self.get_option_value("Proxy","proxy_node_name")
      self.is_nd = False
    else:
      self.proxy_node_name = ""
      self.is_nd = True
    self.proxy_scope_name = self.get_option_value("Proxy","proxy_scope_name")
    self.docs_scope_name = self.get_option_value("Proxy","docs_scope_name")
    self.was_ipc_port = self.get_option_value("Proxy","was_ipc_port")
    if self.get_ipc_port() == "":
      self.is_dmz = False
      if self.get_option_value("Proxy","was_soap_port"):
        self.was_soap_port = int(self.get_option_value("Proxy","was_soap_port"))
      else:
        self.was_soap_port = ""
    else:
      self.is_dmz = True
      self.was_soap_port = ""   
    self.docs_context_root = self.get_option_value("Proxy","docs_context_root")
    
    self.software_mode = self.get_option_value("Proxy","software_mode")
     
    #never read was credential from config file
    #self.was_adminid = self.get_option_value("Proxy","was_admin_id")
    #self.was_adminpw = self.get_option_value("Proxy","was_admin_pw")
    refer_file='cfg.properties.normal'
    if self.isDMZ():
      refer_file='cfg.properties.dmz'
    else:
      if self.get_scope_type().lower() == "cluster":
        refer_file='cfg.properties.cluster'              
        
    self.install_root = os.path.join(docs_install_root, self.component_name)        

    config_visitor.visit(self)
    config_visitor.check_missing_options(self, refer_file)

    self.product_dir = self.install_root + "/product"
    self.version_dir = self.install_root + "/version"
    self.logs_dir = self.install_root + "/logs"
    self.config_dir = self.install_root + "/config"
    self.was_adminid = None
    self.was_adminpw = None
    self.version_value = version_info['build_version']    
    self.current_version_value = None
    self.get_current_version_value()

    self.webserver_name = self.get_option_value("Proxy","webserver_name")
    self.restart_webservers = self.get_option_value("Proxy","restart_webservers")
    self.timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")  
    self.cluster_info = {}
    self.webserver_info = None
  
  def get_version_value(self):   
    return self.version_value

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
       
  def get_license_accept(self):
      if GACCEPT_LICENSE.lower() == 'true':
          return True
      else:
          return False

  def get_proxy_server_name(self):
    return self.proxy_scope_name
  
  def get_scope_name(self):
    return self.proxy_scope_name
  
  def get_proxy_node_name(self):
    return self.proxy_node_name 

  def get_docs_scope_name(self):
    return self.docs_scope_name
  
  def get_build_dir(self):
    return OPTIONS["-build"]

  def get_option_value(self, section, option):
    try:
      value = self._cf.get(section, option)
      return value
    except NoOptionError as noe:
      self.error_list.append(option)
      return None
    except Error as err:
      raise ConfigException(err)

  def get_raw_key_value (self):
    return self._cf.items("Proxy")

  def get_component_name(self):
    return self.component_name

  def get_install_root(self):
    # For UNC PATH: \\host\path -> //host/path
    # For local path: c:\\shared\\data -> c:/shared/data
    return self.install_root.replace("\\", "/")
    

  def get_product_dir(self):
    return self.product_dir
      
  def get_version_dir(self):
    return self.version_dir
    
  def get_logs_dir(self):
    return self.logs_dir
    
  def get_config_dir(self):
    return self.config_dir
    
  def get_temp_dir(self):
    return self.temp_dir
  
  def get_was_dir(self):
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

  def get_was_adminpw(self):
    self._read_was_credential()
    return self.was_adminpw

  def get_soap_port(self):
    return self.was_soap_port
  
  def get_ipc_port(self):
    if self.was_ipc_port:
      return self.was_ipc_port
    else:
      return ""

  def get_docs_context_root(self):
    return self.docs_context_root

  def get_scope_full_name(self):
    fullname = ""
    if self.proxy_scope_type.lower() == "server":
      fullname = "".join(["/Node:", \
                 self.proxy_node_name, \
                 "/Server:", self.proxy_scope_name, \
                 "/"])
    else:
      fullname = "/ServerCluster:" + self.proxy_scope_name + "/"

    return fullname

  def get_version_least(self):
    if self.isDMZ():
      return "7.0.0.23"
    else:
      return "8.0.0.0"

  def isDMZ(self):
    if self.is_dmz:
      return self.is_dmz
    else:
      return False

  def isND(self):
    return self.is_nd
    
  def setND(self, isND) :
    self.is_nd = isND
  
  def get_app_name(self):
    return "IBMDocs"

  def get_scope_type(self):
    if self.proxy_scope_type:
      return self.proxy_scope_type
    else:
      return "server"
    
  def get_was_cmd_line(self):
    args = []
    args.extend([self.get_wsadmin_script()])
    args.extend(["-lang", "jython"])
    if self.isDMZ():
      args.extend(["-conntype", "IPC"])
      args.extend(["-port", str(self.get_ipc_port())])
    else:
      args.extend(["-conntype", "SOAP"])
      args.extend(["-port", str(self.get_soap_port())])      
    args.extend(["-user", self.get_was_adminid() ])
    args.extend(["-password", self.get_was_adminpw() ])
    return args
      
  def get_cell_name(self):
    if self.cell_name == None: 
      args = self.get_was_cmd_line()
      args.extend(["-f",  "./proxy/tasks/get_cell_name.py"])
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
      server["nodename"] = self.get_proxy_node_name()
      server["servername"] = self.get_scope_name()
      servers.append(server)

    return (servers, clusters)

  def get_was_install_root(self):
    return self.was_install_root
    
  def get_cfg_path(self):
    return self.cfg_path
    
  def get_restart_webservers (self):
    if self.restart_webservers.lower() == "true":
      return True
    return False
  
  def get_software_mode(self):
    return self.software_mode
  
  def is_premise(self):
    return self.get_software_mode().lower() == 'premise'
  
  def is_sc(self):
    return self.get_software_mode().lower() == 'sc'

  def get_webserver_name (self):
    return self.webserver_name              
CONFIG=Config()
