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

import os
import os.path
import shutil, sys


import logging as log
from util import script_template
from common import CFG, config, command, get_upgrade_type
from common.utils.docs_optparse import OPTIONS
from pathlib import Path


UNINSTALL_FOLDER = 'installer'

class CreateUninstaller(command.Command):
  
  def __init__(self):
    if config.INSTALL_MODE is not None and config.INSTALL_MODE == 'node':
      self.node_suffix = '_node'
    else:
      self.node_suffix = ''
    
  
  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True
    
  def do(self):
    log.info("Start to create uninstaller...")
    
    if self.check_done():
      log.info("Create uninstaller completed")
      return True
      
    try:
      if Path(CFG.get_cfg_path()).parent.resolve() != Path(CFG.get_install_root()).resolve():
        shutil.copy(CFG.get_cfg_path(), CFG.get_install_root())
    
      installer_dest = self._copy_installer()

      prod_dir = CFG.getProductFolder()
      
      self._copy_build(prod_dir)

      self._create_install_uninstall_script(installer_dest)
    except Exception as e:
      log.exception(e)    
    
    log.info("Create uninstaller completed")
    return True    

  def undo(self):
    return True
    
  def do_upgrade(self):
    log.info("Start to update uninstaller...")
    
    if self.check_done():
      log.info("Update uninstaller completed")
      return True
          
    try:
      new_version = CFG.get_version_value()
      old_version = CFG.get_current_version_value()
      prod_dir = CFG.getProductFolder()
      upgrade_type = get_upgrade_type(new_version)
    
      #copy installer
      installer_dest = self._copy_installer()
    
      #copy cfg.properties from install root to installer    
      new_cfg_path = os.path.join(installer_dest, os.path.basename(CFG.get_cfg_path()))
      if os.path.exists(new_cfg_path):
        os.remove(new_cfg_path)
      
      shutil.copy(CFG.get_cfg_path(), installer_dest)
    
      # copy build
      build_dest = prod_dir
      if upgrade_type == "build":
        if os.path.exists(prod_dir):
          #back up the old product dir
          #create a product_<old_version> directory
          prod_dir_4_old = os.path.join(CFG.get_install_root(), "product_" + old_version)
          if os.path.exists(prod_dir_4_old):
            shutil.rmtree(prod_dir_4_old, True)
          
          os.makedirs(prod_dir_4_old)
        
          log.info("Backup the old product directory to " + prod_dir_4_old)
          #copy the content from product to the new directory except properties directory
          for f in os.listdir(prod_dir):
            if f == "properties":
              continue
            else:
              f_path = os.path.join(prod_dir, f)
              shutil.move(f_path, prod_dir_4_old)
        
        self._copy_build(prod_dir)              
      else: # ifix
        build_dest = os.path.join(prod_dir, new_version)
      
        if os.path.exists(build_dest):
          shutil.rmtree(build_dest)
        
        self._copy_build(build_dest)
    
      self._create_install_uninstall_script(installer_dest, upgrade_type)
    except Exception as e:
      pass    
    
    log.info("Update uninstaller completed")
    return True
    
  def undo_upgrade(self):
    return True

  def check_done(self):
    """Check if this command has been done already."""
    result = False
    
    src_version_path = os.path.join(CFG.get_build_dir(), UNINSTALL_FOLDER, "version.txt")
    dest_version_path = os.path.join(CFG.get_install_root(), UNINSTALL_FOLDER, "version.txt")
    if os.path.exists(dest_version_path):
      src_version_file = open(src_version_path, "r")
      dest_version_file = open(dest_version_path, "r")
      if src_version_file.read() == dest_version_file.read():
        result = True
      src_version_file.close()
      dest_version_file.close()
    
    return result
    
  def _copy_installer(self):
     
    installer_src = CFG.get_build_dir() + os.sep + UNINSTALL_FOLDER
    installer_dest = CFG.get_install_root() + os.sep + UNINSTALL_FOLDER 
    if os.path.exists(installer_dest):
      try:
        shutil.rmtree(installer_dest, True)
      except Exception as e:
        pass
    
    if not os.path.exists(installer_dest):
      os.makedirs(installer_dest)
    
    for f in os.listdir(installer_src):
      f_path = installer_src + os.sep + f
      f_path_dest = installer_dest + os.sep + f
      if os.path.isfile(f_path):
        shutil.copy2(f_path, f_path_dest)
      else:
        shutil.copytree(f_path, f_path_dest)
    
    return installer_dest  
    
  def _copy_build(self, target):   
    log.info("Copy the build to " + target)
    
    if os.path.exists(target):
      shutil.rmtree(target, True)
    
    if not os.path.exists(target):
      os.makedirs(target)

    build_dir = CFG.get_build_dir()
    for f in os.listdir(build_dir):
      f_path = build_dir + os.sep + f
      if os.path.isfile(f_path):
        shutil.copy(f_path, target)
      else:
        shutil.copytree(f_path, target + os.sep + f)  
 
  def _create_install_uninstall_script(self, installer_dest, install_type="build"):
    log.info("Create install/uninstall script in " + installer_dest)
    
    if install_type == "build":
      #create installer
      cfg_path = os.path.abspath(CFG.get_install_root() + os.sep + os.path.basename(CFG.get_cfg_path()))
      pf_path = os.path.abspath(CFG.getProductFolder())
      #if os.name == "nt":
      self._w32_create_installer(installer_dest, cfg_path, pf_path)
      #else:
      self._lnx_create_installer(installer_dest, cfg_path, pf_path)

    # create uninstaller
    #if os.name == "nt":
    self._w32_create_uninstaller(installer_dest, cfg_path, pf_path)
    #else:
    self._lnx_create_uninstaller(installer_dest, cfg_path, pf_path)    
  
      

  
  def _lnx_create_installer(self, dest, cfgf, pf):
    ins_content = []
    ins_content.append("#!/bin/sh\n")
    ins_content.append("export PYTHONPATH=$PYTHONPATH:$PWD\n")
    ins_content.append("python3 conversion/install%s.py " % self.node_suffix)
    ins_content.append("-configFile ")
    ins_content.append(cfgf)
    ins_content.append(" ")
    ins_content.append("-build ")
    ins_content.append(pf)
    ins_content.append("\n")
    
    f_ins = open (dest + os.sep + "install%s.sh" % self.node_suffix, "w")
    f_ins.write("".join(ins_content))
    f_ins.close()

  def _lnx_create_uninstaller(self, dest, cfgf, pf):
    content = script_template.GUNINSTALL_LNX
    content = content.replace('uninstall.py','uninstall%s.py' % self.node_suffix)
    content = content.replace('${cfgFile}',cfgf)
    content = content.replace('${buildDir}',pf)
  
    f_uni = open (dest + os.sep + "uninstall%s.sh" % self.node_suffix, "w")
    f_uni.write(content)
    f_uni.close()

  def _w32_create_installer(self, dest, cfgf, pf):
    ins_content = []
    ins_content.append("@echo off\n")
    ins_content.append("set PYTHONPATH=%PYTHONPATH%;%CD%\n")
    ins_content.append("python conversion\install%s.py " % self.node_suffix)
    ins_content.append('"-configFile" ')
    ins_content.append('"')
    ins_content.append(cfgf)
    ins_content.append('"')
    ins_content.append(" ")
    ins_content.append('"-build" ')
    ins_content.append('"')
    ins_content.append(pf)
    ins_content.append('"')
    ins_content.append("\n")
    
    f_ins = open (dest + os.sep + "install%s.bat" % self.node_suffix, "w")
    f_ins.write("".join(ins_content))
    f_ins.close()

  def _w32_create_uninstaller(self, dest, cfgf, pf):
    content = script_template.GUNINSTALL_W32
    content = content.replace('uninstall.py','uninstall%s.py' % self.node_suffix)
    content = content.replace('%cfgFile%',cfgf)
    content = content.replace('%buildDir%',pf)
  
    f_uni = open (dest + os.sep + "uninstall%s.bat"  % self.node_suffix, "w")
    f_uni.write(content)
    f_uni.close()
  
