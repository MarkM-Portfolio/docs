import configparser
from configparser import NoSectionError, NoOptionError

class ConfigException(Exception):
  def __init__(self, e=None, msg=None):
    self.e = e
    if msg:
      self.message = msg
    elif e:
      self.message = e._Error__message
    else:
      self.message = "config error"
    Exception.__init__(self, self.message)
  
  def get_message(self):
    return self.message
