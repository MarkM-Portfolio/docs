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
from common import command, call_wsadmin, CFG, config_log, FileInstall, configfiles
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from util import operate_config_file
import logging as log
import fileinput
import shutil
import time

LCC_FILE_NAME = "LotusConnections-config.xml"
LCC_CONFIG_CONFIG = "config"
SERV_NAME = "serviceName"
SERV_NAME_DOCS = "docs"
SERV_NAME_COMMUNITIES = "communities"
SERV_REF = "sloc:serviceReference"
SLOC_HREF = "sloc:href"
SLOC_STATIC = "sloc:static"
SLOC_INTER_SERVICE = "sloc:interService"
UPDATE_POST_FIX = ".updated"

class ReviseLotusConnectionsConfig(command.Command):

  def __init__(self):
    if not os.path.exists(CFG.get_temp_dir()):
        os.makedirs(CFG.get_temp_dir())
    self.files_tag_name = "com.ibm.docs.types.files.edit"
    self.ccm_tag_name = "com.ibm.docs.types.ccm.edit"
    self.remote_lcc_filepath = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), LCC_FILE_NAME)
    self.local_lcc_filepath = CFG.get_temp_dir() + os.sep + LCC_FILE_NAME    
    
  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True  
    
  def to_pretty_xml(self, node):
    return node.toprettyxml("", "", "UTF-8")    
    
  def reviseLCC(self, doc, register):    
    communities_settting = {'href': '', 'ssl_href':'', 'ssl_enabled': 'false', 'bootstrapHost': '', 'bootstrapPort': '', 'interService':''}
    docs_ref = None	
    root = doc.documentElement
    lcc_configs = root.getElementsByTagName(LCC_CONFIG_CONFIG)
    if root.getAttribute('id') == 'LotusConnections':
      lcc_config_version = root.getAttribute('buildlevel')
      print("LCC.xml buildlevel is %s" % lcc_config_version)
    serviceReferences = root.getElementsByTagName(SERV_REF)
    for ref in serviceReferences:
      serviceName = ref.getAttribute(SERV_NAME)
      if serviceName == SERV_NAME_COMMUNITIES:
        communities_settting['ssl_enabled'] = ref.getAttribute('ssl_enabled')
        communities_settting['bootstrapHost'] = ref.getAttribute('bootstrapHost')
        communities_settting['bootstrapPort'] = ref.getAttribute('bootstrapPort')
          
        staicEle = ref.getElementsByTagName(SLOC_HREF)[0].getElementsByTagName(SLOC_STATIC)[0]
        communities_settting['href'] = staicEle.getAttribute('href')
        communities_settting['ssl_href'] = staicEle.getAttribute('ssl_href')
          
        #interServiceEle = ref.getElementsByTagName(SLOC_HREF)[0].getElementsByTagName(SLOC_INTER_SERVICE)[0]
        #communities_settting['interService'] = interServiceEle.getAttribute('href')      	
      elif serviceName == SERV_NAME_DOCS:
      	docs_ref = ref      	
      else:
        continue
        
    if docs_ref:    	      
      if register == True:  # register Docs in LCC.xml for CCM
        docs_ref.setAttribute('enabled', 'true')
        docs_ref.setAttribute('ssl_enabled', communities_settting['ssl_enabled'])
                        
        docs_ref.setAttribute('bootstrapHost', communities_settting['bootstrapHost'])
        docs_ref.setAttribute('bootstrapPort', communities_settting['bootstrapPort'])
        
        staicEle = docs_ref.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:static')[0]
        if staicEle is not None:
          log.info('Updating the href and ssl_href attributes in LLC.XML')
          staicEle.setAttribute('href', communities_settting['href'])
          staicEle.setAttribute('ssl_href', communities_settting['ssl_href'])
          
      else:  # unregister Docs in LCC.xml for CCM        
        docs_ref.setAttribute('enabled', 'false')
        docs_ref.setAttribute('ssl_enabled', 'false')		               	
   	     
    return doc

  def set_install_tag(self, doc, register):
    
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

    return doc


  def registerDocs(self, register): 	
    # extract LotusConnections-config.xml to local
    if not operate_config_file.exist(self.remote_lcc_filepath):
      log.info("Can not find LCC.xml")
      return True
    operate_config_file.extract(self.remote_lcc_filepath, self.local_lcc_filepath)
    # backup it
    timestamp = str( int(time.time()) )
    local_backup_file = self.local_lcc_filepath + "." + timestamp
    remote_backup_file = self.remote_lcc_filepath + "." + timestamp
    shutil.copyfile(self.local_lcc_filepath, local_backup_file)
    # modify the xml file(self.local_lcc_filepath)

    doc = parse(self.local_lcc_filepath)

    # if CFG.get_ccm_enabled():
    #   doc = self.reviseLCC(doc, register)
    self.set_install_tag(doc, register)


    file_object = open(self.local_lcc_filepath + UPDATE_POST_FIX, 'w')
    content = '\n'.join([line for line in doc.toprettyxml(indent=' '*2).split('\n') if line.strip()])
    file_object.write(content)
    file_object.close()

    # create a backup               
    operate_config_file.create(remote_backup_file, local_backup_file)
    # check LotusConnections-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_lcc_filepath, self.local_lcc_filepath + UPDATE_POST_FIX)              
          	
    return True 	  

  def do(self):
    log.info("Register Docs application in LCC.xml")
    self.registerDocs(True)
    log.info("Register Docs application in LCC.xml completed")    
    return True    
    
  def undo(self):
    log.info("Start to unregister Docs application in LCC.xml") 
    self.registerDocs(False)
    return True    

  def do_upgrade(self):
    log.info("Start to upgrade register Docs application in LCC.xml")
    self.registerDocs(True)
    log.info("Finished to upgrade register Docs application in LCC.xml")
    return True    
    
  def undo_upgrade(self):
    log.info("Start to unregister Docs application in LCC.xml") 
    self.registerDocs(False)
    return True      