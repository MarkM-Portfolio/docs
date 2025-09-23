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
import ConfigParser
from ConfigParser import NoSectionError, NoOptionError

from util import read_wscred

GWAS_ADMIN_ID = None
GWAS_ADMIN_PW = None
GACCEPT_LICENSE = None
IC_VERSION_MODE = {"3.0": "IS_EAR", "3.5": "IS_JAR"}

class Config:
  def __init__(self):
    self._cf = ConfigParser.SafeConfigParser()
    if len(sys.argv) > 1:
      self._cf.readfp(open(sys.argv[1]))
    else:
      self._cf.readfp(open("cfg.properties"))

    self.component_name = "icext"
    self.install_root = self.get_option_value("ICExt","ic_install_root")
    
    self.was_dm_profile_root = self.get_option_value("ICExt","was_dm_profile_root")
    self.was_soap_port = int(self.get_option_value("ICExt","was_soap_port"))
    self.scope_type = self.get_option_value("ICExt","files_scope")
    self.scope_name = self.get_option_value("ICExt","files_scope_name")
    if self.scope_type.lower() == "server":
      self.node_name = self.get_option_value("ICExt","files_node_name")
    else:
      self.node_name = ""
    
    self.news_scope_type = self.get_option_value("ICExt","news_scope")
    self.news_scope_name = self.get_option_value("ICExt","news_scope_name")
    if self.news_scope_type.lower() == "server":
      self.news_node_name = self.get_option_value("ICExt","news_node_name")
    else:
      self.news_node_name = ""
    
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


  def get_license_accept(self):
    if GACCEPT_LICENSE.lower() == 'true':
      return True
    else:
      return False
  
  def get_context_root_proxy(self):
    return self.context_root_proxy 
  
  def get_ignore_event(self):
    return self.ignore_event
  
  def get_docs_server_url(self):
    return self.docs_server_url
  
  def get_entitlement(self):
    return self.entitlement 

  def get_context_root(self):
    return self.context_root 

  def get_icext_jar_location(self):

    # back door for user customizing extension location
    if self.has_option('ICExt','ext_jar_location'):
      jar_location = self.get_option_value('ICExt','ext_jar_location')
      if jar_location.strip() != '':
          return jar_location
    
    location_map = {
        '4.x' : 'data/shared/provision/webresources',
        '3.x' : 'Data/provision/webresources'
        }
    
    version_text = self.ic_version.strip()
    if version_text.startswith('4.'): # 4.x
      jar_location = os.path.join(self.install_root,location_map['4.x'])
    elif version_text.startswith('3.'): # 3.x
      jar_location = os.path.join(self.install_root,location_map['3.x'])
    else:
      raise Exception('ic_version setting in cfg.properties is invalid: %s' % version_text)

    return jar_location
  
  def get_daemon_location(self):
    location_map = {
        '4.x' : 'data/shared/docs.daemon',
        '3.x' : 'Data/docs.daemon'
    }
    
    version_text = self.ic_version.strip()
    if version_text.startswith('4.'): # 4.x
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
  
  def get_was_dm_profile_dir(self):
    return self.was_dm_profile_root;

  def get_wsadmin_script(self):
    was_admin = ""
    if os.name == "nt":
      was_admin = self.was_dm_profile_root + "/bin/wsadmin.bat"
    else:
      was_admin = self.was_dm_profile_root + "/bin/wsadmin.sh"

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
  
  def get_news_scope_type(self):
    return self.news_scope_type

  def get_news_scope_name(self):
    return self.news_scope_name

  def get_news_node_name(self):
    return self.news_node_name
  
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
    return "com.ibm.concord.lcfiles.ext"

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

  def prepare_news_scope(self):
    servers = []
    clusters = []
    if self.get_news_scope_type().lower() == "cluster":
      clusters.append(self.get_news_scope_name())
    else:
      server={}
      server["nodename"] = self.get_news_node_name()
      server["servername"] = self.get_news_scope_name()
      servers.append(server)

    return (servers, clusters)

CONFIG=Config()
