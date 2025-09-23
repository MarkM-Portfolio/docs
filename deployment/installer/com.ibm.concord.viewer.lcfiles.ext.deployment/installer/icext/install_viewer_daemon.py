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

import codecs, os, re, sys, time, fileinput, shutil, string
from commands import command
from util.common import call_wsadmin
from xml.dom.minidom import parse
from xml.dom.minidom import Document
from icext.config import CONFIG as CFG
from icext import config
from io import StringIO
import logging as log
from util.upgrade_change_log import viewer_daemon_config_log
from util.common import FileInstall
from util.common import parse_ws_map


try:
  import json
except ImportError: 
  import simplejson as json

SERVER_URL_PATTERN = r"\s*\"server_url\"\s*:\s*\"(http?://.+/viewer)\" *,?"
IGNORE_EVENT_PATTERN = r"\s*\"ignore_event\"\s*:\s*\"(true)\""

DAEMON_CONFIG_FILENAME = "viewer-daemon-config.json"
CONFIG_JSON_SRC_NAME = "viewer-daemon-config.json"
DAEMON_JAR_FILENAME = "com.ibm.concord.viewer.lcfiles.daemon.jar"
DAEMON_SHAREDLIB_NAME = 'ViewerDaemonLib'
NEWS_APPLICATION_NAME = "News"
NEWS_EVENTS_CONFIG_NAME = "events-config.xml"
EVENT_HANDLER_NAME = "ViewerUploadHandler"
EVENT_HANDLER_CLASS = "com.ibm.concord.viewer.lcfiles.daemon.ViewerUploadHandler"
DAEMON_BACKUP_FOLDER = "daemon"
SOURCE_FILES = "FILES"
SOURCE_ECM = "EXTERNAL"

JSON_LIST_ENTRY_IDENTFER = {}
PATH_HOLDER = []

#
#<postHandler class="com.ibm.concord.viewer.lcfiles.daemon.ViewerUploadHandler" enabled="true" invoke="ASYNC" name="ViewerUploadHandler">
#  <subscriptions>
#    <subscription eventName="files.file.created" source="FILES" type="CREATE"/>
#    <subscription eventName="files.file.updated" source="FILES" type="UPDATE"/>
#    <subscription eventName="files.command.createthumbnail" source="FILES" type="COMMAND"/>
#    <subscription eventName="files.file.deleted" source="FILES" type="DELETE"/>
#    <subscription eventName="files.file.undeleted" source="FILES" type="RESTORE"/>
#    <subscription eventName="ecm_files.approve.file.ecm.review.document.approved" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.post.file.ecm.file.checkin" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.delete.file.ecm.file.deleted" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.delete.file.ecm.version.deleted" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.update.file.ecm.file.checkout" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.add.file.ecm.file.added.to.teamspace" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.post.file.ecm.draft.updated" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.update.file.ecm.file.restore" source="EXTERNAL" type="*"/>
#    <subscription eventName="ecm_files.generate.file.ccm.tool" source="EXTERNAL" type="*"/>
#  </subscriptions>
#</postHandler>

class InstallViewerDaemon(command.Command):
  """This command will install event handler for hooking Lotus Connections events"""
  
  __files_event_names = ['files.file.created', 'files.file.updated', 'files.command.createthumbnail', 'files.file.deleted', 'files.file.undeleted']
  __ecm_event_names = ['ecm_files.generate.file.ccm.tool', 'ecm_files.post.file.ecm.file.checkin', 'ecm_files.update.file.ecm.file.checkout', 'ecm_files.delete.file.ecm.file.deleted', 'ecm_files.delete.file.ecm.version.deleted', 'ecm_files.add.file.ecm.file.added.to.teamspace', '"ecm_files.post.file.ecm.draft.updated', 'ecm_files.update.file.ecm.file.restore', 'ecm_files.approve.file.ecm.review.document.approved' ]
  __registered_events = []
  
  def __init__(self):
    self.extFS = CFG.get_config_dir()
    self.ext_bld_dir = CFG.get_build_dir()
    self.ignore_event = CFG.get_ignore_event()
    self.viewer_server_url = CFG.get_viewer_server_url()
    self.daemon_dir = CFG.get_daemon_location()
    self.daemon_lib_dir = os.path.join(self.daemon_dir, 'library')
    self.daemon_lib_filepath = os.path.join(self.daemon_lib_dir, DAEMON_JAR_FILENAME)
    self.backup_dir = CFG.get_temp_dir() + os.sep+ DAEMON_BACKUP_FOLDER
    self.config_json_full_name= self.ext_bld_dir + os.sep + "config" + os.sep + DAEMON_CONFIG_FILENAME
    self.updater = None
    try:
      self.old_daemon_lib_filepath = os.path.join(os.path.join(CFG.get_old_daemon_location(), 'library'), DAEMON_JAR_FILENAME)
    except Exception:
      self.old_daemon_lib_filepath = None
    
    # Get the cell name
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/get_cell_name.py"])
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("cellname: ") < 0:
      raise Exception("Didn't get the cell name")
    
    log.info("Get cell name task output is: %s" % ws_out)
    cell_name = ws_out[(ws_out.find('cellname: ') + 10) : len(ws_out)]
    if cell_name.find('\n') >= 0:
      cell_name = cell_name[0 : cell_name.find('\n')]
    log.info("Cell name is: %s" % cell_name)
    self.cell_name = cell_name
    
    self.src_config_filepath = os.path.join(self.ext_bld_dir, 'config', DAEMON_CONFIG_FILENAME)

    self.daemon_path = ["IBMDocs-config", DAEMON_CONFIG_FILENAME]
    self.events_path = ['LotusConnections-config', NEWS_EVENTS_CONFIG_NAME]
    self.newscon_back_up = CFG.temp_dir + "/" + NEWS_EVENTS_CONFIG_NAME + ".bak"
    self.news_config = CFG.temp_dir + "/" + NEWS_EVENTS_CONFIG_NAME
    
    self.daemoncon_back_up = CFG.temp_dir + "/" + DAEMON_CONFIG_FILENAME + ".bak"
    
  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True
    
  def __get_daemon_shared_lib(self):
    succ, ws_out = self.call_task("get_shared_library.py", ["", DAEMON_SHAREDLIB_NAME])
    
    if not succ:
      log.info("Failed to read shared library information")
      return False
    attrs = None
    for line in ws_out.split('\n'):
      if line.find('share library attributes: ') > -1:
        attrs = eval(line.strip(' \r\n\t').replace('share library attributes: ',''))
        break
      elif line.find('No share library found') > -1:
        break
        
    if attrs:
      curr_settings = parse_ws_map(attrs)
      return curr_settings['classPath']
    else:
      return None

  def do(self):
    log.info("Install event handler for hooking Lotus Connections events Started")
    
    # Prepare: Create the path
    if not os.path.isdir(self.daemon_dir):
      os.mkdir(self.daemon_dir)
    if not os.path.isdir(self.daemon_lib_dir):
      os.mkdir(self.daemon_lib_dir)
    
    # 1. Copy the event handler jar file to LC data folder, such as: /opt/IBM/LotusConnections/Data/docs.daemon
    self.install_handler_jar()
    
    # 2. Create shared library and set the shared library reference for News application
    self.create_shared_lib(None)
    
    # 3. Generate the event handler configuration file and put the file into folder: .../{Dmgr}/config/cells/{cell}/LotusConnections-config
    self.install_handler_config()
    
    # 4. Change the events-config.xml file
    self.register_event_handler()
    
    log.info("Install event handler for hooking Lotus Connections events completed")
    return True

  def undo(self):
    log.info("Start to uninstall event handler for hooking Lotus Connections events")
    
    # 1. Undo the change on events-config.xml file
    self.unregister_event_handler()
    
    # 2. Remove the event handler configuration file
    self.uninstall_handler_config()
    
    # 3. Delete shared library and remove the shared library reference for News application
    self.delete_shared_lib()
    
    # 4. Uninstall the event handler jar file
    self.uninstall_handler_jar()
    
    log.info("Uninstall event handler for hooking Lotus Connections events finished")
    return True
  
  def to_pretty_xml(self, node, encoding='UTF-8'):
    return node.toprettyxml("", "", encoding)
  
  def install_handler_jar(self):
    log.info("Start to install the event handler jar")
    
    jar_src_filepath = os.path.join(self.ext_bld_dir, DAEMON_JAR_FILENAME)
    if not os.path.isfile(jar_src_filepath):
      raise Exception("Didn't find the event handler jar file %s" % jar_src_filepath)
    
    log.info("The source event handler jar file locate in %s" % jar_src_filepath)
    
    shutil.copy(jar_src_filepath, self.daemon_lib_filepath)
    
    log.info("The event handler jar file has been copied to %s" % self.daemon_lib_filepath)

  def create_shared_lib(self, lib_path):
    log.info("Start to create SharedLib for event handler")
    
    if lib_path:
      daemon_lib_filepath_for_shared_lib = lib_path
    else:
      daemon_lib_filepath_for_shared_lib = self.daemon_lib_filepath.replace("\\", "/")
      if not CFG.get_is_dmgr_on_host():
        # get the deamon lib file path on the NFS server
        icext_jar_dir = CFG.get_icext_jar_location()
        common_part = icext_jar_dir.replace("\\", "/").replace("/provision/webresources", "")
        daemon_rel_filepath = self.daemon_lib_filepath.replace("\\", "/").replace(common_part, "")
        conections_provision_path = config.IC_PROVISION_PATH
        conections_shared_root = conections_provision_path.replace("\\", "/").replace("/provision", "")
        daemon_lib_filepath_for_shared_lib = conections_shared_root + daemon_rel_filepath
    
    # match the multiple space
    p = re.compile("[ \t\n\r\f\v]+")
    results = p.findall(daemon_lib_filepath_for_shared_lib)
    if len(results) != 0:
      print("there are spaces in " + daemon_lib_filepath_for_shared_lib)
      daemon_lib_filepath_for_shared_lib = "\"" + daemon_lib_filepath_for_shared_lib + "\""
    
    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/create_shared_lib.py"])
    args.extend([DAEMON_SHAREDLIB_NAME])
    args.extend([daemon_lib_filepath_for_shared_lib])
    args.extend([NEWS_APPLICATION_NAME])

    app = 'News'
    servers, clusters = CFG.prepare_app_scope(app.lower())
    if servers:
      serverID = "/Node:%s/Server:%s/"%(servers[0]["nodename"],servers[0]["servername"])
      args.extend([serverID])
                	
    if clusters:
      clusterID = "/ServerCluster:%s/"%(clusters[0])
      args.extend([clusterID])  
    
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("successfully") < 0:
      raise Exception("Create shared library failed")
    
    log.info("Create SharedLib for event handler completed")
    return True

  def install_handler_config(self):
    log.info("Start to install configuration file for event handler")
    
    if not os.path.isfile(self.src_config_filepath):
      raise Exception("Didn't find the event handler configuration file %s" % self.src_config_filepath)
    
    temp_file = CFG.temp_dir + "/viewer-daemon-config.json"
    if not os.path.exists(CFG.temp_dir):
        os.makedirs(CFG.temp_dir)
    shutil.copy(self.src_config_filepath, temp_file)
    
    self.generate_config_json(self.src_config_filepath, temp_file)
    self.__install_config(temp_file, self.daemon_path)
    
    log.info("The event handler configuration file has been installed")
  
  def register_event_handler(self):
    log.info("Start to register daemon event handler into events-config.xml")
    
    # Backup the events-config.xml
    self.__delete_old_config(self.newscon_back_up, self.events_path)
    shutil.copy(self.newscon_back_up, self.news_config)
    
    # Create the minidom document
    doc = parse(self.news_config)
    root = doc.documentElement
    postHanlersElem = root.getElementsByTagName("postHandlers")[0]
    postHandlers = postHanlersElem.getElementsByTagName("postHandler")
    
    # Remove the old event handler
    for existHandler in postHandlers:
     if existHandler.getAttribute('name') == EVENT_HANDLER_NAME:
       postHanlersElem.removeChild(existHandler)
    
    # Create the <postHandler> base element
    postHandler = doc.createElement("postHandler")
    postHandler.setAttribute("class", EVENT_HANDLER_CLASS)
    postHandler.setAttribute("enabled", "true")
    postHandler.setAttribute("invoke", "ASYNC")
    postHandler.setAttribute("name", EVENT_HANDLER_NAME)
    
    # Create the <subscriptions> element
    subscriptions = doc.createElement("subscriptions")    
  
    """# Create <subscription> element for ALL
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName","*")  
    subscription.setAttribute("source", "*")  
    subscription.setAttribute("type", "*")  
    subscriptions.appendChild(subscription)"""
    
    for event in self.__files_event_names:
      subscriptions.appendChild(self.__create_subscription(doc, SOURCE_FILES, event))
    # if CFG.get_ccm_enabled():
    #   for event in self.__ecm_event_names:
    #     subscriptions.appendChild(self.__create_subscription(doc, SOURCE_ECM, event))
  
    postHandler.appendChild(subscriptions)
    postHanlersElem.appendChild(postHandler)
    
    # write minidom to XML
    #file_object =open(self.news_event_config_filepath, 'w')
    file_object =open(self.news_config, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    
    self.__save_config(self.news_config, self.events_path)
    
    log.info("Register daemon event handler into events-config.xml completed")
  
  def __create_subscription(self, doc, source, eventName):
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName", eventName)  
    subscription.setAttribute("source", source)
    
    if eventName == 'files.file.created':
      subscription.setAttribute("type", "CREATE")
    elif eventName == 'files.file.updated':
      subscription.setAttribute("type", "UPDATE")
    elif eventName == 'files.command.createthumbnail':
      subscription.setAttribute("type", "COMMAND")
    elif eventName == 'files.file.deleted':
      subscription.setAttribute("type", "DELETE")
    elif eventName == 'files.file.undeleted':
      subscription.setAttribute("type", "RESTORE")
    else:
      subscription.setAttribute("type", "*")
    return subscription
      
  def __create_post_handler(self, doc):
    # Create the <postHandler> base element
    postHandler = doc.createElement("postHandler")
    postHandler.setAttribute("class", EVENT_HANDLER_CLASS)
    postHandler.setAttribute("enabled", "true")
    postHandler.setAttribute("invoke", "ASYNC")
    postHandler.setAttribute("name", EVENT_HANDLER_NAME)
    
    return postHandler
  
  def uninstall_handler_jar(self):
    log.info("Start to uninstall the event handler jar")
    
    if os.path.isfile(self.daemon_lib_filepath):
      os.remove(self.daemon_lib_filepath)
    
    log.info("The event handler jar file %s has been deleted" % self.daemon_lib_filepath)

  def delete_shared_lib(self):
    log.info("Start to delete SharedLib for event handler")
    
    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/undo_create_shared_lib.py"])
    args.extend([DAEMON_SHAREDLIB_NAME])
    args.extend([NEWS_APPLICATION_NAME])
    
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("successfully") < 0:
      raise Exception("Delete shared library failed")
    
    log.info("Delete SharedLib for event handler completed")
    return True

  def uninstall_handler_config(self):
    log.info("Start to uninstall configuration file for event handler")
    
    self.__delete_old_config("remove", self.daemon_path)
    
    log.info("The event handler configuration file %s has been removed")
    
  def upgrade_event_handler(self):
    log.info("Start to upgrade daemon event handler from events-config.xml")
    
    self.__delete_old_config(self.newscon_back_up, self.events_path)
    shutil.copy(self.newscon_back_up, self.news_config)
    
    doc = parse(self.news_config)
    root = doc.documentElement
    postHanlersElem = root.getElementsByTagName("postHandlers")[0]
    postHandlers = postHanlersElem.getElementsByTagName("postHandler")
    for existHandler in postHandlers:
     if existHandler.getAttribute('name') == EVENT_HANDLER_NAME:
      subscriptions = existHandler.getElementsByTagName("subscriptions")[0]
      sub = subscriptions.getElementsByTagName('subscription')
      for i in sub:
        eventName = i.getAttribute('eventName')
        self.__registered_events.append(eventName)
        
      for event in self.__files_event_names:
        if not event in self.__registered_events:
          subscriptions.appendChild(self.__create_subscription(doc, SOURCE_FILES, event))
      # if CFG.get_ccm_enabled():
      #   for event in self.__ecm_event_names:
      #     if not event in self.__registered_events:
      #       subscriptions.appendChild(self.__create_subscription(doc, SOURCE_ECM, event))
          
    file_object =open(self.news_config, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    
    self.__install_config(self.news_config, self.events_path)
    log.info("Upgrade daemon event handler into events-config.xml completed")
    
  def undo_upgrade_event_handler(self):
    log.info("Start to rollback event handler upgrade")

    self.__install_config(self.newscon_back_up, self.events_path)
    
    log.info("Successfully rollback event handler upgrade")

  def unregister_event_handler(self):
    log.info("Start to unregister daemon event handler from events-config.xml")

    # extract events-config.xml to local
    self.__delete_old_config(self.newscon_back_up, self.events_path)
    
    # Backup the events-config.xml
    shutil.copy(self.newscon_back_up, self.news_config)
    
    # Create the minidom document
    doc = parse(self.news_config)
    root = doc.documentElement
    postHanlersElem = root.getElementsByTagName("postHandlers")[0]
    postHandlers = postHanlersElem.getElementsByTagName("postHandler")
    
    # Remove the old event handler
    for existHandler in postHandlers:
      if existHandler.getAttribute('name') == EVENT_HANDLER_NAME:
        postHanlersElem.removeChild(existHandler)
    
    # write minidom to XML
    file_object =open(self.news_config, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    
    # check events-config.xml into the configuration repository
    self.__save_config(self.news_config, self.events_path)
    
    log.info("Unregister daemon event handler from events-config.xml completed")
  
  def generate_config_json (self, src, dest):
    config_json_template_file = open(src)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)    

    cfg_dict = dict(CFG.get_raw_key_value())
    value_map = {"yes": "false", "no": "true"}
    if 'enable_upload_conversion' in cfg_dict :
      cfg_dict["ignore_event"] = value_map[cfg_dict['enable_upload_conversion'].lower()]
      del cfg_dict['enable_upload_conversion']

    config_json_subst_string = config_json_template.substitute(cfg_dict)  

    config_json_subst_file = open(dest, "w+")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()
  
  def merge_json (self, from_json, to_json):
    for from_item in from_json:
      PATH_HOLDER.append(from_item)
      if not from_item in to_json:
      
        viewer_daemon_config_log.log_new_config('/'.join(PATH_HOLDER), 
          json.dumps(from_json[from_item]), 
          self.target_config_filepath,log)
        to_json[from_item] = from_json[from_item]
      else:
        from_item_type = type(from_json[from_item]) 
        # dict type
        if from_item_type is dict:
          self.merge_json (from_json[from_item], to_json[from_item])
        # list type
        elif from_item_type is list:
          if from_item in JSON_LIST_ENTRY_IDENTFER:          
            entry_identifer = JSON_LIST_ENTRY_IDENTFER[from_item]
            new_list_entries = []
            for from_list_item in from_json[from_item]:
              found = False
              for to_list_item in to_json[from_item]:
                if from_list_item[entry_identifer] == to_list_item[entry_identifer]:
                  found = True
                  self.merge_json (from_list_item, to_list_item)
                  break
              if not found:
                viewer_daemon_config_log.log_new_config('/'.join(PATH_HOLDER), 
                  json.dumps(from_list_item), 
                  self.target_config_filepath,log)
                new_list_entries.append(from_list_item)
            to_json[from_item].extend(new_list_entries)
        # key-value pair
        else:
          if from_json[from_item] != to_json[from_item]:

            viewer_daemon_config_log.log_existed_config('/'.join(PATH_HOLDER), 
              json.dumps(to_json[from_item]), 
              json.dumps(from_json[from_item]), 
              self.target_config_filepath,log)
      PATH_HOLDER.pop(-1)

  def do_upgrade(self):
    log.info("Start to upgrade event handler for hooking Lotus Connections events")
    
    self.upgrade_event_handler()
    
    self.upgrade_from_102 = False
    
    if not self.old_daemon_lib_filepath:
      # old daemon path is not found from configuration
      lib_path = self.__get_daemon_shared_lib()
      if not lib_path:
      	# daemon path is not found from WAS shared lib
      	self.upgrade_from_102 = True
    
    if self.upgrade_from_102:
      log.info("Daemon for Conversion on upload is not installed before")
      
      return self.do()
    else:
      if not os.path.exists(self.backup_dir):
        os.makedirs(self.backup_dir)
      # upgrade daemon library
      ret_value = self.upgrade_daemon_library()
      if not ret_value:
        return False
    
      #upgrade shared library
      ret_value = self.upgrade_shared_lib()
      if not ret_value:
        return False

      # upgrade daemon config
      return self.upgrade_daemon_config()
  
  def upgrade_shared_lib(self):
    log.info("Updating Websphere variable %s..." % (DAEMON_SHAREDLIB_NAME))
    
    self.undo_upgrade_event_handler()
    
    self.shared_lib_updated = False  
    succ = True
    if self.old_daemon_lib_filepath:
      if self.old_daemon_lib_filepath != self.daemon_lib_filepath:
      	succ = self.delete_shared_lib()
      	if not succ:
      	  return False
      	succ = self.create_shared_lib(None)
      	if not succ:
      	  return False
      	self.shared_lib_updated = True
      	
    else:
      log.debug("No value change.")
      
    if succ:
      log.info("Update Websphere variables %s completed" % (DAEMON_SHAREDLIB_NAME))
      
    return succ

  def undo_upgrade_shared_lib(self):
    log.info("Rollback Websphere shared libarary %s " % (DAEMON_SHAREDLIB_NAME))
    
    succ = True
    if self.shared_lib_updated:
      succ = self.delete_shared_lib()
      if not succ:
        return False
      succ = self.create_shared_lib(self.old_daemon_lib_filepath)
      if not succ:
      	return False
    else:
      log.info("Nothing changed, no need to roll back daemon shared libarary.")
      
    return succ
    
  def get_install_file(self):
    bdl_zip = ""
    for f in os.listdir(self.ext_bld_dir):
      if f.find(DAEMON_JAR_FILENAME) > -1:
        bdl_zip = self.ext_bld_dir + "/" + f
        break
    return bdl_zip
   
  def upgrade_daemon_library(self):
  	
    if not os.path.exists(self.daemon_lib_filepath):
      log.info("Did not find daemon library file for the event handler %s" % self.daemon_lib_filepath)
      
    # else:
    bdl_zip = self.get_install_file()
    succ = True
    if not os.path.exists(bdl_zip):
      log.info("No need to upgrade Viewer daemon library")
      return True
    self.updater = FileInstall(bdl_zip, self.daemon_lib_dir, self.backup_dir)             
    succ = self.updater.upgrade_files()
    if not succ:
      raise Exception("Failed to upgrade daemon library file for the event handler %s" % self.daemon_lib_filepath)
      
    if self.old_daemon_lib_filepath:
      if self.old_daemon_lib_filepath != self.daemon_lib_filepath:
         shutil.copy2(self.old_daemon_lib_filepath, self.backup_dir)
         os.remove(self.old_daemon_lib_filepath)
    
    log.info("Successfully upgraded Viewer Daemon Library")
    return succ
   
  def undo_upgrade_daemon_library(self):
    log.info("Start to rollback daemon library upgrade")
    succ = True
    if not self.updater:
      log.info("No need to upgrade Viewer Library")
      return True
    else:
      succ = self.updater.undo_upgrade_files()
      if self.old_daemon_lib_filepath:
        if self.old_daemon_lib_filepath != self.daemon_lib_filepath:
           shutil.copy2(self.backup_dir + os.sep + DAEMON_JAR_FILENAME, os.path.dirname(self.old_daemon_lib_filepath))
           os.remove(self.backup_dir + os.sep + DAEMON_JAR_FILENAME)
    
    if succ:
      log.info("Successfully rollback daemon library upgrade")
      return succ
    else:
      log.info("Failed to rollback daemon library upgrade")
      return False
   
  def upgrade_daemon_config(self):
    log.info("Start to upgrade configuration file for event handler")
    if not os.path.isfile(self.src_config_filepath):
      log.error("Didn't find the event handler configuration file %s" % self.src_config_filepath)
      return False
      
    # backup the old config file
    self.__delete_old_config(self.daemoncon_back_up, self.daemon_path)
    
    # replace file
    template_file = self.ext_bld_dir + "/config/" + CONFIG_JSON_SRC_NAME
    target_file = self.config_json_full_name + ".upgrade"   
    self.generate_config_json(template_file, target_file)    

    new_json_file = open( target_file)
    new_json = json.load(new_json_file)
    new_json_file.close()
    os.remove(target_file)
    installed_json_file = open(self.daemoncon_back_up)
    installed_json = json.load(installed_json_file)
    installed_json_file.close()

    self.merge_json(new_json, installed_json)

    installed_json_file = open(self.target_file, 'w')
    json.dump( installed_json, installed_json_file, indent=2 )
    
    self.__install_config(target_file, self.daemon_path)
    
    log.info("Successfully upgrade the event handler configuration file %s " % self.target_config_filepath)
    return True
  
  def undo_upgrade_daemon_config(self):
    log.info("Start to rollback daemon configuration file upgrade")
    
    self.__install_config(self.daemoncon_back_up, self.daemon_path)
    
    log.info("Successfully rollback daemon configuration file upgrade")
    return True
    
  def undo_upgrade(self):
    if self.upgrade_from_102:
      return self.undo()
    else:    

      log.info("Start to rollback Viewer Upgrade")
      succ = self.undo_upgrade_daemon_library()
      if not succ:
        return False    

      succ = self.undo_upgrade_shared_lib()
      if not succ:
        return False    

      succ = self.undo_upgrade_daemon_config()
      if succ:
        log.info("Successfully rollback Viewer Upgrade")
        return succ
      else:
        log.info("Failed to rollback Viewer Upgrade")
        return False      

  def __install_config(self, src, pathElem):
    """install the configuration as websphere document"""
    
    cmd_args = CFG.get_was_cmd_line()
    cmd_args.extend(["-f",  "./icext/tasks/create_config_json.py", src])
    cmd_args.extend(pathElem)
    succ, ws_out = call_wsadmin(cmd_args)
    os.remove(src)
    if not succ:
      raise Exception('Failed to create configuration file.')

  def __save_config(self, src, pathElem):
    """save back the configuration changes into a websphere document"""
    
    cmd_args = CFG.get_was_cmd_line()
    cmd_args.extend(["-f",  "./icext/tasks/save_config_json.py", src])
    cmd_args.extend(pathElem)
    succ, ws_out = call_wsadmin(cmd_args)
    os.remove(src)
    if not succ:
      raise Exception('Failed to save configuration file.')
    

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
      
