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

import codecs, os, re, sys, time, fileinput, shutil
from commands import command
from util.common import call_wsadmin
from xml.dom.minidom import parse
from xml.dom.ext import PrettyPrint
from icext.config import CONFIG as CFG
from StringIO import StringIO
import logging as log

SERVER_URL_PATTERN = r"\s*\"server_url\"\s*:\s*\"(https?://.+/docs)\" *,?"
IGNORE_EVENT_PATTERN = r"\s*\"ignore_event\"\s*:\s*\"(false)\""

DAEMON_CONFIG_FILENAME = "docs-daemon-config.json"
DAEMON_JAR_FILENAME = "com.ibm.docs.lcfiles.daemon.jar"
DAEMON_SHAREDLIB_NAME = 'DocsDaemonLib'
NEWS_APPLICATION_NAME = "News"
NEWS_EVENTS_CONFIG_NAME = "events-config.xml"
EVENT_HANDLER_NAME = "DocsEventHandler"
EVENT_HANDLER_CLASS = "com.ibm.docs.lcfiles.daemon.handlers.DocsEventHandler"

class InstallDocsDaemon(command.Command):
  """This command will install event handler for hooking Lotus Connections events"""

  def __init__(self):
    self.ext_bld_dir = CFG.get_build_dir()
    self.dm_profile_dir = CFG.get_was_dm_profile_dir()
    self.ignore_event = CFG.get_ignore_event()
    self.docs_server_url = CFG.get_docs_server_url()
    self.daemon_dir = CFG.get_daemon_location()
    self.daemon_lib_dir = os.path.join(self.daemon_dir, 'library')
    self.daemon_lib_filepath = os.path.join(self.daemon_lib_dir, DAEMON_JAR_FILENAME)
    
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
    self.target_config_filepath = os.path.join(self.dm_profile_dir, 'config', 'cells', self.cell_name, 'LotusConnections-config', DAEMON_CONFIG_FILENAME)
    
    self.news_event_config_path = os.path.join(self.dm_profile_dir, 'config', 'cells', self.cell_name, 'LotusConnections-config')
    self.news_event_config_filepath = os.path.join(self.news_event_config_path, NEWS_EVENTS_CONFIG_NAME)

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

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
    self.create_shared_lib()
    
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
    
    # End: Remove path
    if os.path.isdir(self.daemon_lib_dir):
      os.rmdir(self.daemon_lib_dir)
    if os.path.isdir(self.daemon_dir):
      os.rmdir(self.daemon_dir)
    
    log.info("Uninstall event handler for hooking Lotus Connections events finished")
    return True
  
  def to_pretty_xml(self, node, encoding='UTF-8'):
    tmpStream = StringIO()
    PrettyPrint(node, stream = tmpStream, encoding = encoding)
    return tmpStream.getvalue()
  
  def install_handler_jar(self):
    log.info("Start to install the event handler jar")
    
    jar_src_filepath = os.path.join(self.ext_bld_dir, DAEMON_JAR_FILENAME)
    if not os.path.isfile(jar_src_filepath):
      raise Exception("Didn't find the event handler jar file %s" % jar_src_filepath)
    
    log.info("The source event handler jar file locate in %s" % jar_src_filepath)
    
    shutil.copy(jar_src_filepath, self.daemon_lib_filepath)
    
    log.info("The event handler jar file has been copied to %s" % self.daemon_lib_filepath)

  def create_shared_lib(self):
    log.info("Start to create SharedLib for event handler")
    
    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/create_shared_lib.py"])
    args.extend([DAEMON_SHAREDLIB_NAME])
    args.extend([self.daemon_lib_filepath])
    args.extend([NEWS_APPLICATION_NAME])
    
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("successfully") < 0:
      raise Exception("Create shared library failed")
    
    log.info("Create SharedLib for event handler completed")
    return True

  def install_handler_config(self):
    log.info("Start to install configuration file for event handler")
    
    if not os.path.isfile(self.src_config_filepath):
      raise Exception("Didn't find the event handler configuration file %s" % self.src_config_filepath)
    
    shutil.copy(self.src_config_filepath, self.target_config_filepath)
    
    for line in fileinput.input(self.target_config_filepath, inplace=1):
      if re.match(SERVER_URL_PATTERN, line):
        match_obj = re.match(SERVER_URL_PATTERN, line).group(1)
        line = re.sub(match_obj, self.docs_server_url, line)
      elif re.match(IGNORE_EVENT_PATTERN, line):
        match_obj = re.match(IGNORE_EVENT_PATTERN, line).group(1)
        line = re.sub(match_obj, self.ignore_event, line)
      sys.stdout.write(line)
    
    log.info("The event handler configuration file has been copied to %s" % self.target_config_filepath)
  
  def register_event_handler(self):
    log.info("Start to register daemon event handler into events-config.xml")
    
    # Backup the events-config.xml
    timestamp = str(int(time.time()))
    shutil.copy(self.news_event_config_filepath, (self.news_event_config_filepath + '_' + timestamp + '.bak'))
    
    # Create the minidom document
    doc = parse(self.news_event_config_filepath)
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
    
    # Create the <subscription> element
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName", "files.file.created")  
    subscription.setAttribute("source", "FILES")  
    subscription.setAttribute("type", "CREATE")  
    subscriptions.appendChild(subscription)
    
    # Create the <subscription> element
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName", "files.file.updated")  
    subscription.setAttribute("source", "FILES")  
    subscription.setAttribute("type", "UPDATE")  
    subscriptions.appendChild(subscription)
    
    postHandler.appendChild(subscriptions)
    postHanlersElem.appendChild(postHandler)
    
    # write minidom to XML
    file_object = open(self.news_event_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    
    log.info("Register daemon event handler into events-config.xml completed")
  
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
    
    if os.path.isfile(self.target_config_filepath):
      os.remove(self.target_config_filepath)
    
    log.info("The event handler configuration file %s has been deleted" % self.target_config_filepath)

  def unregister_event_handler(self):
    log.info("Start to unregister daemon event handler from events-config.xml")
    
    # Backup the events-config.xml
    timestamp = str(int(time.time()))
    shutil.copy(self.news_event_config_filepath, (self.news_event_config_filepath + '_' + timestamp + '.bak'))
    
    # Create the minidom document
    doc = parse(self.news_event_config_filepath)
    root = doc.documentElement
    postHanlersElem = root.getElementsByTagName("postHandlers")[0]
    postHandlers = postHanlersElem.getElementsByTagName("postHandler")
    
    # Remove the old event handler
    for existHandler in postHandlers:
     if existHandler.getAttribute('name') == EVENT_HANDLER_NAME:
       postHanlersElem.removeChild(existHandler)
    
    # write minidom to XML
    file_object = open(self.news_event_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    
    log.info("Unregister daemon event handler from events-config.xml completed")

