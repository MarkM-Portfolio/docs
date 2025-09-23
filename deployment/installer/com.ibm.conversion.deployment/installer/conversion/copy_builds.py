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

"""
  This will copy the build to product folder under install root
"""
import os, sys, stat
import shutil
import subprocess
import logging
from common import CFG, command


class CopyBuilds(command.Command):
  
  def __init__(self):
    self.config = config.Config()
    self.product_dir = self.config.getProductFolder()
    self.build_dir = self.config.get_build_dir()
    
  def precheck(self):
    return True

  def postcheck(self):
    return True

  def readCfg(self, cfg=None):
    return True

  def clean(self):
    logging.info("Cleaning product binaries  from " + self.product_dir)
    if os.path.exists(self.product_dir):
      for f in os.listdir(self.product_dir):
        f_path = self.product_dir + "/" + f
        if os.path.isfile(f_path):
          os.remove(f_path)
        else:
          shutil.rmtree(f_path)
    
  def copy(self):
    if not os.path.exists(self.build_dir):
      raise Exception("Build directory not found in " + self.build_dir)
    
    if not os.path.exists(self.product_dir):
      os.makedirs(self.product_dir)

    logging.info("Copying product binaries to " + self.product_dir)
    for f in os.listdir(self.build_dir):
      f_path = self.build_dir + "/" + f
      if os.path.isfile(f_path):
        shutil.copy(f_path, self.product_dir)
      else:
        shutil.copytree(f_path, self.product_dir + "/" + f)

    # copy config property to install root
    
  def do(self):
    self.clean()
    self.copy()
    return True

  def undo(self):
    self.clean()
    return True

