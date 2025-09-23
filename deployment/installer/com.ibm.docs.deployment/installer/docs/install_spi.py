# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************


import os, sys
from common import command, CFG, ZipCompat, FileInstall
import logging as log

Concord_SPI_Name = "DocsApp_SPI.zip"
Concord_Adapters_Name = "DocsApp_Adapters.zip"
Concord_SPI_Backup_DIR = "DocsApp_SPI"
Concord_Adapters_Backup_DIR = "DocsApp_Adapters"

class InstallSPI(command.Command):

  def __init__(self):
    self.docs_bld_dir = CFG.get_build_dir()
    self.spi_concord = CFG.get_lib_spi_concord()
    self.spi_adapters = CFG.get_lib_spi_adpaters()
    self.spi_concord_backup_dir = CFG.get_temp_dir() + os.sep + Concord_SPI_Backup_DIR
    self.spi_adapters_backup_dir = CFG.get_temp_dir() + os.sep + Concord_Adapters_Backup_DIR
    self.spi_concord_updater = None
    self.spi_adapters_updater = None


  def readCfg(self, cfg=None):
    return True

  def precheck(self):
    """To check the WAS process is stopped before do"""
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
    for f in os.listdir(self.docs_bld_dir):
      if f.find(zip_name) > -1:
        bdl_zip = self.docs_bld_dir + "/" + f
        break
    if not bdl_zip:
      raise Exception("%sxxx not found from Docs SPI_ZIP %s" %\
        (zip_name, self.docs_bld_dir))

    bdl_zip_file = ZipCompat(bdl_zip)
    bdl_zip_file.extractall(dest)

  def do(self):
    log.info("Install SPI library for HCL Docs Server Started")

    self.remove_bdl(self.spi_concord)
    self.remove_bdl(self.spi_adapters)
    self.install_bdl(self.spi_concord, Concord_SPI_Name)
    self.install_bdl(self.spi_adapters, Concord_Adapters_Name)

    log.info("Install SPI library for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to uninstall SPI library for HCL Docs Server")

    self.remove_bdl(self.spi_concord)
    self.remove_bdl(self.spi_adapters)
    #TODO need to remove the directory??
    #os.rmdir(self.spi_concord)
    #os.rmdir(self.spi_adapters)

    log.info("Uninstall SPI library for HCL Docs Server completed")
    return True

  def do_upgrade(self):
    log.info("Upgrade SPI library for HCL Docs Server Started")

    spi_file_path = os.path.join(self.docs_bld_dir, Concord_SPI_Name)
    if os.path.exists(spi_file_path):
      self.spi_concord_updater = FileInstall(spi_file_path, self.spi_concord, self.spi_concord_backup_dir)
      spi_concord_succ = self.spi_concord_updater.upgrade_zip_file()
    else:
      log.info("No need to upgrade " + Concord_SPI_Name)

    if not spi_concord_succ:
      return False

    adapter_file_path = os.path.join(self.docs_bld_dir, Concord_Adapters_Name)
    if os.path.exists(adapter_file_path):
      self.spi_adapters_updater = FileInstall(adapter_file_path, self.spi_adapters, self.spi_adapters_backup_dir)
      spi_adapter_succ = self.spi_adapters_updater.upgrade_zip_file()
    else:
      log.info("No need to upgrade " + Concord_Adapters_Name)

    if spi_adapter_succ:
      log.info("Upgrade SPI library for HCL Docs Server completed")
    return spi_adapter_succ

  def undo_upgrade(self):
    log.info("Start to roll back SPI library for HCL Docs Server")

    succ1 = True
    if self.spi_concord_updater:
      succ1 = self.spi_concord_updater.undo_upgrade_files()

    succ2 = True
    if self.spi_adapters_updater:
      succ2 = self.spi_adapters_updater.undo_upgrade_files()

    log.info("Roll back SPI library for HCL Docs Server completed")
    return (succ1 and succ2)
