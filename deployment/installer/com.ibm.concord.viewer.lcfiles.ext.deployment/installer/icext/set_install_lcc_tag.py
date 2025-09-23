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

import os
from icext.config import CONFIG as CFG
from commands import command
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from util import operate_config_file
import logging as log
import fileinput
import shutil
import time

class SetTag(command.Command):

  def __init__(self):
    self.llc_file_name = "LotusConnections-config.xml"
    self.files_tag_name = "com.ibm.docs.types.files.view"
    self.ccm_tag_name = "com.ibm.docs.types.ccm.view"
    self.UPDATE_POST_FIX = ".updated"

    if not os.path.exists(CFG.temp_dir):
        os.makedirs(CFG.temp_dir)
    self.remote_lcc_filepath = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), self.llc_file_name)
    self.local_lcc_filepath = CFG.temp_dir + os.sep + self.llc_file_name
    
  def readCfg(self, cfg=None):
    return True  

  def set_install_tag(self, register):
    doc = parse(self.local_lcc_filepath)
    root = doc.documentElement

    files_element = doc.createElement("genericProperty")
    files_element.setAttribute("name", self.files_tag_name)

    ccm_element = doc.createElement("genericProperty")
    ccm_element.setAttribute("name", self.ccm_tag_name)

    if register:      
      files_element.appendChild(doc.createTextNode("true"))
      # if CFG.get_ccm_enabled():
      #   ccm_element.appendChild(doc.createTextNode("true"))
      # else:
      ccm_element.appendChild(doc.createTextNode("false"))
    else:
      files_element.appendChild(doc.createTextNode("false"))
      ccm_element.appendChild(doc.createTextNode("false"))

    prop_tag = root.getElementsByTagName("properties")

    if prop_tag.length == 0:    
      prop_tag = [doc.createElement("properties")]
      root.appendChild(prop_tag[0])

    props = prop_tag[0].getElementsByTagName("genericProperty")
    for prop in props:
      if prop.getAttribute('name') == self.files_tag_name or \
         prop.getAttribute('name') == self.ccm_tag_name:
        prop_tag[0].removeChild(prop)
    
    prop_tag[0].appendChild(files_element)      
    prop_tag[0].appendChild(ccm_element)

    file_object =open(self.local_lcc_filepath + self.UPDATE_POST_FIX, 'w')
    content = '\n'.join([line for line in doc.toprettyxml(indent=' '*2).split('\n') if line.strip()])
    file_object.write(content)
    file_object.close()


  def set_tag(self, register): 	

    if not operate_config_file.exist(self.remote_lcc_filepath):
      log.info("Can not find LCC.xml")
      return True

    operate_config_file.extract(self.remote_lcc_filepath, self.local_lcc_filepath)
    timestamp = str( int(time.time()) )
    local_backup_file = self.local_lcc_filepath + "." + timestamp
    remote_backup_file = self.remote_lcc_filepath + "." + timestamp
    shutil.copyfile(self.local_lcc_filepath, local_backup_file)

    self.set_install_tag(register)

    operate_config_file.create(remote_backup_file, local_backup_file)
    operate_config_file.checkin(self.remote_lcc_filepath, self.local_lcc_filepath + self.UPDATE_POST_FIX)              
          	
    return True 	  

  def do(self):
    log.info("Set viewer install tag in LCC.xml")
    self.set_tag(True)
    log.info("Set viewer install tag in LCC.xml completed")    
    return True    
    
  def undo(self):
    log.info("Start to unset viewer install tag in LCC.xml") 
    self.set_tag(False)
    return True    

  def do_upgrade(self):
    log.info("Set viewer install tag in LCC.xml")
    self.set_tag(True)
    log.info("Set viewer install tag in LCC.xml completed")    
    return True    
    
  def undo_upgrade(self):
    return True      