# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# HCL Confidential                                                  
#                                                                   
# HCL Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2022. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 

import socket
import os, stat
import shutil
import tarfile
import logging
import subprocess
import time
import json

from common import command, CFG, ZipCompat, call_wsadmin

Libre_Win = "LibreOffice_7.2.6_Win_x64.msi"
Libre_Linux = "LibreOffice_7.2.6_Linux_x86-64_rpm.tar.gz"

Libre_Linux_name = "LibreOffice_7.2.6.2_Linux_x86-64_rpm"
Libre_office_dir ='lib_bin'

class InstallLibre(command.Command):
  
  def __init__(self):
    self.build = CFG.get_build_dir()
    logging.info("Conversion build folder located: " + self.build)
    
    for f in os.listdir(self.build):
      if os.name == 'nt':
          if f.find(Libre_Win) > -1:
            self.binary_win = self.build + os.sep + f
            logging.info("Libre binary for windows located: " + self.binary_win)
         
      elif f.find(Libre_Linux) > -1:
            logging.info("self.build " + self.build)
            self.binary_lnx = self.build + os.sep + f
            logging.info("Libre binary for linux located: " + self.binary_lnx)

  def precheck(self):
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True

  def unzip_libre(self):
    logging.info("Unzipping LibreOffice")
    command_list = []
    command_list.extend(["tar", "xvf", self.binary_lnx ])
    subprocess.call(command_list)
    logging.info("LibreOffice is unzipped successfully " )  
  
  def install_libre(self):
    logging.info("Installing LibreOffice on linux platform")
    rpm_folder = ""
    parent = self.build
    logging.info("unzipped libre directory " + parent)

    rpm_folder = os.path.abspath(self.build + os.sep + "installer" + os.sep + Libre_Linux_name + os.sep + 'RPMS')
    logging.info("LibreOffice install dir " + rpm_folder)  
    os.system("/bin/yum localinstall -y " + rpm_folder + os.sep + "*.rpm")
    logging.info("LibreOffice is installed successfully on linux platform")


  def install_libre_win(self):
    logging.info("Installing LibreOffice on win platform "+ os.path.abspath(self.binary_win))
    os.system("start /wait msiexec /qn /norestart /i "+ os.path.abspath(self.binary_win))
    logging.info("LibreOffice is installed successfully on win platform") 


  def do(self):
    logging.info("Start to install libre files...")

    if os.name == 'nt':
      if hasattr(self, 'binary_win'):
        self.install_libre_win()
        logging.info("Libre files are installed successfully")
      else:
        logging.info("Could not find Libre binary for windows in : " + os.path.abspath(self.build))
        
    if os.name == 'posix':
      if hasattr(self, 'binary_lnx'):
        self.unzip_libre()
        self.install_libre()
        logging.info("Libre files are installed successfully")
      else:
        logging.info("Could not find Libre binary for linux in : " + os.path.abspath(self.build))
  
    return True

  def undo(self):
    logging.info("Cleaning libre binaries")
    if os.name == 'nt':
      logging.info("Unnstalling LibreOffice on win platform "+ os.path.abspath(self.binary_win))
      os.system("start /wait msiexec /qn /norestart /x "+ os.path.abspath(self.binary_win))
    
    if os.name == 'posix':
      os.system("/bin/yum remove -y /opt/libreoffice*")

    logging.info("Libreoffice is uninstalled successfully")
    return True
  
  def do_upgrade(self):
    logging.info('Start to upgrade libre, uninstall and reinstall it...')
    #TBD
    logging.info('Finish to upgrade libre...')
    return True
  
  def undo_upgrade(self):
    logging.info('Start to undo upgrade libre...')  
    # TBD     
    logging.info('Finish to undo upgrade libre...')
    return True
  
