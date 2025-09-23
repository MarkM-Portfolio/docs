import os
import ConfigParser
import optparse
import logging
import shutil
try:
  import json
except ImportError: 
  import simplejson as json
class Config:
  def get_input(self):
    usage = "usage: %prog [options] arg"
    parser = optparse.OptionParser(usage)
    parser.add_option("-r","--installroot", dest="install_root", help="conversion install root")
    parser.add_option("-n","--symcount", dest="sym_count", help="conversion symphony count")  
    (options, args) = parser.parse_args()
    if(not os.path.exists(options.install_root)):
      raise Exception(options.install_root  + " does not exsist. Check your conversion install root.")
    self.sym_count = options.sym_count
    self.install_root = options.install_root.replace('__docsspace__', ' ')
    self.finish_status_file_name = os.path.join(self.install_root, 'logs', 'node_finish_status.json')
    self.backup_dir = os.path.join(self.install_root, "backup") 
    self.build_root = "../"
    self.log_path =  os.path.join(self.install_root, "logs", "fixpack.log" )
  def init_log(self, log_path):
    """initiate log setting"""  
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(message)s',
                        filename=log_path,
                        filemode='w')
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)    
  
  def __init__(self):   
    self.get_input()
    if os.path.exists(self.log_path):
      os.remove(self.log_path)
    if os.path.exists(self.finish_status_file_name):
      os.remove(self.finish_status_file_name)
    self.init_log(self.log_path)
    if os.path.exists(self.backup_dir):
      shutil.rmtree(self.backup_dir)    
CONFIG=Config()