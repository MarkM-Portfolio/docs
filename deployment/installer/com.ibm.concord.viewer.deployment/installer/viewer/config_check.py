import os, sys,shutil
import string
import logging
import pdb
from .config_exception import ConfigException

check_path_exist = False

class ConfigItem:
    def __init__(self, name, must_have, dependent=None, dependent_value=None):
        self.name = name
        #self.value = value
        self.must_have = must_have
        self.dependent = dependent
        self.dependent_value = dependent_value
    
    def check(self, value, dependent_value):
        if self.must_have and value == '':
            raise ConfigException(None, "'%s' cannot be empty." % self.name)
            
        else:
            if self.dependent and dependent_value.lower() == self.dependent_value.lower():
                if value == '':
                    raise ConfigException(None, "'%s' must be specified because '%s' is set as '%s'." % (self.name, self.dependent, self.dependent_value))
        
class PathItem(ConfigItem):
    check_exist = False
    
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)
        #pdb.set_trace()
        if self.must_have and self.check_exist:
            if not os.path.exists(value):
                raise ConfigException(None, "'%s' does not exist." % value)

class BoolItem(ConfigItem):
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)
        
        if value.lower() != 'yes' and value.lower() != 'no':
            raise ConfigException(None, "%s should be either yes or no." % self.name)
    
class URLItem(ConfigItem):
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)

        from urllib.parse import urlparse
        if value != '':
            url = urlparse(value)
            scheme = url[0]
            netloc = url[1]
            if scheme == '' or netloc == '' or (scheme != 'http' and scheme != 'https'):
                raise ConfigException(None, "'%s' is not a valid url." % value)
        
class NumItem(ConfigItem):
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)
        try:
            x = int(value)
            if x < 0:
                raise ConfigException(None, "'%s' has invalid value." % self.name)
        except Exception as e:
            try:
                y = float(value)
                if y < 0.1 or y > 0.9:
                    raise ConfigException(None, "'%s' has invalid value." % self.name)
            except Exception as e1:
                raise ConfigException(None, "'%s' has invalid value." % self.name)

class IntItem(ConfigItem):
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)
        if isinstance(value, str):
            if not value.isalnum():
                raise ConfigException(None, "'%s' has invalid value." % self.name)
            else:
                if '.' in value:
                    raise ConfigException(None, "'%s' has invalid value." % self.name)
                try:
                    x = int(value)
                    if x < 0:
                        raise ConfigException(None, "'%s' has invalid value." % self.name)
                except Exception as e:
                    raise ConfigException(None, "'%s' has invalid value." % self.name)
        else:
            try:
                x = isinstance(value, int) and x > 0
                if not x:
                    raise ConfigException(None, "'%s' has invalid value." % self.name)
            except Exception as e:
                raise ConfigException(None, "'%s' has invalid value." % self.name)

class TextItem(ConfigItem):
    def __init__(self, name, must_have, value_set, dependent=None, dependent_value=None):
        ConfigItem.__init__(self, name, must_have, dependent, dependent_value)
        self.value_set = value_set
        
    def check(self, value, dependent_value=None):
        ConfigItem.check(self, value, dependent_value)

        if self.value_set and not value.lower() in self.value_set:
            raise ConfigException(None, "'%s' is not set with a valid value.  Check the cfg.properties file for more information." % self.name)
        
predefined_property_dict = {
  'shared_data_dir': PathItem('shared_data_dir', True),
  'was_install_root' : PathItem('was_install_root', True),
  'was_soap_port' : IntItem('was_soap_port', True),
  'conversion_url' : URLItem('conversion_url', True),
  'files_path' : PathItem('files_path', False),
  'files_url' : URLItem('files_url', False, None),
  'ic_admin_j2c_alias' : TextItem('ic_admin_j2c_alias', False, None),
  'editor_installed' : TextItem('editor_installed', True, ['yes', 'no']),
  'docs_url' : URLItem('docs_url', False, 'editor_installed', 'yes'),  
  'docs_shared_data_dir': PathItem('docs_shared_data_dir', False, 'editor_installed', 'yes'),
  'scope' : TextItem('scope', True, ['cluster', 'server', 'a', 'b']),
  'scope_name' : TextItem('scope_name', True, None),
  'node_name' : TextItem('node_name', False, None, 'scope', 'server'),
  'browser_cache' : TextItem('browser_cache', True, ['yes', 'no']),
  'enable_print' : TextItem('enable_print', True, ['yes', 'no']),
  'auth_type' : TextItem('auth_type', True, ['tam', 'form']),
  'auth_host' : URLItem('auth_host', False, 'auth_type', 'TAM'),
  'multi_tenancy' : TextItem('multi_tenancy', True, ['true', 'false']),
  'convert_on_upload' : TextItem('convert_on_upload', True, ['yes', 'no']),
  'viewer_install_root' : PathItem('viewer_install_root', True),
  'housekeeping_frequency' : TextItem('housekeeping_frequency', True, ['now', 'hourly', 'daily', 'weekly', 'monthly']),
  'housekeeping_age_threshold_of_rendition_latest_version' : IntItem('housekeeping_age_threshold_of_rendition_latest_version', True),
  'housekeeping_size_threshold_of_rendition_cache' : NumItem('housekeeping_size_threshold_of_rendition_cache', True),
  'external_s2s_method' : TextItem('external_s2s_method',False,None),
  'external_customer_id' : TextItem('external_customer_id',False,None),
  'external_oauth_endpoint' : URLItem('external_oauth_endpoint',False,None),
  'external_oauth_authorize' : URLItem('external_oauth_authorize',False,None),
  'external_j2c_alias' : TextItem('external_j2c_alias',False,None),
  'external_s2s_token' : TextItem('external_s2s_token',False,None),
  'external_token_key' : TextItem('external_token_key',False,None),
  'external_as_user_key' : TextItem('external_as_user_key',False,None),
  'external_cmis_atom_pub' : URLItem('external_cmis_atom_pub',False,None),
  'external_object_store' : TextItem('external_object_store',False,None),
  'docs_call_back_url' : URLItem('docs_call_back_url',False,None),
  'external_repository_home' : URLItem('external_repository_home',False,None),
  'external_meta_url' : URLItem('external_meta_url',False,None),
  'external_get_content_url' : URLItem('external_get_content_url',False,None),
  'external_profiles_url' : URLItem('external_profiles_url',False,None),
  'toscana_file_server' : URLItem('toscana_file_server',False,None),
  'toscana_oauth_endpoint' : URLItem('toscana_oauth_endpoint',False,None),
  'local_host_domain' : TextItem('local_host_domain',False,None)
}

obsolete_property_dict = {
  'ecm_fncmis_server_url' : URLItem('ecm_cmis_server_url', False, None),
  'ecm_fncs_server_url' : URLItem('ecm_fncs_server_url', False, None),
  'ecm_admin_j2c_alias' : TextItem('ecm_admin_j2c_alias', False, None),
  'ecm_community_server_url' : URLItem('ecm_community_server_url', False, None)
}

def do_check(properties):
    for p in properties:
        if p not in obsolete_property_dict:
            if p in predefined_property_dict:
                item = predefined_property_dict[p]
                if check_path_exist and isinstance(item, PathItem):
                    item.check_exist = True
                #pdb.set_trace()
                if item.dependent:
                    if item.dependent in properties:
                        item.check(properties[p], properties[item.dependent])
                    else:
                        raise ConfigException(None, "'%s' depends on the value of '%s'." % (p, item.dependent))
                else:
                    item.check(properties[p])
            else:
                raise ConfigException(None, "'%s' is not a legal property.  Remove it from the cfg.properties file." % p)

if __name__ == "__main__":
    prop = {
        'housekeeping_size_threshold_of_rendition_cache': "0.01"
    }
    do_check(prop)