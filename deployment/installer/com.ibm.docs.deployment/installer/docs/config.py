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
import datetime
import configparser
from configparser import NoSectionError, NoOptionError, Error
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from util import read_wscred
from .config_exception import ConfigException
from common.utils import config_visitor
from common.utils.docs_optparse import OPTIONS
from common.utils.files import call_wsadmin
from common import version_info
import logging as log
import socket
try:
  import json
except ImportError:
  import simplejson as json

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GDB_ADMIN_ID = None
GDB_ADMIN_PW = None
GACCEPT_LICENSE = None
GSILENTLY_INSTALL = None
GMAP_WEBSERVER = None
INSTALL_MODE = None

DRAFT_SUB_DIR = "draft"
CONVERSION_SUB_DIR = "conversion"
CACHE_SUB_DIR = "cache"
FILER_SUB_DIR = "fake_filer"
JOB_HOME_SUB_DIR = "job_cache"

DOCS_EAR_PRE = "com.ibm.concord.ear"
SC_EAR_PRE="com.ibm.docs.spellcheck.ear"
IDS_EAR_PRE="com.ibm.docs.sanity.ear"
WEB_EAR_PRE="com.ibm.docs.web.resources.ear"
HELP_EAR_PRE="com.hcl.docs.help.ear"
DOCS_NAME = "IBMDocs"
SC_NAME = "Spellcheck4IBMDocs"
IDS_NAME = "IBMDocsSanity"
WEB_NAME ="IBMDocsWebResources"
DOCS_HELP_NAME="DocsHelp"

LCC_CONFIG_NAME = "LotusConnections-config.xml"
LCC_CONFIG_CONFIG = "config"
ST_TUNNEL_APPFIX = "/connections/resources/web/lconn/core/sametime/tunnel.html"
SERV_NAME = "serviceName"
SERV_NAME_PROFILES = "profiles"
SERV_NAME_PERSON_TAG = "personTag"
SERV_NAME_STPROXY = "sametimeProxy"
SLOC_STATIC = "sloc:static"
SLOC_PREFIX = "sloc:hrefPathPrefix"
SERV_REF = "sloc:serviceReference"
MISS_LCC_PATH = "As the value of 'integrate_with_LC' is set to 'true', the 'LC_config_xml_path' is a must have setting"
MISS_LC_CAC = "As the value of 'integrate_with_LC' is set to 'true', the 'LC_connect_attempt_count' is a must have setting"
MISS_LC_CAI = "As the value of 'integrate_with_LC' is set to 'true', the 'LC_connect_attempt_interval' is a must have setting"
KW_ST_DOMAIN = "ST_domain"
KW_ST_SERVER = "ST_server"
KW_SSL_ST_SERVER = "SSL_ST_server"
KW_ST_TUNNEL = "ST_tunnelURI"
MISS_ST_SERVER = "As the value of 'ST_standalone_available' is set to 'true', the 'ST_server' is a must have setting"
MISS_SSL_ST_SERVER = "As the value of 'ST_standalone_available' is set to 'true', the 'SSL_ST_server' is a must have setting"
MISS_ST_TUNNEL = "As the value of 'ST_standalone_available' is set to 'true', the 'ST_tunnel' is a must have setting"
chatCFG = '{\\"allowImages\\": false,\\"bringWindowToFront\\": false,\\"isSound\\": false,\\"partnerLeftMessage\\": true}'
extCFG = '{}'
LCextCFGTemplate = '{\\"Connections\\": true}'
SCextCFGTemplate = '{\\"LotusLive\\": true}'
pluginsCFG = '{}'
stproxyCFG = '{\\"chat\\": $chatCFG,\\"domain\\": \\"$KW_ST_DOMAIN\\",\\"ext\\": $extCFG,\\"isConnectClient\\": false,\\"isStandAloneWebClient\\": false,\\"noResolve\\": false,\\"plugins\\": $pluginsCFG,\\"server\\": \\"$KW_ST_SERVER\\",\\"ssl_server\\":\\"$KW_SSL_ST_SERVER\\",\\"tokenLogin\\": true,\\"tunnelURI\\": \\"$KW_ST_TUNNEL\\"}'
STCFG = '{\\"bBIZCardAvailable\\": $BIZCardStatus,\\"bSTAvailable\\": true,\\"stproxyConfig\\": $stproxyCFG}'
class Config:
  def __init__(self):
    self.cell_name = None
    self.is_dmgr_node_on_host = None
    self.user_install_path = None
    self.error_list = []
    self._cf = configparser.SafeConfigParser()
    self.cfg_path = OPTIONS["-configFile"]

    self.isProfileDisabled = False
    self.isBIZCardDisabled = False
    self.isSTDisabled = False
    self.component_name = "docs"
    # merge cfg.properties for upgrade
    config_visitor.pre_visit(self)
    self._cf.readfp(open(self.cfg_path))
    # add version information to _cf
    for v_info_key in version_info:
      self._cf.set("Docs", v_info_key, version_info[v_info_key])

    self.install_root = self.get_option_value("Docs","docs_install_root")
    self.spreadsheet_nodejs_install = self.get_option_value("Docs", "spreadsheet_nodejs_install")

    # to save draft/cache etc data
    self.shared_data_dir = self.get_option_value("Docs","shared_data_dir")
    self.was_install_root = self.get_option_value("Docs","was_install_root")
    self.was_soap_port = int(self.get_option_value("Docs","was_soap_port"))
    self.scope_type = self.get_option_value("Docs","scope")
    self.scope_name = self.get_option_value("Docs","scope_name")
    if self.get_scope_type().lower() == "server":
      self.node_name = self.get_option_value("Docs","node_name")
      self.is_nd = False
    else:
      self.node_name = ""
      self.is_nd = True
    self.admin_alias = self.get_option_value("Docs","ic_admin_j2c_alias")
    self.email_url = self.get_option_value("Docs","email_url")
    self.auth_type = self.get_option_value("Docs","auth_type")
    self.auth_host = self.get_option_value("Docs","auth_host")
    self.multitenancy_enablement = self.get_option_value("Docs","mt")

    # DB access entries
    self.db_type = self.get_option_value("Docs","db_type")
    self.db_hostname = self.get_option_value("Docs","db_hostname")
    self.db_port = self.get_option_value("Docs","db_port")
    self.db_name = self.get_option_value("Docs","db_name")
    self.db_jdbc_driver_path = self.get_option_value("Docs","db_jdbc_driver_path")

    self.software_mode = self.get_option_value("Docs","software_mode")
    self.files_url = self.get_option_value("Docs","files_url")
    self.conversion_url = self.get_option_value("Docs", \
        "conversion_url")

    self.non_job_mgr_mode = self.get_option_value("Docs","non_job_mgr_mode")

    # get the ST integration info
    self.is_social_in_smart_cloud = False
    self.is_integrate_with_LC = None
    social_suit_enabled = self.get_option_value("Docs", "social_suit_enabled")
    if social_suit_enabled and social_suit_enabled.lower() == "true":
      self.is_social_suit_enabled = True
      self.is_use_initial_name = "false"
      if self.software_mode.lower() == "sc":
        self.dealWithSocialSmartCloud()
      elif self.get_option_value("Docs", "integrate_with_LC").lower() == "true":
        self.is_integrate_with_LC = True
        #self.dealWithLCC()
      elif self.get_option_value("Docs", "ST_standalone_available").lower() == "true":
        self.dealWithSametimeStandalone()
    else:
      self.is_social_suit_enabled = False
      self.isProfileDisabled = True
      self.isBIZCardDisabled = True
      self.isSTDisabled = True

    if self.software_mode.lower() == "sc":
      self.housekeeping_owner_hostname = self.get_option_value("Docs","housekeeping_server_host_name")
    else:
      self.housekeeping_owner_hostname = ""

    if self.software_mode.lower() == "sc":
      self.migration_owner_hostname = self.get_option_value("Docs","migration_server_host_name")
    else:
      self.migration_owner_hostname = ""

    # ecm integration
    # self.ecm_admin_alias = self.get_option_value("Docs","ecm_admin_j2c_alias")
    # self.ecm_cmis_url = self.get_option_value("Docs","ecm_cmis_server_url")
    # self.ecm_fncs_url = self.get_option_value("Docs","ecm_fncs_server_url")
    # self.ecm_navigator_url = self.get_option_value("Docs","ecm_navigator_server_url")
    # self.ecm_community_url = self.get_option_value("Docs","ecm_community_server_url")

    self.external_s2s_method = self.get_option_value("Docs", "external_s2s_method")
    self.external_customer_id = self.get_option_value("Docs", "external_customer_id")
    self.external_oauth_endpoint = self.get_option_value("Docs", "external_oauth_endpoint")
    self.external_oauth_authorize = self.get_option_value("Docs", "external_oauth_authorize")
    self.external_current_user_profiles_url = self.get_option_value("Docs", "external_current_user_profiles_url")
    self.external_j2c_alias = self.get_option_value("Docs", "external_j2c_alias")
    self.external_s2s_token = self.get_option_value("Docs", "external_s2s_token")
    self.external_token_key = self.get_option_value("Docs", "external_token_key")
    self.external_as_user_key = self.get_option_value("Docs", "external_as_user_key")
    self.external_cmis_atom_pub = self.get_option_value("Docs", "external_cmis_atom_pub")
    self.external_object_store = self.get_option_value("Docs", "external_object_store")
    self.docs_call_back_url = self.get_option_value("Docs", "docs_call_back_url")
    self.external_repository_home = self.get_option_value("Docs", "external_repository_home")
    self.external_meta_url = self.get_option_value("Docs", "external_meta_url")
    self.external_get_content_url = self.get_option_value("Docs", "external_get_content_url")
    self.external_profiles_url = self.get_option_value("Docs", "external_profiles_url")

    self.product_dir = self.install_root + "/product"
    self.version_dir = self.install_root + "/version"
    self.tag_dir = self.product_dir + "/properties/version"
    self.logs_dir = self.install_root + "/logs"
    self.config_dir = self.install_root + "/config"

    # FIXME TODO USELESS for now, future usage
    self.local_data_dir = self.install_root + "/data/local"
    self.draft_dir = self.get_shared_data_dir() + "/" + DRAFT_SUB_DIR
    self.conversion_dir = self.get_shared_data_dir() + "/" + CONVERSION_SUB_DIR
    self.cache_dir = self.get_shared_data_dir() + "/" + CACHE_SUB_DIR
    self.filer_dir = self.get_shared_data_dir() + "/" + FILER_SUB_DIR
    self.job_home = self.get_shared_data_dir() + "/" + JOB_HOME_SUB_DIR

    self.lib_dir = self.install_root + "/library"
    self.lib_spi_concord = self.lib_dir + "/concord"
    self.lib_spi_adapters = self.lib_dir + "/adapters"

    self.was_adminid = None
    self.was_adminpw = None

    self.activity_url = ""
    self.db_user_id = None
    self.db_user_pw = None

    self.webserver_name = self.get_option_value("Docs","webserver_name")
    self.restart_webservers = self.get_option_value("Docs","restart_webservers")
    self.timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    self.cluster_info = {}
    self.webserver_info = None

    #for journal deployment
    self.journal_properties ={
            'bus_name':'IBMDocsBus',
            'factory_name':'IBMDocsStreamer',
            'factory_jndi':'jms/IBMDocsPublish',
            'destination_name':'IBMDocsJournalDest',
            'topic_name':'IBMDocsJournalTopic',
            'topic_jndi':'jms/IBMDocsJournalTopic',
            'activation_name':'IBMDocsActivationSpec',
            'activation_jndi':'eis/IBMDocsActivationSpec',
            'activation_dest_type':'Topic',
            'subscription_name':'ibmdocsjournal',
            'client_identifier':'ibmdocsjournal'
            }

    self.version_value = version_info['build_version']
    self.current_version_value = None
    self.error_info = []

    config_visitor.visit(self)
    config_visitor.check_missing_options(self)

    self.profile_root = None
    self.profile_root_init = False
    self.finish_status_file_name = os.path.join(self.logs_dir, 'node_finish_status_%s.json' % OPTIONS.get('-time', self.timestamp))
    self.finish_status_node_file_name = os.path.join(self.logs_dir, '%s', 'node_finish_status_%s.json' % self.timestamp)

  def dealWithLCC(self):
    #self.is_integrate_with_LC = True
    if not self.is_integrate_with_LC:
      return

    self.is_use_initial_name = self.get_option_value("Docs", "use_initial_name").lower()
    cell_name = self.get_cell_name()

    #Get the user install path of node on USER_INSTALL_ROOT
    log.info("Start to get the USER_INSTALL_ROOT...")
    hostname = socket.gethostname()
    user_inst_args = self.get_was_cmd_line()
    user_inst_args.extend(["-f",  "./docs/tasks/get_user_inst_path_for_node.py"])
    #user_ins_args.extend(["USER_INSTALL_ROOT"])
    user_inst_args.extend([hostname])
    user_inst_succ, user_inst_ws_out = call_wsadmin(user_inst_args)
    if not user_inst_succ:
      raise Exception("Failed to get was profile for given host")
    user_inst_path_var = "UserInstPath"
    user_inst_path_var = "".join([user_inst_path_var,": "])
    user_inst_paths = self._parse_info(user_inst_path_var,user_inst_ws_out)

    if user_inst_paths[0] == "None":
      raise Exception("Failed to get was profile for given host")

    self.LC_config_xml_path = user_inst_paths[0]+'/config/cells/'+cell_name+'/LotusConnections-config'

    log.info("Get USER_INSTALL_ROOT %s successfully" % user_inst_paths[0])

    #self.LC_config_xml_path = self.get_option_value("Docs", "LC_config_xml_path")

    if self.LC_config_xml_path == None or self.LC_config_xml_path == "" :
      raise ConfigException(None, MISS_LCC_PATH)
    self.LC_config_xml_path = self.LC_config_xml_path.replace("\\", "/")
    global extCFG
    extCFG = LCextCFGTemplate
    self.profileDict = {}
    self.BIZCardDict = {}
    self.STDict = {}
    self.BIZCardDict['javlin'] = ""
    self.profileDict['LC_connect_attempt_count'] = 20
    self.profileDict['LC_connect_attempt_interval'] = 500
    self.LCC_config_filepath = os.path.join(self.LC_config_xml_path, LCC_CONFIG_NAME)
    doc = parse(self.LCC_config_filepath)
    root = doc.documentElement
    lcc_configs = root.getElementsByTagName(LCC_CONFIG_CONFIG)
    if root.getAttribute('id') == 'LotusConnections':
      lcc_config_version = root.getAttribute('buildlevel')
      #if string.atof(lcc_config_version[2:lcc_config_version.index('_')]) < 5.0:
      #  self.isBIZCardDisabled = True
    serviceReferences = root.getElementsByTagName(SERV_REF)
    for serviceReference in serviceReferences:
      serviceName = serviceReference.getAttribute(SERV_NAME)
      enabled = serviceReference.getAttribute('enabled')
      ssl_enabled = serviceReference.getAttribute('ssl_enabled')
      elements = serviceReference.getElementsByTagName(SLOC_STATIC)
      path_root = ""
      ssl_path_root = ""
      if elements:
        path_root = elements[0].getAttribute('href')
        if ssl_enabled == "true":
          ssl_path_root = elements[0].getAttribute('ssl_href')
      else:
        continue
      if serviceName == SERV_NAME_PROFILES:
        if enabled == "true":
          self.STDict['KW_ST_TUNNEL'] = path_root.replace("http://", "").replace("https://", "")+ST_TUNNEL_APPFIX
          prefix = serviceReference.getElementsByTagName(SLOC_PREFIX)
          if prefix:
            path_app_fix = prefix[0].childNodes[0].nodeValue
            if not path_app_fix:
              continue
            self.profileDict['LC_profile_root'] = path_root+path_app_fix
            if ssl_path_root != "" and ssl_enabled == "true":
              self.profileDict['ssl_LC_profile_root'] = ssl_path_root+path_app_fix
            else:
              self.profileDict['ssl_LC_profile_root'] = path_root+path_app_fix
          else:
            continue
        else:
          self.isProfileDisabled = True
      elif serviceName == SERV_NAME_PERSON_TAG:
        if enabled == "true":
          BIZ_appendix = '/javascript/semanticTagService.js?inclDojo=false&loadCssFiles=false&debug=true'
          prefix = serviceReference.getElementsByTagName(SLOC_PREFIX)
          if prefix:
            path_app_fix = prefix[0].childNodes[0].nodeValue
            if not path_app_fix:
              continue
            self.BIZCardDict['LC_BIZCard_root'] = path_root+path_app_fix+BIZ_appendix
            if ssl_path_root != "" and ssl_enabled == "true":
              self.BIZCardDict['ssl_LC_BIZCard_root'] = ssl_path_root+path_app_fix+BIZ_appendix
            else:
              self.BIZCardDict['ssl_LC_BIZCard_root'] = path_root+path_app_fix+BIZ_appendix
          else:
            continue
        else:
          self.isBIZCardDisabled = True
      elif serviceName == SERV_NAME_STPROXY:
        if enabled == "true":
          domain = self.get_option_value("Docs", KW_ST_DOMAIN)
          if domain != None:
            self.STDict['KW_ST_DOMAIN'] = domain
          else:
            self.STDict['KW_ST_DOMAIN'] = ""
          self.STDict['KW_ST_SERVER'] = path_root
          if ssl_path_root != "" and ssl_enabled == "true":
            self.STDict['KW_SSL_ST_SERVER'] = ssl_path_root
          else:
            self.STDict['KW_SSL_ST_SERVER'] = path_root
        else:
          self.isSTDisabled = True

  def getProfileCFGInJSON(self):
    if not self.isProfileDisabled:
      self.profileDict['LC_use_initial_name'] = self.is_use_initial_name
      ProfileJSONString = string.Template('{\\"root\\": \\"$LC_profile_root\\",\\"ssl_root\\": \\"$ssl_LC_profile_root\\",\\"nConnectAttemptCount\\": $LC_connect_attempt_count,\\"nConnectAttemptInterval\\": $LC_connect_attempt_interval,\\"useInitialName\\":$LC_use_initial_name}')
      return ProfileJSONString.substitute(self.profileDict)
    else:
      return "null"
  def getBIZCardCFGInJSON(self):
    if not self.isBIZCardDisabled:
      BIZCardJSONString = string.Template('{\\"root\\": \\"$LC_BIZCard_root\\",\\"ssl_root\\": \\"$ssl_LC_BIZCard_root\\",\\"bBIZCardAvailable\\": true,\\"javlin\\": \\"$javlin\\"}')
      return BIZCardJSONString.substitute(self.BIZCardDict)
    else:
      return "null"
  def getSTCFGInJSON(self):
    if not self.isSTDisabled:
      self.STDict['chatCFG'] = chatCFG
      self.STDict['extCFG'] = extCFG
      self.STDict['pluginsCFG'] = pluginsCFG
      if self.is_social_in_smart_cloud or self.isBIZCardDisabled:
        self.STDict['BIZCardStatus'] = 'false'
      else:
        self.STDict['BIZCardStatus'] = 'true'
      stproxyString = string.Template(stproxyCFG).substitute(self.STDict)
      self.STDict['stproxyCFG'] = stproxyString
      STJSONString = string.Template(STCFG)
      return STJSONString.substitute(self.STDict)
    else:
      return "null"

  def dealWithSocialSmartCloud(self):
    self.is_social_in_smart_cloud = True
    self.isProfileDisabled = False
    self.isBIZCardDisabled = False
    global extCFG
    extCFG = SCextCFGTemplate
    self.isSTDisabled = (self.get_option_value("Docs", 'st_in_sc') == "false")

    if not self.isSTDisabled:
        self.STDict = {}
        self.STDict['KW_ST_DOMAIN'] = ""
        self.STDict['KW_ST_SERVER'] = self.get_option_value("Docs", KW_ST_SERVER)
        self.STDict['KW_SSL_ST_SERVER'] = self.get_option_value("Docs", KW_SSL_ST_SERVER)
        self.STDict['KW_ST_TUNNEL'] = self.get_option_value("Docs", KW_ST_TUNNEL)

    self.profileDict = {}
    self.profileDict['LC_connect_attempt_count'] = 20
    self.profileDict['LC_connect_attempt_interval'] = 500
    self.profileDict['LC_profile_root'] = self.get_option_value("Docs", "LC_profile_root")
    self.profileDict['ssl_LC_profile_root'] = self.get_option_value("Docs", "ssl_LC_profile_root")

    self.BIZCardDict = {}
    self.BIZCardDict['LC_BIZCard_root'] = self.get_option_value("Docs", "LC_BIZCard_root")
    self.BIZCardDict['ssl_LC_BIZCard_root'] = self.get_option_value("Docs", "ssl_LC_BIZCard_root")
    self.BIZCardDict['javlin'] = self.get_option_value("Docs", "javlin")

  def dealWithSametimeStandalone(self):
    self.is_ST_standalone_available = True
    self.isProfileDisabled = True
    self.isBIZCardDisabled = True
    self.STDict = {}
    domain = self.get_option_value("Docs", KW_ST_DOMAIN)
    if domain != None:
      self.STDict['KW_ST_DOMAIN'] = domain
    else:
      self.STDict['KW_ST_DOMAIN'] = ""
    server = self.get_option_value("Docs", KW_ST_SERVER)
    if server != None:
      self.STDict['KW_ST_SERVER'] = server
    else:
      raise ConfigException(None, MISS_ST_SERVER)
    ssl_server = self.get_option_value("Docs", KW_SSL_ST_SERVER)
    if ssl_server != None:
      self.STDict['KW_SSL_ST_SERVER'] = ssl_server
    else:
      raise ConfigException(None, MISS_SSL_ST_SERVER)
    self.STDict['KW_ST_TUNNEL'] = 'dummy'

  def get_housekeeping_owner_hostname(self):
    if self.housekeeping_owner_hostname is None:
      self.housekeeping_owner_hostname = ""
    return self.housekeeping_owner_hostname

  def get_migration_owner_hostname(self):
    if self.migration_owner_hostname is None:
      self.migration_owner_hostname = ""
    return self.migration_owner_hostname

  def get_version_value(self):
    return self.version_value

  def get_current_version_value(self):
    if self.current_version_value:
      return self.current_version_value

    CONFIG_JSON_SUB_DIR = "IBMDocs-config"
    CONCORD_JSON_NAME = "concord-config.json"
    was_dir = self.was_install_root
    cell_name = self.get_cell_name()
    concord_json_path = was_dir + "/config/cells/" + cell_name + "/"\
    + CONFIG_JSON_SUB_DIR + "/" + CONCORD_JSON_NAME

    # check build-info in the conversion-config.json first
    if os.path.exists(concord_json_path) and os.path.isfile(concord_json_path):
      concord_json_file = open(concord_json_path)
      concord_json = json.load(concord_json_file)
      if "build-info" in concord_json:
        self.current_version_value = concord_json["build-info"]["build_version"]
      if self.current_version_value:
        return self.current_version_value

    # for old release, check version.txt
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

  def get_db_name(self):
    return self.db_name

  def get_software_mode(self):
    return self.software_mode

  def get_journal_properties(self):
    return self.journal_properties

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
  def get_multitenancy_enablement(self):
    return self.multitenancy_enablement.lower()

  def get_db_driver(self):
    return self.db_jdbc_driver_path

  def get_db_type(self):
    return self.db_type.strip()

  def get_db_hostname(self):
    return self.db_hostname

  def get_db_port(self):
    return self.db_port

  def get_lib_spi_concord(self):
    return self.lib_spi_concord

  def get_lib_spi_adpaters(self):
    return self.lib_spi_adapters

  def get_lib_dir(self):
    return self.lib_dir

  def get_conversion_servic_url(self):
    return self.conversion_url + "/ConversionService"

  def get_conversion_result_url(self):
    return self.conversion_url + "/ConversionResult"

  def get_activity_url(self):
    return self.activity_url

  def get_files_url(self):
    return self.files_url

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
    return self._cf.items("Docs")

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

  def get_tag_dir(self):
    return self.tag_dir

  def get_logs_dir(self):
    return self.logs_dir

  def get_config_dir(self):
    return self.config_dir

  def get_temp_dir(self):
    return self.temp_dir

  def get_local_data_dir(self):
    return self.local_data_dir

  def get_shared_data_dir(self):
    # For UNC PATH: \\host\path -> //host/path
    # For local path: c:\\shared\\data -> c:/shared/data
    return self.shared_data_dir.replace("\\", "/")

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

  def _read_db_credential(self):
    global GDB_ADMIN_ID
    global GDB_ADMIN_PW
    if GDB_ADMIN_ID == None or GDB_ADMIN_PW == None or \
    GDB_ADMIN_ID == '' or GDB_ADMIN_PW == '' :
      if self.db_user_id == None or self.db_user_pw == None or \
      self.db_user_id == '' or self.db_user_pw == '' :
        name, pw = read_wscred.read_db_credential()
        self.db_user_id = name
        self.db_user_pw = pw
        GDB_ADMIN_ID = name
        GDB_ADMIN_PW = pw
    else:
      self.db_user_id = GDB_ADMIN_ID
      self.db_user_pw = GDB_ADMIN_PW

  def get_cell_name(self):
    if self.cell_name is not None:
      return self.cell_name

    # Get the cell name
    log.info("Start to get cell name...")
    cell_name_args = self.get_was_cmd_line()
    cell_name_args.extend(["-f",  "./docs/tasks/get_cell_name.py"])
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

  def set_error_info(self, info):
    self.error_info.append(info)

  def get_error_info(self):
    return self.error_info

  def get_is_dmgr_node_on_host(self):
    return self.is_dmgr_node_on_host

  def set_is_dmgr_node_on_host(self,isDmgrHost):
    self.is_dmgr_node_on_host = isDmgrHost

  def get_user_install_root(self):
    return self.user_install_path

  def set_user_install_root(self,userInsPath):
    self.user_install_path = userInsPath

  def get_was_adminid(self):
    self._read_was_credential()
    return self.was_adminid

  def get_was_adminpw(self):
    self._read_was_credential()
    return self.was_adminpw

  def get_db_adminid(self):
    self._read_db_credential()
    return self.db_user_id

  def get_db_adminpw(self):
    self._read_db_credential()
    return self.db_user_pw

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
    return DOCS_NAME

  def get_web_app_name(self):
    return WEB_NAME

  def get_sc_app_name(self):
    return SC_NAME

  def get_ids_app_name(self):
    return IDS_NAME

  def get_help_app_name(self):
    return DOCS_HELP_NAME

  def get_ear_name(self, app_name):
    if app_name ==  DOCS_NAME:
      return DOCS_EAR_PRE
    elif app_name == WEB_NAME:
      return WEB_EAR_PRE
    elif app_name == SC_NAME:
      return SC_EAR_PRE
    elif app_name == IDS_NAME:
      return IDS_EAR_PRE
    elif app_name == DOCS_HELP_NAME:
      return HELP_EAR_PRE
    else:
      return DOCS_EAR_PRE

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

  def get_profile_root(self):
    if self.profile_root_init:
      return self.profile_root

    if self.node_name:
      args = self.get_was_cmd_line()
      args.extend(["-f",  "./docs/tasks/get_profile_root.py"])
      args.extend([self.node_name])

      succ, ws_out = call_wsadmin(args)
      if succ:
        for line in ws_out.split('\n'):
          if line.find('profile root:') > -1:
            self.profile_root = line.strip(' \r\n\t').replace('profile root:','')
            break

    self.profile_root_init = True
    return self.profile_root

  def get_was_install_root (self):
    return self.was_install_root

  def get_cfg_path(self):
    return self.cfg_path

  def get_spreadsheet_nodejs_install(self):
    return self.spreadsheet_nodejs_install

  def get_restart_webservers (self):
    if self.restart_webservers.lower() == "true":
      return True
    return False

  def get_non_job_mgr_mode(self):
    return self.non_job_mgr_mode

  def get_webserver_name (self):
    return self.webserver_name

  def get_map_webserver(self):
      if GMAP_WEBSERVER.lower() == 'true':
          return True
      else:
          return False

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
