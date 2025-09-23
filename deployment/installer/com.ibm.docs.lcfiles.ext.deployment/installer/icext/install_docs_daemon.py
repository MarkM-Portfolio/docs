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

import codecs, os, re, sys, time, fileinput, shutil, string
from common import command, call_wsadmin, CFG, config_log, FileInstall, configfiles
from xml.dom.minidom import parse
from xml.dom.minidom import Document
from io import StringIO
import logging as log
from util import operate_config_file

try:
  import json
except ImportError:
  import simplejson as json

SERVER_URL_PATTERN = r"\s*\"server_url\"\s*:\s*\"(https?://.+/docs)\" *,?"
IGNORE_EVENT_PATTERN = r"\s*\"ignore_event\"\s*:\s*\"(false)\""

DAEMON_CONFIG_FILENAME = "docs-daemon-config.json"
CONFIG_JSON_SRC_NAME = "docs-daemon-config.json"
DAEMON_JAR_FILENAME = "com.ibm.docs.lcfiles.daemon.jar"
DAEMON_SHAREDLIB_NAME = 'DocsDaemonLib'
NEWS_APPLICATION_NAME = "News"
NEWS_EVENTS_CONFIG_NAME = "events-config.xml"
EVENT_HANDLER_NAME = "DocsEventHandler"
EVENT_HANDLER_CLASS = "com.ibm.docs.lcfiles.daemon.handlers.DocsEventHandler"
DAEMON_BACKUP_FOLDER = "daemon"
CONNECTIONS_PROVISION_PATH_VAR_NAME = "CONNECTIONS_PROVISION_PATH"

JSON_LIST_ENTRY_IDENTFER = {}
PATH_HOLDER = []

class InstallDocsDaemon(command.Command):
  """This command will install event handler for hooking Lotus Connections events"""

  def __init__(self):
    self.extFS = CFG.get_config_dir()
    self.ext_bld_dir = CFG.get_build_dir()
    self.ignore_event = CFG.get_ignore_event()
    self.docs_server_url = CFG.get_docs_server_url()
    self.daemon_dir = CFG.get_daemon_location()
    self.daemon_lib_dir = os.path.join(self.daemon_dir, 'library')
    self.daemon_lib_filepath = os.path.join(self.daemon_lib_dir, DAEMON_JAR_FILENAME)
    self.backup_dir = CFG.get_temp_dir() + os.sep+ DAEMON_BACKUP_FOLDER
    self.config_json_full_name= self.ext_bld_dir + os.sep + "config" + os.sep + DAEMON_CONFIG_FILENAME
    self.updater = None
    self.do_as_upgrade = False

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
    self.target_config_filepath = CFG.get_temp_dir() + os.sep + DAEMON_CONFIG_FILENAME
    self.news_event_config_filepath = CFG.get_temp_dir() + os.sep + NEWS_EVENTS_CONFIG_NAME

    self.remote_daemon_config_filepath = "cells/%s/IBMDocs-config/%s" % (CFG.get_cell_name(), DAEMON_CONFIG_FILENAME)
    self.remote_daemon_config_filepath_old = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), DAEMON_CONFIG_FILENAME)
    self.remote_news_event_config_filepath = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), NEWS_EVENTS_CONFIG_NAME)

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Install event handler for hooking Lotus Connections events Started")

    # Prepare: Create the path
    if not os.path.isdir(self.daemon_dir):
      os.makedirs(self.daemon_dir)
    if not os.path.isdir(self.daemon_lib_dir):
      os.makedirs(self.daemon_lib_dir)

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
    #if os.path.isdir(self.daemon_dir):
    #  os.rmdir(self.daemon_dir)

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

  def create_shared_lib(self):
    log.info("Start to create SharedLib for event handler")

    daemon_lib_filepath_for_shared_lib = self.daemon_lib_filepath.replace("\\", "/")
    if not CFG.get_is_dmgr_on_host():
      # get the deamon lib file path on the NFS server
      icext_jar_dir = CFG.get_icext_jar_location()
      common_part = icext_jar_dir.replace("\\", "/").replace("/provision/webresources", "")
      daemon_rel_filepath = self.daemon_lib_filepath.replace("\\", "/").replace(common_part, "")
      conections_provision_path = self.get_was_variable(CONNECTIONS_PROVISION_PATH_VAR_NAME)
      conections_shared_root = conections_provision_path.replace("\\", "/").replace("/provision", "")
      daemon_lib_filepath_for_shared_lib = conections_shared_root + daemon_rel_filepath
    # match the multiple space
    import re
    p = re.compile("[ \t\n\r\f\v]+")
    results = p.findall(daemon_lib_filepath_for_shared_lib)
    if len(results) != 0:
      print("there are spaces in " + daemon_lib_filepath_for_shared_lib)
      daemon_lib_filepath_for_shared_lib = "\"" + daemon_lib_filepath_for_shared_lib	+ "\""
    # wasadmin command line arguments
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./icext/tasks/create_shared_lib.py"])
    args.extend([DAEMON_SHAREDLIB_NAME])
    args.extend([daemon_lib_filepath_for_shared_lib])
    args.extend([NEWS_APPLICATION_NAME])

    succ, ws_out = call_wsadmin(args)
    if ws_out.find("successfully") < 0:
      raise Exception("Create shared library failed")

    log.info("Create SharedLib for event handler completed")
    return True

  def get_was_variable(self, name):
    log.debug("Getting " + name)
    succ, ws_out = self.call_task("get_websphere_variable.py", [name])
    if not succ:
      raise Exception("Failed to get varaible from websphere")
    value = None
    for line in ws_out.split('\n'):
      if line.find('value is:') > -1:
        value = line.strip(' \r\n\t').replace('value is:','')
        break
      elif line.find('no value found') > -1:
        value = None
        break
    return value

  def generate_config_json (self, src, dest):
    config_json_template_file = open(src)
    config_json_template_string = config_json_template_file.read()
    config_json_template_file.close()
    config_json_template = string.Template(config_json_template_string)

    cfg_dict = dict(CFG.get_raw_key_value())

    config_json_subst_string = config_json_template.substitute(cfg_dict)

    config_json_subst_file = open(dest, "w+")
    config_json_subst_file.write(config_json_subst_string)
    config_json_subst_file.close()

  def install_handler_config(self):
    log.info("Start to install configuration file for event handler")

    if not os.path.isfile(self.src_config_filepath):
      raise Exception("Didn't find the event handler configuration file %s" % self.src_config_filepath)

    self.generate_config_json(self.src_config_filepath, self.target_config_filepath)

    # create docs-daemon-config.json in configuration repository
    operate_config_file.create(self.remote_daemon_config_filepath, self.target_config_filepath)
    operate_config_file.create(self.remote_daemon_config_filepath_old, self.target_config_filepath)

    log.info("The event handler configuration file has been copied to %s" % self.target_config_filepath)

  def register_event_handler(self):
    log.info("Start to register daemon event handler into events-config.xml")

    # extract events-config.xml to local
    operate_config_file.extract(self.remote_news_event_config_filepath, self.news_event_config_filepath)

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

    # Create the files.file.created <subscription> element
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName", "files.file.created")
    subscription.setAttribute("source", "FILES")
    subscription.setAttribute("type", "CREATE")
    subscriptions.appendChild(subscription)

    # Create the files.file.updated <subscription> element
    subscription = doc.createElement("subscription")
    subscription.setAttribute("eventName", "files.file.updated")
    subscription.setAttribute("source", "FILES")
    subscription.setAttribute("type", "UPDATE")
    subscriptions.appendChild(subscription)

    # if CFG.get_ccm_enabled():
    #     # Create the ecm_files.approve.file.ecm.review.document.approved <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.approve.file.ecm.review.document.approved")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.post.file.ecm.file.checkin <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.post.file.ecm.file.checkin")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.delete.file.ecm.file.deleted <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.delete.file.ecm.file.deleted")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.delete.file.ecm.version.deleted <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.delete.file.ecm.version.deleted")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.update.file.ecm.file.checkout <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.update.file.ecm.file.checkout")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.add.file.ecm.draft.created <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.add.file.ecm.draft.created")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.follow.file.ecm.follow.created <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.follow.file.ecm.follow.created")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.add.file.ecm.file.added.to.teamspace <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.add.file.ecm.file.added.to.teamspace")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.post.file.ecm.draft.updated <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.post.file.ecm.draft.updated")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    #     # Create the ecm_files.update.file.ecm.file.restore <subscription> element
    #     subscription = doc.createElement("subscription")
    #     subscription.setAttribute("eventName", "ecm_files.update.file.ecm.file.restore")
    #     subscription.setAttribute("source", "EXTERNAL")
    #     subscription.setAttribute("type", "*")
    #     subscriptions.appendChild(subscription)

    postHandler.appendChild(subscriptions)
    postHanlersElem.appendChild(postHandler)

    # write minidom to XML
    file_object = open(self.news_event_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()

    # check events-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_news_event_config_filepath, self.news_event_config_filepath)

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

    # delete docs-daemon-config.json in configuration repository
    if operate_config_file.exist(self.remote_daemon_config_filepath):
      operate_config_file.delete(self.remote_daemon_config_filepath)
    if operate_config_file.exist(self.remote_daemon_config_filepath_old):
      operate_config_file.delete(self.remote_daemon_config_filepath_old)

    log.info("The event handler configuration file %s has been deleted" % self.target_config_filepath)

  def unregister_event_handler(self):
    log.info("Start to unregister daemon event handler from events-config.xml")

    # extract events-config.xml to local
    operate_config_file.extract(self.remote_news_event_config_filepath, self.news_event_config_filepath)

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

    # check events-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_news_event_config_filepath, self.news_event_config_filepath)

    log.info("Unregister daemon event handler from events-config.xml completed")

  def do_upgrade(self):
    log.info("Start to upgrade event handler for hooking Lotus Connections events")
    if not os.path.exists(self.daemon_lib_filepath) and not os.path.isfile(self.target_config_filepath):
      self.do_as_upgrade = True
      return self.do()
    if not os.path.exists(self.backup_dir):
      os.makedirs(self.backup_dir)
    # upgrade daemon library
    ret_value = self.upgrade_daemon_library()
    if not ret_value:
      return False
    # upgrade daemon config
    return self.upgrade_daemon_config()

  def get_install_file(self):
    bdl_zip = ""
    for f in os.listdir(self.ext_bld_dir):
      if f.find(DAEMON_JAR_FILENAME) > -1:
        bdl_zip = self.ext_bld_dir + "/" + f
        break
    return bdl_zip

  def upgrade_daemon_library(self):
    if not os.path.exists(self.daemon_lib_filepath):
      raise Exception("Did not find daemon library file for the event handler %s" % self.daemon_lib_filepath)
    else:
      bdl_zip = self.get_install_file()
      succ = True
      if not os.path.exists(bdl_zip):
        log.info("No need to upgrade HCL Docs daemon library")
        return True
      self.updater = FileInstall(bdl_zip, self.daemon_lib_dir, self.backup_dir)
      succ = self.updater.upgrade_files()
      if succ:
        log.info("Successfully upgraded HCL Docs Daemon Library")
        return succ
      else:
        raise Exception("Failed to upgrade daemon library file for the event handler %s" % self.daemon_lib_filepath)

  def undo_upgrade_daemon_library(self):
    log.info("Start to rollback daemon library upgrade")
    succ = True
    if not self.updater:
      log.info("No need to upgrade HCL Docs Daemon Library")
      return True
    else:
      succ = self.updater.undo_upgrade_files()
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

    # extract docs-daemon-config.json to local
    if operate_config_file.exist(self.remote_daemon_config_filepath):
      operate_config_file.extract(self.remote_daemon_config_filepath, self.target_config_filepath)
    elif operate_config_file.exist(self.remote_daemon_config_filepath_old):
      operate_config_file.extract(self.remote_daemon_config_filepath_old, self.target_config_filepath)


    # backup the old config file
    shutil.copy(self.target_config_filepath, self.backup_dir)
    # replace file
    template_file = self.ext_bld_dir + "/config/" + CONFIG_JSON_SRC_NAME
    template_target_file = self.config_json_full_name + ".upgrade"
    self.generate_config_json(template_file, template_target_file)

    configfiles.merge_json_files(template_target_file, self.target_config_filepath)
    os.remove(template_target_file)

    # check docs-daemon-config.json into the configuration repository
    operate_config_file.checkin(self.remote_daemon_config_filepath, self.target_config_filepath)
    operate_config_file.checkin(self.remote_daemon_config_filepath_old, self.target_config_filepath)

    log.info("Successfully upgrade the event handler configuration file %s " % self.target_config_filepath)
    return True

  def undo_upgrade_daemon_config(self):
    log.info("Start to rollback daemon configuration file upgrade")
    bak_config_path = self.backup_dir + os.sep + CONFIG_JSON_SRC_NAME

    # check docs-daemon-config.json into the configuration repository
    operate_config_file.checkin(self.remote_daemon_config_filepath_old, bak_config_path)
    operate_config_file.checkin(self.remote_daemon_config_filepath, bak_config_path)

    log.info("Successfully rollback daemon configuration file upgrade")
    return True

  def undo_upgrade(self):
    log.info("Start to rollback HCL Docs Daemon Upgrade")
    if self.do_as_upgrade:
      return self.undo()
    succ = self.undo_upgrade_daemon_library()
    if not succ:
      return False
    succ = self.undo_upgrade_daemon_config()
    if succ:
      log.info("Successfully rollback HCL Docs Daemon Upgrade")
      return succ
    else:
      log.info("Failed to rollback HCL Docs Daemon Upgrade")
      return False
