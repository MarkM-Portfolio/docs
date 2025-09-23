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
  'ext_install_root': PathItem('ext_install_root', True),
  'was_install_root' : PathItem('was_install_root', True),
  'was_soap_port' : IntItem('was_soap_port', True),
  'enable_upload_conversion' : TextItem('enable_upload_conversion', True, ['yes', 'no']),
  'auth_type' : TextItem('auth_type', True, ['basic', 'saml']),
  'viewer_admin_j2c_alias' : TextItem('viewer_admin_j2c_alias', True, None),
  'files_scope' : TextItem('files_scope', True, ['cluster', 'server', 'a', 'b']),
  'files_scope_name' : TextItem('files_scope_name', True, None),
  'files_node_name' : TextItem('files_node_name', False, None, 'files_scope', 'server'),
  'news_scope' : TextItem('news_scope', True, ['cluster', 'server', 'a', 'b']),
  'news_scope_name' : TextItem('news_scope_name', True, None),
  'news_node_name' : TextItem('news_node_name', False, None, 'news_scope', 'server'),
  'common_scope' : TextItem('common_scope', True, ['cluster', 'server', 'a', 'b']),
  'common_scope_name' : TextItem('common_scope_name', True, None),
  'common_node_name' : TextItem('common_node_name', False, None, 'common_scope', 'server'),
  'viewer_server_url' : URLItem('viewer_server_url', True),
  'restart_connections': TextItem('restart_connections', True, ['true', 'false']),
  'ic_extension_path' : PathItem('ic_extension_path', True),
  'deamon_shared_path' : PathItem('deamon_shared_path', True),
  'ccm_enabled' : TextItem('ccm_enabled', True, ['true', 'false'])
}

def do_check(properties):
    for p in properties:
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
        'viewer_admin_j2c_alias' : '',
        'auth_type': 'basic'
    }
    do_check(prop)