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

import os, sys,shutil
import string
import configparser
from configparser import NoSectionError, NoOptionError, Error
import logging
from .config_exception import ConfigException

from util import read_wscred
from viewer.config_check import do_check
from util.common import call_wsadmin

try:
  import json
except ImportError: 
  import simplejson as json

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GACCEPT_LICENSE = None
GMAP_WEBSERVER = None
CONVERSION_SUB_DIR = "conversion"
CACHE_SUB_DIR = "cache"
FILER_SUB_DIR = "fake_filer"

VIEWER_EAR_PRE = "com.ibm.concord.viewer.ear"
VIEWER_NAME = "ViewerApp"

IS_FIXPACK = False


class Config:
  def __init__(self):
    self.error_list = []
    self.required_list=[]
    self.cell_name=None
    self.was_adminid = None
    self.was_adminpw = None
    
    #1. Read from cfg.properties
    self._cf = configparser.SafeConfigParser()
    if len(sys.argv) > 1:
      self.cfg_path = sys.argv[1]
    else:
      self.cfg_path = "./cfg.properties"
    self._cf.readfp(open(self.cfg_path))
    self.component_name = "viewer"
    viewer_dict=dict(self._cf.items("Viewer"))
    
    #12. Validate each property listed in cfg.properties.
    do_check(viewer_dict)
    
    #3. Format path properties.
    for key in viewer_dict:
      self._cf.set("Viewer",key,viewer_dict[key].replace("\\","/"))    
    
    #4. Init values in Config instance, check if required values are missed in cfg.properties.
    install_path=self.get_option_value("Viewer","viewer_install_root")
    self.shared_data_dir = self.get_option_value("Viewer","shared_data_dir")
    self.was_install_root = self.get_option_value("Viewer","was_install_root")
    was_soap_port_str = self.get_option_value("Viewer","was_soap_port")
    editor_enable=self.get_option_value("Viewer","editor_installed")
    self.docs_url=self.get_option_value("Viewer","docs_url")
    self.docs_shared_data_dir=self.get_option_value("Viewer","docs_shared_data_dir")
        
    self.browser_cache = self.get_option_value("Viewer", "browser_cache")
    self.enable_print = self.get_option_value("Viewer", "enable_print") 
    scope_option=self.get_option_value("Viewer","scope")
    self.scope_name = self.get_option_value("Viewer","scope_name")
    self.files_path = self.get_option_value("Viewer","files_path")
    self.files_url = self.get_option_value("Viewer","files_url")
    self.ic_admin_j2c_alias = self.get_option_value("Viewer","ic_admin_j2c_alias")
    self.auth_type = self.get_option_value("Viewer","auth_type")
    self.multi_tenancy = self.get_option_value("Viewer","multi_tenancy")
    self.auth_host = self.get_option_value("Viewer","auth_host")
    self.conversion_url = self.get_option_value("Viewer", \
    "conversion_url")
    self.housekeeping_frequency = self.get_option_value("Viewer","housekeeping_frequency")
    self.housekeeping_age_threshold_of_rendition_latest_version = self.get_option_value("Viewer",\
        "housekeeping_age_threshold_of_rendition_latest_version")
    self.housekeeping_size_threshold_of_rendition_cache = self.get_option_value("Viewer",\
        "housekeeping_size_threshold_of_rendition_cache")
    self.convert_on_upload = self.get_option_value("Viewer", "convert_on_upload")
    # self.ecm_cmis_server_url = self.get_option_value("Viewer", "ecm_fncmis_server_url")
    # self.ecm_fncs_server_url = self.get_option_value("Viewer", "ecm_fncs_server_url")
    # self.ecm_admin_j2c_alias = self.get_option_value("Viewer", "ecm_admin_j2c_alias")
    # self.ecm_community_server_url = self.get_option_value("Viewer", "ecm_community_server_url")
    self.external_s2s_method = self.get_option_value("Viewer", "external_s2s_method")
    self.external_customer_id = self.get_option_value("Viewer", "external_customer_id")
    self.external_oauth_endpoint = self.get_option_value("Viewer", "external_oauth_endpoint")
    self.external_oauth_authorize = self.get_option_value("Viewer", "external_oauth_authorize")    
    self.external_j2c_alias = self.get_option_value("Viewer", "external_j2c_alias")
    self.external_s2s_token = self.get_option_value("Viewer", "external_s2s_token")
    self.external_token_key = self.get_option_value("Viewer", "external_token_key")
    self.external_as_user_key = self.get_option_value("Viewer", "external_as_user_key")
    self.external_cmis_atom_pub = self.get_option_value("Viewer", "external_cmis_atom_pub")
    self.external_object_store = self.get_option_value("Viewer", "external_object_store")
    self.docs_call_back_url = self.get_option_value("Viewer", "docs_call_back_url")
    self.external_repository_home = self.get_option_value("Viewer", "external_repository_home")
    self.external_meta_url = self.get_option_value("Viewer", "external_meta_url")
    self.external_get_content_url = self.get_option_value("Viewer", "external_get_content_url")
    self.external_profiles_url = self.get_option_value("Viewer", "external_profiles_url")
    self.toscana_file_server = self.get_option_value("Viewer", "toscana_file_server")
    self.toscana_oauth_endpoint = self.get_option_value("Viewer", "toscana_oauth_endpoint")
    self.local_host_domain = self.get_option_value("Viewer", "local_host_domain")
    
    #5. Report the missing properties
    if len(self.error_list) > 0:
      file_path=self.update_cfg_file()
      msg = "The config file %s is out of date. Below options missing:\n" % (self.cfg_path)
      missing = []
      for s in self.error_list:
        missing.append(" \"" + s + "\"")
      msg2 = "\n".join(missing)
      msg += msg2
      msg += "\nBackup %s, and rename %s to %s,then run the upgrade or install again."%(self.cfg_path,file_path,self.cfg_path)
      raise ConfigException(None, msg)
     
    #6. Refine properties
    self.was_soap_port = int(was_soap_port_str)    
    #self.install_root
    if install_path== None or install_path=="":
      if os.name == "nt":
        self.install_root="C:/IBM/FileViewer"
      else:
        self.install_root="/opt/IBM/FileViewer"	
    else:
      self.install_root=install_path
    #self.editor_installed
    if editor_enable.lower() == "yes":
      self.editor_installed ="true"
    elif editor_enable.lower() == "no":
      self.editor_installed ="false"
    else:
      logging.error("Exception thrown while checking editor_installed.Make sure editor_installed is set correctly.")
      raise Exception("Failed to check editor_installed.")
    #self.scope_type
    if scope_option.lower() == "a":
      self.scope_type ="cluster"
    elif scope_option.lower() == "b":
      self.scope_type ="server"
    else:
      logging.error("Exception thrown while checking scope type.Make sure scope is set correctly.")
      raise Exception("Failed to check scope type.")
    #self.node_name and self.inND
    if self.scope_type.lower() == "server":
      self.node_name = self.get_option_value("Viewer","node_name")
      self.is_nd = False
    else:
      self.node_name = ""
      self.is_nd = True
     
    #The folders to be used. 
    self.product_dir = self.install_root + "/product"
    self.version_dir = self.install_root + "/version"
    self.tag_dir = self.product_dir + "/properties/version"    
    self.logs_dir = self.install_root + "/logs"
    self.temp_dir = self.install_root + "/temp"
    self.journal_dir = self.install_root + "/journal"
    # FIXME TODO USELESS for now, future usage
    self.local_data_dir = self.install_root + "/data/local"
    # to save cache etc data
    self.conversion_dir = self.get_shared_data_dir() + "/" + CONVERSION_SUB_DIR
    self.cache_dir = self.get_shared_data_dir() + "/" + CACHE_SUB_DIR
    self.filer_dir = self.get_shared_data_dir() + "/" + FILER_SUB_DIR
    
#    self.config_dir = self.get_config_dir2()

    self.pre_lib_dir = self.install_root + "/library"
    self.pre_config_dir = self.install_root + "/config"
    #for journal deployment
    self.journal_properties ={
            'bus_name':'ViewerBus',
            'factory_name':'ViewerStreamer',
            'factory_jndi':'jms/ViewerPublish',
            'destination_name':'ViewerJournalDest',
            'topic_name':'ViewerJournalTopic',
            'topic_jndi':'jms/ViewerJournalTopic',
            'activation_name':'ViewerActivationSpec',
            'activation_jndi':'eis/ViewerActivationSpec',
            'activation_dest_type':'Topic',
            'subscription_name':'viewerjournal',
            'client_identifier':'viewerjournal'                        
            }
        
    #7. init version info
    self.version_key = 'VIEWER_VERSION'
    self.installed_version_info = None
    self.version_info = None
    self.version_value = None
    self.current_version_value = None
    self.version_value = self.get_version_value()    
    #self.current_version_value = self.get_current_version_value()

    for v_info_key in self.version_info:
      self._cf.set("Viewer", v_info_key, self.version_info[v_info_key])
  
  def get_option_value(self, section, option):
    try:
      value = self._cf.get(section, option)
      if option == 'scope':
        ret = value
        if value.lower()=='cluster' or value.lower()=='a':
          ret='A'
        elif value.lower()=='server' or value.lower()=='b':
          ret='B'
          self.node_name = self.get_option_value("Viewer","node_name")
          #self.required_list.append("=".join([option,ret]))
      elif option == 'convert_on_upload':  #normal install case
        ret = str( value.lower() == 'yes')
      else:
        ret = value
      self.required_list.append("=".join([option,ret]))
      return ret
    except NoOptionError as noe:
      if option=='editor_installed':
        opt='docs_enabled'
        value = self._cf.get(section, opt)
        ret='No'
        if value.lower()=='true':
          ret='Yes'
        self.required_list.append("=".join([option,ret]))
        return ret
      self.error_list.append(option)
      self.required_list.append("=".join([option,""]))
      return None
    except Error as err:
      raise ConfigException(err)

  #Replace the cfg.properties.
  def update_cfg_file(self):
    old_file='.'.join([self.cfg_path,'latest'])
    new_file="./cfg.properties"
    shutil.copy(new_file,old_file)
    f=open(old_file,'w')
    for line in open(new_file):
      line= line.strip(' \r\n\t')
      for value in self.required_list:
        value=value.strip(' \r\n\t')
        key=value.split("=")[0].strip(' \r\n\t')
        if key!="convert_on_upload" and key in line and "#" not in line and "=" in line:
          key1=line.strip(' \r\n\t').split("=")[0].strip(' \r\n\t')
          if key==key1:
      	    line=value.strip(' \r\n\t')
      f.write(line+'\r\n')	
    f.close()
    return old_file
  	     
  def get_journal_properties(self):
    return self.journal_properties
    
  def get_license_accept(self):
      if GACCEPT_LICENSE.lower() == 'true':
          return True
      else:
          return False

  def get_editor_installed(self):
    return self.editor_installed.lower()
    
  def get_docs_url(self):
    return self.docs_url

  def get_docs_shared_data_dir(self):
    return self.docs_shared_data_dir
    
  def get_lib_dir(self):
    return self.lib_dir 

  def get_pre_lib_dir(self):
    return self.pre_lib_dir 
    
  def get_conversion_servic_url(self):
    return self.conversion_url + "/ConversionService"

  def get_conversion_result_url(self):
    return self.conversion_url + "/ConversionResult"
    
  def get_files_url(self):
    return self.files_url 

  def get_raw_key_value (self):
    return self._cf.items("Viewer")

  def get_build_dir(self):
    if len(sys.argv) < 3:
      return "../"
    else:
      return sys.argv[2]

  def get_component_name(self):
    return self.component_name

  def get_install_root(self):
    return self.install_root

  def get_product_dir(self):
    return self.product_dir

  def get_version_dir(self):
    return self.version_dir
    
  def get_tag_dir(self):
    return self.tag_dir

  def get_logs_dir(self):
    return self.logs_dir

  def get_temp_dir(self):
    return self.temp_dir

  def get_journal_dir(self):
    return self.journal_dir

  def get_local_data_dir(self):
    return self.local_data_dir

  def get_shared_data_dir(self):
    return self.shared_data_dir

  def get_was_dir(self):
    return self.was_install_root
    
  def get_housekeeping_frequency(self):
    return self.housekeeping_frequency   
     
  #def get_housekeeping_age_threshold_of_rendition_old_version(self):
  #  return self.housekeeping_age_threshold_of_rendition_old_version

  def get_housekeeping_age_threshold_of_rendition_latest_version(self):
    return self.housekeeping_age_threshold_of_rendition_latest_version
        
  def get_housekeeping_size_threshold_of_rendition_cache(self):
    return self.housekeeping_size_threshold_of_rendition_cache
    
  def get_wsadmin_script(self):
    was_admin = ""
    if os.name == "nt":
      was_admin = self.was_install_root + "/bin/wsadmin.bat"
    else:
      was_admin = self.was_install_root + "/bin/wsadmin.sh"

    return was_admin

  def _read_was_credential(self):
#    import pdb
#    pdb.set_trace()
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

  def get_files_path(self):
    return self.files_path
    
  def get_scope_name(self):
    return self.scope_name

  def get_node_name(self):
    return self.node_name

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
    return self.is_nd
    
  def setND(self, isND) :
    self.is_nd = isND
    
  def get_journal_app_name(self):
    return "ViewerJournalSampleSubscriber"    

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

  def get_browser_cache(self):
    return self.browser_cache

  def get_enable_print(self):
    return self.enable_print

  def get_map_webserver(self):
      if GMAP_WEBSERVER.lower() == 'true':
          return True
      else:
          return False
          
  def get_app_name(self):
    return VIEWER_NAME
    
  def get_sanity_app_name(self):
    return 'ViewerSanity'
      
  def get_ear_name(self, app_name):
    return VIEWER_EAR_PRE
     
  def get_version_info(self):
    if self.version_info is not None:
      return self.version_info
      
    version_txt = os.path.join(self.get_build_dir(),'installer','version.txt')
    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
      return None
    
    self.version_info = ''  
    for line in open(version_txt):
      self.version_info += line.strip(' \r\n\t')
    self.version_info = eval(self.version_info)
    return self.version_info
    
  def get_installed_version_info(self):
    if self.installed_version_info is not None:
      return self.installed_version_info

    CONFIG_JSON_SUB_DIR = "IBMDocs-config"
    VIEWER_JSON_NAME = "viewer-config.json"
    was_dir = self.was_install_root
    cell_name = self.get_cell_name()
    viewer_json_path = was_dir + "/config/cells/" + cell_name + "/"\
    + CONFIG_JSON_SUB_DIR + "/" + VIEWER_JSON_NAME
    
    # check build-info in the viewer-config.json first
    if os.path.exists(viewer_json_path) and os.path.isfile(viewer_json_path):
      viewer_json_file = open(viewer_json_path)
      viewer_json = json.load(viewer_json_file)
      if "build-info" in viewer_json:
        self.installed_version_info = viewer_json["build-info"]
        if self.installed_version_info:
          return self.installed_version_info
    
    # for old release, check version.txt
    version_txt = os.path.join(self.get_version_dir(), 'version.txt')
    # check version.txt in install root first
    if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
      # if not find version.txt in install root, check it in product dir
      version_txt = os.path.join(self.get_product_dir(),'installer','version.txt')
      if not os.path.exists(version_txt) or not os.path.isfile(version_txt):
        return None
    
    self.installed_version_info = ''  
    for line in open(version_txt):
      self.installed_version_info += line.strip(' \r\n\t')
    self.installed_version_info = eval(self.installed_version_info)
    return self.installed_version_info	  	   
                 
  def get_version_value(self):
    if self.version_value is not None:
      return self.version_value
      
    version_info = self.get_version_info()
    self.version_value = version_info['build_version']
    
    return self.version_value
    
  def get_current_version_value(self):
    if self.current_version_value:
      return self.current_version_value
    
    version_info = self.get_installed_version_info()
    if not version_info:
      # this is installation without install root.
      self.current_version_value = '1.0.0'
      return self.current_version_value
    else:  
      self.current_version_value = version_info['build_version']
    
    return self.current_version_value   
    
  def get_cfg_path(self):
    return self.cfg_path
   
  def get_version_key(self):
    return self.version_key
    
  def get_cell_name(self):
    if self.cell_name:
      return self.cell_name	
      
    args = self.get_was_cmd_line()
    args.extend(["-f",  "./viewer/tasks/get_cell_name.py"])
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("cellname: ") < 0:
      raise Exception("Didn't get the cell name")
    
    logging.info("Get cell name task output is: %s" % ws_out)
    cell_name = ws_out[(ws_out.find('cellname: ') + 10) : len(ws_out)]
    if cell_name.find('\n') >= 0:
      cell_name = cell_name[0 : cell_name.find('\n')]
    logging.info("Cell name is: %s" % cell_name)
    self.cell_name = cell_name
    
    return self.cell_name
   
  def add_value(self, section, key, value):
    if not self._cf.has_option(section, key):  
      self._cf.set(section, key, value) 
    
CONFIG=Config()