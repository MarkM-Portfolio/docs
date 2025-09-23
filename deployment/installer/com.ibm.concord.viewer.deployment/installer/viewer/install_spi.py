# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-

import os, sys
from commands import command
from util.common import ZipCompat
import logging as log
from viewer.config import CONFIG as CFG
from util.common import FileInstall

Viewer_SPI_Name = "Viewer_SPI.zip"
Viewer_Adapters_Name = "Viewer_Adapters.zip"
Viewer_SPI_Backup_DIR = "Viewer_SPI"
Viewer_Adapters_Backup_DIR = "Viewer_Adapters"

class InstallSPI(command.Command):
  
  def __init__(self):
    self.viewer_bld_dir = CFG.get_build_dir()
    self.spi_viewer = CFG.get_lib_spi_viewer()
    self.spi_adapters = CFG.get_lib_spi_adpaters()
    self.spi_viewer_backup_dir = CFG.get_temp_dir() + os.sep + Viewer_SPI_Backup_DIR
    self.spi_adapters_backup_dir = CFG.get_temp_dir() + os.sep + Viewer_Adapters_Backup_DIR
    self.spi_viewer_updater = None
    self.spi_adapters_updater = None
    self.spi_viewer_centrolized=self.is_Empty(self.spi_viewer)
    self.spi_adapters_centrolized=self.is_Empty(self.spi_adapters)
  
  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
    return True
    
  def is_Empty(self, target_dir):
    if os.path.exists(target_dir) and os.path.isdir(target_dir) and len(os.listdir(target_dir))>0:
      return False
    else:
      return True
      
  def remove_bdl(self, osgi_dir):
    if not os.path.exists(osgi_dir):
      return

    bld_num=0
    for bdl in os.listdir(osgi_dir):
      full_bdl = osgi_dir + "/" + bdl
      os.remove(full_bdl)
      bld_num += 1

  def install_bdl(self, dest, zip_name):
    if not os.path.exists(dest):
      os.makedirs(dest)

    bdl_zip = ""
    for f in os.listdir(self.viewer_bld_dir):
      if f.find(zip_name) > -1:
        bdl_zip = self.viewer_bld_dir + "/" + f
        break
    if not bdl_zip:
      raise Exception("%sxxx not found from Viewer OSGI ZIP %s" %\
        (zip_name, self.viewer_bld_dir))
    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(dest)

  def do(self):
    log.info("Install SPI library for Viewer Server Started")

    self.remove_bdl(self.spi_viewer)
    self.remove_bdl(self.spi_adapters)
    self.install_bdl(self.spi_viewer, Viewer_SPI_Name)
    self.install_bdl(self.spi_adapters, Viewer_Adapters_Name)

    log.info("Install SPI library for Viewer Server completed")
    return True

  def undo(self):
    log.info("Start to uninstall SPI library for Viewer Server")

    self.remove_bdl(self.spi_viewer)
    self.remove_bdl(self.spi_adapters)
    #TODO need to remove the directory??
    #os.rmdir(self.spi_viewer)
    #os.rmdir(self.spi_adapters)
    
    log.info("Uninstall SPI library for Viewer Server completed")
    return True

  def do_upgrade(self):
    log.info("Upgrade SPI library for Viewer application Started")
    if self.spi_viewer_centrolized and self.spi_adapters_centrolized:
      return self.do()

    spi_file_path = os.path.join(self.viewer_bld_dir, Viewer_SPI_Name)
    if os.path.exists(spi_file_path):
      self.spi_viewer_updater= FileInstall(spi_file_path, self.spi_viewer, self.spi_viewer_backup_dir)
      spi_viewer_succ = self.spi_viewer_updater.upgrade_zip_file()
    else:
      log.info("No need to upgrade " + Viewer_SPI_Name)
    if not spi_viewer_succ:
      return False
      
    adapter_file_path = os.path.join(self.viewer_bld_dir, Viewer_Adapters_Name)
    if os.path.exists(adapter_file_path):
      self.spi_adapters_updater  = FileInstall(adapter_file_path, self.spi_adapters, self.spi_adapters_backup_dir)
      spi_adapter_succ = self.spi_adapters_updater.upgrade_zip_file()
    else:
      log.info("No need to upgrade " + Viewer_Adapters_Name)

    if spi_adapter_succ:
      log.info("Upgrade SPI library for viewer application completed")
    return spi_adapter_succ

  
  def undo_upgrade(self):
    log.info("Start to roll back SPI library for Viewer application")
    if self.spi_viewer_centrolized and self.spi_adapters_centrolized:
      return self.undo()
      
    succ1 = True
    if self.spi_viewer_updater:
      succ1 = self.spi_viewer_updater.undo_upgrade_files()
    
    succ2 = True
    if self.spi_adapters_updater:
      succ2 = self.spi_adapters_updater.undo_upgrade_files()    
    
    log.info("Roll back SPI library for Viewer application completed")
    return (succ1 and succ2)
