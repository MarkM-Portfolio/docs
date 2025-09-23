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


import os, sys
import string
import configparser
import datetime
from configparser import NoSectionError, NoOptionError, Error

from util import read_wscred
from common.utils.files import call_wsadmin
from common.utils import config_visitor
from common.utils.docs_optparse import OPTIONS
from common import version_info
import logging as log
try:
  import json
except ImportError: 
  import simplejson as json

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GACCEPT_LICENSE = None
GSILENTLY_INSTALL = None
INSTALL_MODE = None

CVT_EAR_PRE = "com.ibm.symphony.conversion.service.rest.was.ear"
CVT_IDS_EAR_PRE = "com.ibm.docs.sanity.ear"
CVT_NAME = "IBMConversion"
CVT_IDS_NAME = "IBMConversionSanity"

key_name_mapping = {
  'conversion_shared_data_root':'docs_shared_storage_local_path',
  'conversion_shared_data_server':'docs_shared_storage_remote_server',
  'conversion_shared_data_root_remote':'docs_shared_storage_remote_path',
  'viewer_shared_data_name': 'viewer_shared_storage_local_path',
  'conversion_shared_data_server_viewer': 'viewer_shared_storage_remote_server',
  'conversion_shared_data_root_remote_viewer': 'viewer_shared_storage_remote_path'
}

class Config:
  def __init__(self):
    self.cell_name = None
    self.user_install_path = None
    self.error_list = []
    self._cf = configparser.SafeConfigParser()
    self.cfg_path = OPTIONS["-configFile"]
    
    self.component_name = "conversion"
    # merge cfg.properties for upgrade
    config_visitor.pre_visit(self)
    
    self._cf.readfp(open(self.cfg_path))
    # add version information to _cf
    for v_info_key in version_info:
      self._cf.set("Conversion", v_info_key, version_info[v_info_key])    
    self.update_key_name("Conversion")

    self.install_root = self.getOptionValue("Conversion","conversion_install_root")
    self.shared_data_root = self.getOptionValue("Conversion","docs_shared_storage_local_path") # for docs shared data
    self.shared_storage_server = self.getOptionValue("Conversion","docs_shared_storage_remote_server")
    self.shared_from_dir = self.getOptionValue("Conversion","docs_shared_storage_remote_path")

    self.viewer_shared_data_root = self.getOptionValue("Conversion","viewer_shared_storage_local_path")
    self.shared_storage_viewer_server = self.getOptionValue("Conversion","viewer_shared_storage_remote_server")
    self.viewer_shared_from_dir = self.getOptionValue("Conversion","viewer_shared_storage_remote_path")

    self.docs_shared_storage_type = self.getOptionValue("Conversion", "docs_shared_storage_type");
    self.viewer_shared_storage_type = self.getOptionValue("Conversion", "viewer_shared_storage_type");
    self.product_dir = self.install_root + '/' + "product"
    self.version_dir = self.install_root + '/' + "version"
    self.tag_dir = self.product_dir + "/properties/version"
    self.logs_dir = self.install_root + '/' + "logs"
    self.config_dir = self.install_root + '/' + "config"
    self.data_dir = self.install_root + '/' + "data" 

    self.sym_dir = self.install_root + os.sep + "symphony"
    self.sym_count = int(self.getOptionValue("Conversion","sym_count"))
    self.sym_start_port = int(self.getOptionValue("Conversion","sym_start_port"))

    self.viewer_url = self.getOptionValue("Conversion","viewer_url")
    
    self.was_install_root = self.getOptionValue("Conversion","was_install_root")
    self.was_soap_port = int(self.getOptionValue("Conversion","was_soap_port"))
    self.scope_type = self.getOptionValue("Conversion","scope")
    self.scope_name = self.getOptionValue("Conversion","scope_name")
    if self.get_scope_type().lower() == "server":
      self.node_name = self.getOptionValue("Conversion","node_name")
      self.is_nd = False
    else:
      self.node_name = ""
      self.is_nd = True
    
    self.was_adminid = None
    self.was_adminpw = None

    #never read was credential from cfg file
    #self.was_adminid = self.getOptionValue("Conversion","was_admin_id")
    #self.was_adminpw = self.getOptionValue("Conversion","was_admin_pw")

    self.software_mode = self.getOptionValue("Conversion","software_mode")
    
    self.non_job_mgr_mode = self.getOptionValue("Conversion","non_job_mgr_mode")
    
    self.webserver_name = self.getOptionValue("Conversion","webserver_name")
    self.restart_webservers = self.getOptionValue("Conversion","restart_webservers")
    self.webserver_info = None
    self.version_value = version_info['build_version']
    self.current_version_value = None
    
    self.error_info = []
    config_visitor.visit(self)
    config_visitor.check_missing_options(self)
    
    self.profile_root = None
    self.profile_root_init = False
    self.node_is_unmanaged = True
    self.node_unmanaged_init = False
    self.start_server_after_install = True
    self.cluster_info = {}
    self.finish_status_file_name = os.path.join( self.logs_dir, 'node_finish_status_%s.json' % OPTIONS.get('-time', self.timestamp))
    self.finish_status_node_file_name = os.path.join( self.logs_dir, '%s','node_finish_status_%s.json' % self.timestamp )

  def set_error_info(self, info):
    self.error_info.append(info)
    
  def get_error_info(self):
    return self.error_info
    
  def get_raw_key_value (self):
    return self._cf.items("Conversion")    

  def get_version_value(self):
    return self.version_value  

  def get_current_version_value(self):  
    if self.current_version_value:
      return self.current_version_value

    CONFIG_JSON_SUB_DIR = "IBMDocs-config"
    CONVERSION_JSON_NAME = "conversion-config.json"      
    was_dir = self.was_install_root
    cell_name = self.get_cell_name()
    conversion_json_path = was_dir + "/config/cells/" + cell_name + "/"\
    + CONFIG_JSON_SUB_DIR + "/" + CONVERSION_JSON_NAME
    
    # check build-info in the conversion-config.json first
    if os.path.exists(conversion_json_path) and os.path.isfile(conversion_json_path):
      conversion_json_file = open(conversion_json_path)
      conversion_json = json.load(conversion_json_file)
      if "build-info" in conversion_json:
        self.current_version_value = conversion_json["build-info"]["build_version"]
      if self.current_version_value:
        return self.current_version_value
    
    # for old release, check version.txt
    version_txt = os.path.join(self.get_version_dir(), 'version.txt')
    # check version.txt in install root first
    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
      # if not find version.txt in install root, check it in product dir
      version_txt = os.path.join(self.getProductFolder(),'installer','version.txt')
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
    
  def get_software_mode(self):
    return self.software_mode

  def get_build_dir(self):
    return OPTIONS["-build"]

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
  
  def update_key_name(self, section):
    for k in key_name_mapping:
      if self._cf.has_option(section, k):
        v = self._cf.get(section, k)
        self._cf.remove_option(section, k)
        self._cf.set(section, key_name_mapping[k], v)    
    
  def getOptionValue(self, section, option):
    try:
      value = self._cf.get(section, option)
      return value
    except NoOptionError as noe:
      self.error_list.append(option)
      return None

  def get_component_name(self):
    return self.component_name

  def get_install_root(self):
    # For UNC PATH: \\host\path -> //host/path
    # For local path: c:\\shared\\data -> c:/shared/data
    return self.install_root.replace("\\", "/")

  def getProductFolder(self):
    return self.product_dir

  def get_version_dir(self):
    return self.version_dir
    
  def get_tag_dir(self):
    return self.tag_dir

  def get_logs_dir(self):
    return self.logs_dir

  def getConfigFolder(self):
    return self.config_dir

  def getDataFolder(self):
    return self.data_dir

  def get_temp_dir(self):
    return self.temp_dir

  def getSymphonyFolder(self):
    return self.sym_dir
  
  def getSharedDataRoot(self):
    # For UNC PATH: \\host\path -> //host/path
    # For local path: c:\\shared\\data -> c:/shared/data
    return self.shared_data_root.replace("\\", "/")

  def getSharedStorageServer(self):
    return self.shared_storage_server

  def getSharedStorageViewerServer(self):
    return self.shared_storage_viewer_server

  def getSharedFromDir(self):
    return self.shared_from_dir

  def getViewerSharedDataRoot(self):
    # For UNC PATH: \\host\path -> //host/path
    # For local path: c:\\shared\\data -> c:/shared/data
    return self.viewer_shared_data_root.replace("\\", "/")

  def getSharedFromDirViewer(self):
    return self.viewer_shared_from_dir

  def getSymCount(self):
    return self.sym_count

  def getSymStartPort(self):
    return self.sym_start_port

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

  def getSoapPort(self):
    return self.was_soap_port

  def get_scope_type(self):
    if self.scope_type:
      return self.scope_type
    else:
      return "server"

  def get_scope_name(self):
    return self.scope_name

  def getNodeName(self):
    return self.node_name

  def getScopeFullName(self):
    fullname = ""
    if self.scope_type.lower() == "server":
      fullname = "".join(["/Node:", \
                 self.node_name, \
                 "/Server:", self.scope_name, \
                 "/"])
    else:
      fullname = "/ServerCluster:" + self.scope_name + "/"

    return fullname

  def getVersionLeast(self):
    if self.is_local():
      return "7.0.0.11" 
    return "8.0.0.0"

  def is_local(self):
    return self.get_software_mode().lower() == 'local'
  
  def is_premise(self):
    return self.get_software_mode().lower() == 'premise'
  
  def is_sc(self):
    return self.get_software_mode().lower() == 'sc'
    
  def isND(self):
    return self.is_nd
    
  def setND(self, isND) :
    self.is_nd = isND
  
  def get_app_name(self):
    return CVT_NAME

  def get_sc_app_name(self):
    return CVT_SC_NAME
    
  def get_ids_app_name(self):
    return CVT_IDS_NAME
  
  def get_ear_name(self,app_name):
    if app_name == CVT_NAME:
      return CVT_EAR_PRE
    elif app_name == CVT_IDS_NAME:
      return CVT_IDS_EAR_PRE
    else:
      return CVT_EAR_PRE
  
  def get_was_cmd_line(self):
    args = []
    args.extend([self.get_wsadmin_script()])
    args.extend(["-lang", "jython"])
    args.extend(["-port", str(self.getSoapPort())])
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
      server["nodename"] = self.getNodeName()
      server["servername"] = self.get_scope_name()
      servers.append(server)

    return (servers, clusters)
  def get_cfg_path(self):
    return self.cfg_path
    
  def get_profile_root(self):
    if self.profile_root_init:
      return self.profile_root
    
    if self.getNodeName():
      args = self.get_was_cmd_line()
      args.extend(["-f",  "./conversion/tasks/get_profile_root.py"])
      args.extend([self.getNodeName()])
      
      succ, ws_out = call_wsadmin(args)
      if succ:
        for line in ws_out.split('\n'):
          if line.find('profile root:') > -1:
            self.profile_root = line.strip(' \r\n\t').replace('profile root:','')
            break        
   
    self.profile_root_init = True
    return self.profile_root   


  def get_node_is_unmanaged(self):
    if self.node_unmanaged_init:
      return self.node_is_unmanaged
      
    if self.getNodeName():
      args = self.get_was_cmd_line()
      args.extend(["-f",  "./conversion/tasks/get_node_is_unmanaged.py"])
      args.extend([self.getNodeName()])
      
      succ, ws_out = call_wsadmin(args)
      if succ:
        for line in ws_out.split('\n'):
          if line.find('result:') > -1:
            self.node_is_unmanaged = eval(line.strip(' \r\n\t').replace('result:',''))
            break        
    
    self.node_unmanaged_init = True
    return self.node_is_unmanaged

  def get_non_job_mgr_mode(self):
    return self.non_job_mgr_mode
    
  def get_cell_name(self):
    if self.cell_name is not None:
      return self.cell_name
    
    # Get the cell name
    log.info("Start to get cell name...")
    cell_name_args = self.get_was_cmd_line()
    cell_name_args.extend(["-f",  "./conversion/tasks/get_cell_name.py"])
    cell_name_succ, cell_name_ws_out = call_wsadmin(cell_name_args)
    if not cell_name_succ:
      raise Exception("Failed to get the cell name")
    cell_name_var = "cellname"
    cell_name_var = "".join([cell_name_var,": "])
    
    cell_names = self._parse_info(cell_name_var,cell_name_ws_out)
       
    if len(cell_names) == 0:
      raise Exception("Failed to get the cell name")
          
    log.info("Get cell %s successfully" % cell_names[0])      
    self.cell_name = cell_names[0]    
    return self.cell_name

  def set_cell_name(self,cellName):
    self.cell_name = cellName
  
  def get_user_install_root(self):
    return self.user_install_path
  
  def set_user_install_root(self,userInsPath):
    self.user_install_path = userInsPath
    
  def get_restart_webservers (self):
    if self.restart_webservers.lower() == "true":
      return True
    return False

  def get_webserver_name (self):
    return self.webserver_name  

  def _parse_info(self,des,des_prt):    
    des_list = []
    for line in des_prt.split('\n'):      
      if line.find(des) > -1:
        #raise Exception("Didn't get the node name")
        index_start = line.find(des)
        index_end = index_start + len(des)
        des_name = line[index_end : len(line)]
        if des_name.find('\n') >= 0:
          des_name = des_name[0 : des_name.find('\n')]
          
        #log.info("Node name is: %s" % node_name)
        des_list.append(des_name)            
      #endif line.find
    #endfor
    return des_list
    
CONFIG=Config()
