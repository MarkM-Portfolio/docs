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


import os, sys, stat
import shutil
import subprocess
import logging

from common import command, CFG

PROFILE_PATH = "/etc/profile.d/ibm_conversion.sh"

class SetEnv(command.Command):
  
  def __init__(self):
    #self.config = config.Config()
    pass
    
  def precheck(self):
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True

  def windows_do(self):
    """NOT IMPLEMENTED YET"""
    logging.error("Windows environment variable is not implemented yet, you have to set it manully!")

  def windows_undo(self):
    """NOT IMPLEMENTED YET"""
    logging.error("Windows environment variable is not implemented yet, you have to unset it manully!")

  def write_env_profile(self):
    logging.info("Setting environment variable for conversion OSGi")
    cfg_content = []
    cfg_content.append("#!/bin/sh\n")
    cfg_content.append("export ConversionFS=" + CFG.getConfigFolder())
    f_pro = open(PROFILE_PATH, "w")
    f_pro.write("".join(cfg_content))
    f_pro.close()
    os.chmod(PROFILE_PATH,stat.S_IRWXU|stat.S_IRWXG|stat.S_IROTH|stat.S_IXOTH)

  def clean_env_profile(self):
    logging.info("Cleaning environment variable for conversion OSGi")
    if os.path.exists(PROFILE_PATH):
      os.remove(PROFILE_PATH)

  def linux_do(self):
    self.write_env_profile()
 
  def linux_undo(self):
    self.clean_env_profile()

  def do(self):
    if os.name == "nt":
        self.windows_do()
    else:
      self.linux_do()

    return True

  def undo(self):
    if os.name == "nt":
        self.windows_undo()
    else:
      self.linux_undo()

    return True

