# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


import os, logging, shutil, subprocess, time, stat

from common import command, CFG, ZipCompat

NATIVE_ZIP_NAME = "native.zip"
CONVERSIONLIB_DIR_NAME = "conversionlib"
WMF2PNG_DIR_NAME = "wmf2png"
BACKUP_DIR_NAME = "native"
SLES_RELEASE = "/etc/SuSE-release"
RHEL_RELEASE = "/etc/redhat-release"
CENTOS_RELEASE = "/etc/centos-release"
INSTALL_LIB_LIST = ["ImageMagick","glibc.i686","gtk2.i686","libSM.i686"]
class InstallNativeFiles(command.Command):
  """
  This command will unzip native.zip to install root.
  """
  def __init__(self):
    self.config = CFG
    self.build = self.config.get_build_dir()
    self.native_src_path = os.path.join(self.build, NATIVE_ZIP_NAME)
    self.native_dest_dir = self.config.get_install_root()
    self.backup_dir = os.path.join(CFG.get_temp_dir(), BACKUP_DIR_NAME)
    self.conversionlib_dest_dir = os.path.join(self.native_dest_dir, CONVERSIONLIB_DIR_NAME)
    self.wmf2png_dest_dir = os.path.join(self.native_dest_dir, WMF2PNG_DIR_NAME)
    self.conversionlib_bakup_dir = os.path.join(self.backup_dir, CONVERSIONLIB_DIR_NAME)
    self.wmf2png_bakup_dir = os.path.join(self.backup_dir, WMF2PNG_DIR_NAME)
    
  def precheck(self):
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True

  def delete_native(self):
    if os.path.exists(self.conversionlib_dest_dir):
      try:
        shutil.rmtree(self.conversionlib_dest_dir, True)
      except Exception as e:
        pass
    if os.path.exists(self.wmf2png_dest_dir):
      try:
        shutil.rmtree(self.wmf2png_dest_dir, True)
      except Exception as e:
        pass
  
  def install_native(self):
    if os.path.exists(self.native_src_path):
      zip_file = ZipCompat(self.native_src_path)
      zip_file.extractall(self.native_dest_dir)
    if os.name != "nt":
      convertor_path = os.path.join(self.conversionlib_dest_dir, "ooxmlconvertor")
      if os.path.exists(convertor_path):
        os.chmod(convertor_path,stat.S_IRWXU|stat.S_IXGRP|stat.S_IXOTH) 
  
  def stop_ooxml(self):
    logging.info("Stopping the OOXMLConverter processes...")
    if os.name == "nt":
      subprocess.call(["taskkill.exe", "/f", "/im", "OOXMLConvertor.exe"])
      time.sleep(10)
  
  def install_imagemagick(self):
    logging.info("Installing ImageMagick and libs...")
    command_list = []
    if os.path.exists(SLES_RELEASE):
      command_list.extend(["zypper", "install", "-y"])	 
    elif os.path.exists(RHEL_RELEASE) or os.path.exists(CENTOS_RELEASE):
      command_list.extend(["yum", "install", "-y"])         
    else:
      command_list.extend["apt-get", "install", "-y"]
    command_list.extend(INSTALL_LIB_LIST)      
    subprocess.call(command_list)      
    logging.info("ImageMagick and libs are installed successfully")  
        
  def do(self):
    logging.info("Start to install native files...")
    self.delete_native()
    self.install_native()
    #if os.name != "nt":
    #  self.install_imagemagick()
    logging.info("Native files are installed successfully")
    return True

  def undo(self):
    logging.info("Strat to delete native files...")
    self.stop_ooxml()
    self.delete_native()
    logging.info("Native files are deleted successfully")
    return True
    
  def do_upgrade(self):
    logging.info("Start to upgrade native files...")
    self.stop_ooxml()
    
    logging.info("Baking up the native files...");
    if os.path.exists(self.backup_dir):
      try:
        shutil.rmtree(self.backup_dir, True)
      except Exception as e:
        pass
    
    if not os.path.exists(self.backup_dir):
      os.makedirs(self.backup_dir)
    
    if os.path.exists(self.conversionlib_dest_dir):
      shutil.move(self.conversionlib_dest_dir, self.backup_dir)
    if os.path.exists(self.wmf2png_dest_dir):
      shutil.move(self.wmf2png_dest_dir, self.backup_dir)
    
    self.install_native();
    logging.info("Native files are upgraded successfully")
    return True
  
  def undo_upgrade(self):
    logging.info("Start to undo upgrade native files...")
    
    self.delete_native()
    if os.path.exists(self.conversionlib_bakup_dir):
      shutil.move(self.conversionlib_bakup_dir, self.native_dest_dir)
    if os.path.exists(self.wmf2png_bakup_dir):
      shutil.move(self.wmf2png_bakup_dir, self.native_dest_dir)
    
    logging.info("Undo upgrade native files successfully")
    return True

    