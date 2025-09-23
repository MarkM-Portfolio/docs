import os, logging, shutil, subprocess, time, stat

from config import CONFIG
from util import ZipCompat

NATIVE_ZIP_NAME = "native.zip"
CONVERSIONLIB_DIR_NAME = "conversionlib"
WMF2PNG_DIR_NAME = "wmf2png"
BACKUP_DIR_NAME = "native"

class UpgradeNativeFiles():
  """
  This command will unzip native.zip to install root.
  """
  def __init__(self):
    self.native_src_path = os.path.join(CONFIG.build_root, NATIVE_ZIP_NAME)
    self.native_dest_dir = CONFIG.install_root
    self.backup_dir = os.path.join(CONFIG.backup_dir, BACKUP_DIR_NAME)
    self.conversionlib_dest_dir = os.path.join(self.native_dest_dir, CONVERSIONLIB_DIR_NAME)
    self.wmf2png_dest_dir = os.path.join(self.native_dest_dir, WMF2PNG_DIR_NAME)
    self.conversionlib_bakup_dir = os.path.join(self.backup_dir, CONVERSIONLIB_DIR_NAME)
    self.wmf2png_bakup_dir = os.path.join(self.backup_dir, WMF2PNG_DIR_NAME)

  def install_native(self):
    if os.path.exists(self.native_src_path):
      zip_file = ZipCompat(self.native_src_path)
      zip_file.extractall(self.native_dest_dir)
    if os.name != "nt":
      convertor_path = os.path.join(self.conversionlib_dest_dir, "ooxmlconvertor")
      if os.path.exists(convertor_path):
        os.chmod(convertor_path,stat.S_IRWXU|stat.S_IXGRP|stat.S_IXOTH)
      exporter_path = os.path.join(self.conversionlib_dest_dir, "data", "ix-8-5-3-linux-x86-64", "redist", "exporter")
      if os.path.exists(exporter_path):
        os.chmod(exporter_path,stat.S_IRWXU|stat.S_IXGRP|stat.S_IXOTH) 
  
  def delete_native(self):
    if os.path.exists(self.conversionlib_dest_dir):
      try:
        shutil.rmtree(self.conversionlib_dest_dir, True)
      except Exception, e:
        pass
    if os.path.exists(self.wmf2png_dest_dir):
      try:
        shutil.rmtree(self.wmf2png_dest_dir, True)
      except Exception, e:
        pass  
  
  def stop_ooxml(self):
    logging.info("Stopping the OOXMLConverter processes...")
    subprocess.call(["taskkill.exe", "/f", "/im", "OOXMLConvertor.exe"])
    time.sleep(10)
    
  def do_upgrade(self):
    if os.path.exists(self.native_src_path):
      self.upgrade()
    else:
      logging.info('No need to upgrade native')
    return True
      
  def upgrade(self):    
    logging.info("Start to upgrade native files...")
    if os.name == 'nt':
      self.stop_ooxml()   
    logging.info("Backing up the native files...");
    if os.path.exists(self.backup_dir):
      try:
        shutil.rmtree(self.backup_dir, True)
      except Exception, e:
        pass
    
    if not os.path.exists(self.backup_dir):
      os.makedirs(self.backup_dir)
    
    if os.path.exists(self.conversionlib_dest_dir):
      shutil.move(self.conversionlib_dest_dir, self.backup_dir)
    if os.path.exists(self.wmf2png_dest_dir):
      shutil.move(self.wmf2png_dest_dir, self.backup_dir)
    
    self.install_native();
    logging.info("Native files are upgraded successfully")
  
  def undo_upgrade(self):
    logging.info("Start to undo upgrade native files...")
    
    self.delete_native()
    if os.path.exists(self.conversionlib_bakup_dir):
      shutil.move(self.conversionlib_bakup_dir, self.native_dest_dir)
    if os.path.exists(self.wmf2png_bakup_dir):
      shutil.move(self.wmf2png_bakup_dir, self.native_dest_dir)
    
    logging.info("Undo upgrade native files successfully")
UpgradeNativeFiles = UpgradeNativeFiles()    