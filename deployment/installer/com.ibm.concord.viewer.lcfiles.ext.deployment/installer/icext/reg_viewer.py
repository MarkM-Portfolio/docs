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
from icext.config import CONFIG as CFG
import logging as log
from xml.dom.minidom import parse
from xml.dom.minidom import Document
from commands import command
from util.common import call_wsadmin
import os

class RegisterViewer(command.Command):
  """This command will install Viewer Ext.ear and start it"""

  def __init__(self):
    if not os.path.exists(CFG.temp_dir):
        os.makedirs(CFG.temp_dir)
    self.back_file = CFG.temp_dir + "/" + CFG.lc_config[1]
    
    self.install_mode = False

  def __do(self):  
    self.__delete_old_config(self.back_file, CFG.lc_config)
    if self.__do_register(self.back_file, 'true'):
      self.__install_config(self.back_file + ".updated", CFG.lc_config)
    else:
      self.__install_config(self.back_file, CFG.lc_config)
      log.info("Failed to register Viewer in Connections")
    
  def do(self):
    log.info("Start to register Viewer in Connections")
    
    self.__do()
    
    log.info("Viewer registration completed")
    self.install_mode = True
    return True

  def undo(self):
    log.info("Start to unregister Viewer in Connections")
    if self.install_mode and os.path.exists(self.back_file):
      self.__install_config(self.back_file, CFG.lc_config)
    else:
      self.__delete_old_config(self.back_file, CFG.lc_config)
      if self.__do_register(self.back_file, 'false'):
      	self.__install_config(self.back_file + ".updated", CFG.lc_config)
      else:
        self.__install_config(self.back_file, CFG.lc_config)
        log.info("Failed to unregister Viewer in Connections")
    
    log.info("Unregistered Viewer in Connections")
    return True
    
  def do_upgrade(self):
    log.info("Start to upgrade Viewer setting in Connections")
    
    self.__do()
    
    log.info("Viewer setting upgraded in Connections")
    return True
    
  def undo_upgrade(self):
    log.info("Rolling back Viewer setting in Connections")

    self.__install_config(self.back_file, CFG.lc_config)
    
    log.info("Successfully rollback Viewer setting in Connections")
    return succ
    
  def __install_config(self, src, pathElem):
    """install the configuration as websphere document"""
    
    cmd_args = CFG.get_was_cmd_line()
    cmd_args.extend(["-f",  "./icext/tasks/create_config_json.py", src])
    cmd_args.extend(pathElem)
    succ, ws_out = call_wsadmin(cmd_args)
    os.remove(src)
    if not succ:
      raise Exception('Failed to create configuration file.')
    

  def __delete_old_config(self, config_bak, pathElem):
    """remove and backup the old configuration"""
    
    cmd_args = CFG.get_was_cmd_line()
    cmd_args.extend(["-f",  "./icext/tasks/delete_config_json.py", config_bak])
    cmd_args.extend(pathElem)
    #delete the config json
    succ, ws_out = call_wsadmin(cmd_args)
    if not succ:
      raise Exception("Failed to delete config json file")
      
    if ws_out.find('DelJsonConfig Successfully.') < 0:
      raise Exception("Failed to delete config json file")

  def __do_register(self, f, enabled):
    updated = False
    try:
      communities_settting = {'href': '', 'ssl_href':'', 'ssl_enabled': 'false', 'bootstrapHost': '', 'bootstrapPort': '', 'interService':''}
      viewer_ref = None
      doc = parse(f)
      root = doc.documentElement
      srvRefs = root.getElementsByTagName('sloc:serviceReference')
      for ref in srvRefs:
        if ref.getAttribute('serviceName') == 'viewer':
          viewer_ref = ref
        elif ref.getAttribute('serviceName') == 'communities' and enabled == 'true':
          communities_settting['ssl_enabled'] = ref.getAttribute('ssl_enabled')
          communities_settting['bootstrapHost'] = ref.getAttribute('bootstrapHost')
          communities_settting['bootstrapPort'] = ref.getAttribute('bootstrapPort')
          
          staicEle = ref.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:static')[0]
          communities_settting['href'] = staicEle.getAttribute('href')
          communities_settting['ssl_href'] = staicEle.getAttribute('ssl_href')
          
          #interServiceEle = ref.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:interService')[0]
          #communities_settting['interService'] = interServiceEle.getAttribute('href')
      
      if viewer_ref:
        log.info('Updating the enabled attribute in LLC.XML')
        viewer_ref.setAttribute('enabled', enabled)
        
        viewer_ref.setAttribute('ssl_enabled', communities_settting['ssl_enabled'])
        viewer_ref.setAttribute('bootstrapHost', communities_settting['bootstrapHost'])
        viewer_ref.setAttribute('bootstrapPort', communities_settting['bootstrapPort'])
        
        staicEle = viewer_ref.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:static')[0]
        if staicEle is not None:
          log.info('Updating the href and ssl_href attributes in LLC.XML')
          staicEle.setAttribute('href', communities_settting['href'])
          staicEle.setAttribute('ssl_href', communities_settting['ssl_href'])
          
        #interServiceEle = viewer_ref.getElementsByTagName('sloc:href')[0].getElementsByTagName('sloc:interService')[0]
        #if interServiceEle is not None:
        #  log.info('Updating the interService attributes in LLC.XML')
        #  interServiceEle.setAttribute('href', communities_settting['href'])
            
        updated = True
      
      if updated:
        file_object =open(f + '.updated', 'w')
        file_object.write(doc.toprettyxml("", "", 'UTF-8').decode("utf-8"))
        file_object.close()
        
      return updated
    except Exception as e:
      print(e)
      return False
    
