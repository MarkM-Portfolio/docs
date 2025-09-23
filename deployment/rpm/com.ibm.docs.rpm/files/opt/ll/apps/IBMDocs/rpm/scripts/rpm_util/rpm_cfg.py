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


'''
The module contains rpm installation 
configuration information
'''
import socket
import sys
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/scripts/ac/jvm/')
from getPortFromZnode import *
from registryLib import *
sys.path.append('/opt/ll/lib/apache/zookeeper')
from zooKeeperLib import *

class RPM_CFG(object):
    def __init__(self):
        
        #WAS info for creating profile
        self.was_username = '' #query from registry,'wasadmin'
        self.was_password = '' #query from registry,'passw0rd'
        self.was_servername = 'server1'
        self.was_profilename = 'AppSrv01' 
        self.was_nodename = '' # dynamic generate by get_was_nodename()
        
        #DB info
        self.db_type = 'db2' # always DB2 for Smart cloud
        self.db_username = ''
        self.db_password = ''
        self.db_hostname = ''
        self.db_port = ''
        self.db_jdbc_driver_path = '/opt/ll/lib/db2/V9.7'
        self.db_name = ''

        #cfg.properties
        self.cfg_name = 'cfg.properties'
        self.rpm_cfg_name = 'rpm_cfg.properties'
        self.was_installroot = '/opt/IBM/WebSphere/AppServer'
        self.was_soapport = '8880'
        self.was_scope = 'Server'
        self.was_scopename = 'server1'
         
        self.docs_installroot = '/opt/IBM/IBMDocs'
        self.shared_datadir = '/opt/ll/runtime/data/data'
        self.conversion_url = ''
        self.ic_admin_j2c_alias = 'connectionsAdmin'
        self.files_url = '' # by get_files_url()
        self.connections_url = '' # by get_connections_url()
        self.activities_url = '' # by get_activities_url()
        self.docs_call_back_url = '' # by get_docs_call_back_url()
        
        #for install
        self.build_dir = '../'
        
        #for s2s token
        self.s2s_token = ''

        #for ldap 
        self.ids_ip = ''
        
        #for housekeeping
        self.housekeeping_owner_hostname = ''

        #for migration
        self.migration_owner_hostname = ''

        #for zookeeper
        self.registryParser = RegistryParser()
        self.zooKeeperClient = ZooKeeperClient()
        
        #for docs multiactive
        self.bDocsMultiActive = self.registryParser.getSetting('Docs','is_docs_multiactive')
       
    def get_cfg_options(self):
        
        #Do not change it!
        self.cfg_options = [
                    ('docs_install_root',self.get_docs_installroot()),
                    ('shared_data_dir',self.get_shared_datadir()),
                    ('was_install_root',self.get_was_installroot()),
                    ('was_soap_port',self.get_was_soapport()),
                    ('scope',self.get_was_scope()),
                    ('scope_name',self.get_was_scopename()),
                    ('node_name',self.get_was_nodename()),
                    ('db_type',self.get_db_type()),
                    ('db_hostname',self.get_db_hostname()),
                    ('db_port',self.get_db_port()),
                    ('db_jdbc_driver_path',self.get_db_driver()),
                    ('conversion_url',self.get_conversion_url()),
                    ('ic_admin_j2c_alias',self.get_ic_j2calias()),
                    ('files_url',self.get_files_url()),
                    ('email_url',self.get_connections_url()),
                    ('activities_url',self.get_activities_url()),
                    ('docs_call_back_url', self.get_docs_call_back_url()),
                    ('mt',self.get_multitenancy_enablement()),
                    ('software_mode',self.get_software_mode()),
                    ('db_name',self.get_db_name()),
                    ('housekeeping_server_host_name',self.get_housekeeping_owner_hostname()),
                    ('migration_server_host_name',self.get_migration_owner_hostname()),
                    ('st_in_sc',self.get_st_in_sc()),
                    ('ST_server',self.get_ST_server()),
                    ('SSL_ST_server',self.get_SSL_ST_server()),
                    ('ST_tunnelURI',self.get_ST_tunnelURI()),
                    ('LC_profile_root',self.get_profile_root()),
                    ('ssl_LC_profile_root',self.get_ssl_profile_root()),
                    ('LC_BIZCard_root',self.get_bizcard_root()),
                    ('ssl_LC_BIZCard_root',self.get_ssl_bizcard_root()),
                    ('social_suit_enabled',self.get_social_enabled()),
                    ('javlin',self.get_javlin()),
                    ('bss_be_url',self.get_bss_url()),
                    ('virtual_hosts_junction_domain',self.get_base_URL()),
                    ('non_job_mgr_mode',"True")                 
                ]
        return self.cfg_options
    def get_base_URL(self):
        return self.zooKeeperClient.getSettingByComponent('MiddlewareTAM', 'virtual_hosts_junction_domain')
    def get_social_enabled(self):
        return "true"
    def get_profile_root(self):
        baseURL = self.get_base_URL()
        return 'http://apps.'+baseURL
        
    def get_ssl_profile_root(self):
        baseURL = self.get_base_URL()
        return 'https://apps.'+baseURL

    def get_bizcard_root(self):
        baseURL = self.get_base_URL()
        return 'http://apps.'+baseURL
        
    def get_ssl_bizcard_root(self):
        baseURL = self.get_base_URL()
        return 'https://apps.'+baseURL
        
    def get_javlin(self):
        baseURL = self.get_base_URL()+'/contacts/js/@@@VERSION@@@/javlin.js'
        return baseURL

    def get_ST_baseURL(self):
        baseURL = self.get_base_URL()
        return 'webchat.'+baseURL

    def get_ST_tunnelURI(self):
        if self.get_st_in_sc() == "true":
            baseURL = self.get_base_URL()
            return 'apps.'+baseURL+'/downloads/tunnel.html'
        else:
            return ''
    def get_ST_server(self):
        if self.get_st_in_sc() == "true":
            baseURL = self.get_ST_baseURL()
            return 'http://'+baseURL
        else:
            return ''
    def get_SSL_ST_server(self):
        if self.get_st_in_sc() == "true":
            baseURL = self.get_ST_baseURL()
            return 'https://'+baseURL
        else:
            return ''

    def get_st_in_sc(self):
        if self.registryParser.containsComponent('SametimeWebChat'):
           return "true"
        else:
            return "false"

    def get_housekeeping_owner_hostname(self):
        if self.housekeeping_owner_hostname in [None,'']:
            self.housekeeping_owner_hostname = self.zooKeeperClient.getHostname('/topology/docs/servers/1')
            self.zooKeeperClient.createNode('/data/docs/housekeeping_owner_hostname',self.housekeeping_owner_hostname)
        return self.housekeeping_owner_hostname
    
    def get_migration_owner_hostname(self):
        if self.migration_owner_hostname in [None,'']:
            self.migration_owner_hostname = self.zooKeeperClient.getHostname('/topology/docs/servers/1')
        return self.migration_owner_hostname
            
    def get_multitenancy_enablement(self):
        return 'false'

    def get_db_type(self):
        return self.db_type
        
    def get_db_name(self):
        if self.db_name in [None,'']:
            self.db_name = self.registryParser.getSetting('AC','db_docs')
        return self.db_name

    def get_software_mode(self):
        return 'SC'

    def get_license_accept(self):
        return 'true'

    def get_ids_ip(self):
        if self.ids_ip in [None,'']:
            self.ids_ip = self.zooKeeperClient.getBackEndVIP('/topology/ids/vip')
        return self.ids_ip

    def get_s2s_token(self):
        if self.s2s_token in [None,'']:
            self.s2s_token = self.zooKeeperClient.getSettingByComponent('BSSCore','s2s_token')
        return self.s2s_token
        
    def get_db_username(self):
        if self.db_username in [None,'']:
            self.db_username = self.registryParser.getSetting('AC','database_application_username') #153909
        return self.db_username

    def get_db_password(self):
        if self.db_password in [None,'']:
            self.db_password = self.registryParser.getSetting('AC','database_application_password')
        return self.db_password
     
    def get_rpm_cfg_name(self):
        if self.rpm_cfg_name in [None,'']:
            #do something
            pass
        return self.rpm_cfg_name

    def get_build_dir(self):
        if self.build_dir in [None,'']:
            #do something
            pass
        return self.build_dir
                  
    def get_was_username(self):
        if self.was_username in [None,'']:
            self.was_username = self.registryParser.getSetting('MiddlewareWebSphere','admin_username')
        return self.was_username
    
    def get_was_password(self):
        if self.was_password in [None,'']:
            self.was_password = self.registryParser.getSetting('MiddlewareWebSphere','admin_password')
        return self.was_password

    def get_was_servername(self):
        if self.was_servername in [None,'']:
            #do something
            pass
        return self.was_servername

    def get_was_profilename(self):
        if self.was_profilename in [None,'']:
            #do something
            pass
        return self.was_profilename

    def get_was_installroot(self):
        if self.was_installroot in [None,'']:
            #do something
            pass
        return self.was_installroot
    
    def get_cfg_name(self):
        if self.cfg_name in [None,'']:
            #do something
            pass
        return self.cfg_name
    
    def get_docs_installroot(self):
        if self.docs_installroot in [None,'']:
            #do something
            pass
        return self.docs_installroot
    
    def get_shared_datadir(self):
        if self.shared_datadir in [None,'']:
            #do something
            pass
        return self.shared_datadir 
    def get_was_soapport(self):
        if self.was_soapport in [None,'']:
            #do something
            pass
        return self.was_soapport

    def get_was_scope(self):
        if self.was_scope in [None,'']:
            #do something
            pass
        return self.was_scope
    def get_was_scopename(self):
        if self.was_scopename in [None,'']:
            #do something
            pass
        return self.was_scopename
    def get_was_nodename(self):
        if self.get_was_scope().lower() == 'server' and \
                self.was_nodename in [None,'']:
            hostname = socket.gethostname().split('.')[0]
            self.was_nodename = 'ocs_app_node_%s' % hostname
        return  self.was_nodename

    def get_db_hostname(self):
        if self.db_hostname in [None,'']:
          if self.bDocsMultiActive == "true":
            self.db_hostname = self.zooKeeperClient.getBackEndInterface('/topology/docs_db2/servers/1')
          else:
            self.db_hostname = self.zooKeeperClient.getBackEndInterface('/topology/acdb2/servers/1')
#            self.db_hostname = self.registryParser.getSetting('F5', 'docs_db2_be_vip').split('/')[0]
        return self.db_hostname
    
    def get_db_port(self):
        if self.db_port in [None,'']:
            self.db_port = self.registryParser.getSetting('AC','database_instance_port')
        return self.db_port

    def get_db_driver(self):
        if self.db_jdbc_driver_path in [None,'']:
            #do something
            pass
        return self.db_jdbc_driver_path

    def get_conversion_url(self):
        if self.conversion_url in [None,'']:
            self.conversion_url = ''.join(['http://',self.zooKeeperClient.getBackEndVIP('/topology/viewernext/vip'),':9081/conversion'])  
        return self.conversion_url

    def get_ic_j2calias(self):
        if self.ic_admin_j2c_alias in [None,'']:
            #do something
            pass
        return self.ic_admin_j2c_alias

    def get_files_url(self):
        if self.files_url in [None,'']:
          if self.bDocsMultiActive == "true":
            fileshost = self.registryParser.getVSRHostByServiceName('ac')
          else:
            fileshost = self.zooKeeperClient.getBackEndVIP('/topology/ac/vip')
            
          self.files_url = ''.join(['http://',fileshost, ':', self.get_component_port("Files"), '/files'])
        return self.files_url
        
    def get_connections_url(self):
        if self.connections_url in [None,'']:
          if self.bDocsMultiActive == "true":
            fileshost = self.registryParser.getVSRHostByServiceName('ac')
          else:
            fileshost = self.zooKeeperClient.getBackEndVIP('/topology/ac/vip')
          self.connections_url = ''.join(['http://',fileshost,':', self.get_component_port('Common'), '/connections'])
        return self.connections_url        


    def get_activities_url(self):
        if self.activities_url in [None,'']:
          if self.bDocsMultiActive == "true":
            fileshost = self.registryParser.getVSRHostByServiceName('ac')
          else:
            fileshost = self.zooKeeperClient.getBackEndVIP('/topology/ac/vip')
          self.activities_url = ''.join(['http://',fileshost, ':', self.get_component_port("Activities"), '/activities'])  
        return self.activities_url

    def get_docs_call_back_url(self):
        if self.docs_call_back_url in [None,'']:
          baseURL = self.get_base_URL()
          self.docs_call_back_url = ''.join(['https://apps.',baseURL, '/docs/driverscallback'])
          print " docs_call_back_url = %s" % (self.docs_call_back_url)
        return self.docs_call_back_url
    
    def get_component_port(self, comp_name):                
        comp_port = getPortByComponent(comp_name)
        print " %s = %s" % (comp_name , comp_port)
        return comp_port

    def get_bss_url(self):
        if self.bDocsMultiActive == "true":
            bsshost = self.registryParser.getVSRHostByServiceName('bsscore')
        else:
            bsshost = self.zooKeeperClient.getBackEndVIP('/topology/bsscore/vip')
        bss_url = ''.join(['http://',bsshost,':8181/bss'])
        return bss_url

cfg = RPM_CFG()
