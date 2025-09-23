import os
import logging
import sys
import platform
from stat import *

from config import CONFIG
from util import FileInstall

class UpgradeStellent():   
  def __init__(self):
    self.stellent_new_dir = os.path.join(CONFIG.install_root,'stellent')  
    self.stellent_file_path = os.path.join(CONFIG.build_root,'org.oracle.oiexport.win32_'+self.__getOSBit()+'.zip')
    self.backup_dir = os.path.join(CONFIG.backup_dir, 'stellent')
    self.stellent_update_list = None        	
        
  def do_upgrade(self):             
    if os.path.exists(self.stellent_file_path):
      logging.info('Start to upgrade stellent... ')  
      file_install = FileInstall(self.stellent_file_path, self.stellent_new_dir, self.backup_dir)
      self.stellent_update_list = file_install.upgrade_zip_file()
      logging.info('Finish to upgrade stellent... ')
    else:
      logging.info('No need to upgrade stellent')         
    return True 

  def __getOSBit(self):
    if os.name == 'nt' and sys.version_info[:2] < (2,7):
      machine_type = os.environ.get("PROCESSOR_ARCHITEW6432",s.environ.get('PROCESSOR_ARCHITECTURE', ''))
    else:
      machine_type = platform.machine()
    machine2bits = {'AMD64': 'x64', 'x86_64': 'x64', 'i386': 'x86', 'x86': 'x86'}
    return machine2bits.get(machine_type, None)
    
  def undo_upgrade(self):
    if os.path.exists(self.backup_dir): 
      logging.info('Start to undo upgrade stellent... ')
      file_install = FileInstall(self.stellent_file_path, self.stellent_new_dir, self.backup_dir)
      file_install.undo_upgrade_files(self.stellent_update_list)       
      logging.info('Finish to undo upgrade stellent... ') 
    return True
UpgradeStellent = UpgradeStellent()           
        



        
        
