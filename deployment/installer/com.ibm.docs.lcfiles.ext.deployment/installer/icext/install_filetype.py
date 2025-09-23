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

import os,platform,re
import shutil
from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from common import command, call_wsadmin, CFG
import logging as log
import fileinput
from util import operate_config_file

FILES_URL_CONFIG_NAME = "files-url-config.xml"
FILES_CONFIG_NAME = "files-config.xml"
IBM_DOCS_XML = "ibmdocs.xml"
CONNECTIONS_PROVISION_PATH_VAR_NAME = "CONNECTIONS_PROVISION_PATH"


class InstallFiletype(command.Command):
  """This command will install ibmdocs.xml"""

  def __init__(self):
    self.ext_bld_dir = CFG.get_build_dir()
    self.daemon_location = CFG.get_daemon_location()
    self.files_url_config_filepath = CFG.get_temp_dir() + os.sep + FILES_URL_CONFIG_NAME
    self.files_config_filepath = CFG.get_temp_dir() + os.sep + FILES_CONFIG_NAME
    self.remote_files_url_config_filepath = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), FILES_URL_CONFIG_NAME)
    self.remote_files_config_filepath = "cells/%s/LotusConnections-config/%s" % (CFG.get_cell_name(), FILES_CONFIG_NAME)
    self.remote_ibmdocsxml_filepath = "cells/%s/IBMDocs-config/%s" % (CFG.get_cell_name(), IBM_DOCS_XML)
    self.enable_upload_new_version = CFG.get_enable_upload_new_version()

  def remove_blank_lines (self, file_name):
    for line in fileinput.FileInput(file_name, inplace=1):
      if line.strip() == '':
        continue
      print(line.rstrip())

  def to_pretty_xml(self, node):
    return node.toprettyxml(indent="  ", newl="\n", encoding="UTF-8")

  def install_mime_files_config (self):
    log.info("Start to configure the inlineDownload in files-config.xml for the HCL Docs")

    # extract files-config.xml to local
    operate_config_file.extract(self.remote_files_config_filepath, self.files_config_filepath)

    doc = parse(self.files_config_filepath)
    root = doc.documentElement

    configure_found = False
    security_element = root.getElementsByTagName("security")
    inline_download_element = []
    if security_element:
      inline_download_element = security_element[0].getElementsByTagName("inlineDownload")

    if inline_download_element:
      configure_found = True
      e = inline_download_element[0]
      attr = e.getAttributeNode('enabled')
      if attr and attr.nodeValue == 'false':
        log.info("Configure the inlineDownload in files-config.xml for the HCL Docs completed.")
        return
      attr.nodeValue = 'false'

    if not configure_found:
      inline_download_element = parseString('<inlineDownload enabled="false"/>').documentElement
      security_element[0].appendChild(inline_download_element)

    file_object = open(self.files_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    self.remove_blank_lines(self.files_config_filepath)

    # check files-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_files_config_filepath, self.files_config_filepath)

    log.info("Configure the files-config.xml for the HCL Docs completed.")

  def map_appconnector (self):
    log.info("Start map app-connector to %s" % CFG.get_was_adminid())
    args = ["map"]
    succ, ws_out = self.call_task("map_appconnector.py", args)

    if not succ or ws_out.find("app-connector mapped successfully") < 0:
      raise Exception("Map app-connector failed")

    log.info("Map app-connector completed")

  def install_files_url_config (self):
    log.info("Start to configure the files-url-config.xml for the HCL Docs")

    # extract files-url-config.xml to local
    operate_config_file.extract(self.remote_files_url_config_filepath, self.files_url_config_filepath)

    # Create the minidom document
    doc = parse(self.files_url_config_filepath)
    root = doc.documentElement

    docs_filetype_found = False
    objectTypes = root.getElementsByTagName("objectType")
    for objectType in objectTypes :
      if objectType.getAttribute('name') == "ibmdocs:file":
        docs_filetype_found = True
        break

    if not docs_filetype_found:
      # Create the <objectType> element
      objectType_element = doc.createElement("objectType")
      objectType_element.setAttribute("name", "ibmdocs:file")
      objectType_element.setAttribute("urlCustomizer", "com.ibm.lconn.share.platform.url.DefaultURLCustomizer")

      # Create the <property> elements
      property_element = doc.createElement("property")
      property_element.setAttribute("name", "server.port.http")
      property_element.setAttribute("value", "80")
      objectType_element.appendChild(property_element)

      property_element = doc.createElement("property")
      property_element.setAttribute("name", "server.port.https")
      property_element.setAttribute("value", "443")
      objectType_element.appendChild(property_element)

      property_element = doc.createElement("property")
      property_element.setAttribute("name", "link.custom")
      property_element.setAttribute("value", "/docs/app/doc/lcfiles/{fileId}/editorview/content")
      objectType_element.appendChild(property_element)

      root.appendChild(objectType_element)

      # write minidom to XML
      file_object = open(self.files_url_config_filepath, 'w')
      file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
      file_object.close()
      self.remove_blank_lines(self.files_url_config_filepath)

    # check files-url-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_files_url_config_filepath, self.files_url_config_filepath)

    log.info("Configure the files-url-config.xml for the HCL Docs completed")

  def install_files_config (self):
    log.info("Start to configure the files-config.xml for the HCL Docs")

    # extract files-config.xml to local
    operate_config_file.extract(self.remote_files_config_filepath, self.files_config_filepath)

    # Create the minidom document
    doc = parse(self.files_config_filepath)
    root = doc.documentElement

    docs_filetype_found = False
    actionControls = root.getElementsByTagName("actionControl")
    for actionControl in actionControls :
      objectType = actionControl.getElementsByTagName("objectType")[0]
      if objectType.getAttribute('id') == "00000000-00000-0000-0001-00000000000000" or objectType.getAttribute('id') == "00000000-0000-0000-0001-000000000000":
        docs_filetype_found = True
        if self.enable_upload_new_version:
          actions = actionControl.getElementsByTagName("actions")[0]
          actionElements = actions.getElementsByTagName("action")
          for actionElement in actionElements :
            if actionElement.getAttribute("name") == "uploadNewVersion" :
              log.info("Found: uploadNewVersion action")
              restrictedRoles = actionElement.getElementsByTagName("restrictedRoles")
              for restrictedRole in restrictedRoles:
                removed = actionElement.removeChild(restrictedRole)
                if removed != None:
                  log.info("Removed: restrictedRoles")
                  removed.unlink()
            if actionElement.getAttribute("name") == "restoreVersion" :
              log.info("Found: restoreVersion action")
              restrictedRoles = actionElement.getElementsByTagName("restrictedRoles")
              for restrictedRole in restrictedRoles:
                removed = actionElement.removeChild(restrictedRole)
                if removed != None:
                  removed.unlink()
      break #if objectType.getAttribute('id') == "00000000-00000-0000-0001-00000000000000"

    if not docs_filetype_found:
      # Create the <actionControl> element
      actionControl_element = doc.createElement("actionControl")
      root.appendChild(actionControl_element)

      # Create the <objectType> elements
      objectType_element = doc.createElement("objectType")
      objectType_element.setAttribute("id", "00000000-00000-0000-0001-00000000000000")
      actionControl_element.appendChild(objectType_element)

      # Create the <actions> elements
      actions_element = doc.createElement("actions")
      objectType_element.appendChild(actions_element)

      # Create the <action> elements
      action_element = doc.createElement("action")
      action_element.setAttribute("name", "uploadNewVersion")
      action_element.setAttribute("enabled", "true")
      actions_element.appendChild(action_element)

      if not self.enable_upload_new_version:
        restrictedRoles_element = doc.createElement("restrictedRoles")
        restrictedRoles_element.setAttribute("mode", "allow")
        action_element.appendChild(restrictedRoles_element)

        role_element = doc.createElement("role")
        role_element.setAttribute("name", "app-connector")
        restrictedRoles_element.appendChild(role_element)

      # Create the <action> elements
      action_element = doc.createElement("action")
      action_element.setAttribute("name", "download")
      action_element.setAttribute("enabled", "true")
      actions_element.appendChild(action_element)

      # Create the <action> elements
      action_element = doc.createElement("action")
      action_element.setAttribute("name", "downloadEmptyFile")
      action_element.setAttribute("enabled", "false")
      actions_element.appendChild(action_element)

      # Create the <action> elements
      action_element = doc.createElement("action")
      action_element.setAttribute("name", "restoreVersion")
      action_element.setAttribute("enabled", "true")
      actions_element.appendChild(action_element)

      if not self.enable_upload_new_version:
        restrictedRoles_element = doc.createElement("restrictedRoles")
        restrictedRoles_element.setAttribute("mode", "allow")
        action_element.appendChild(restrictedRoles_element)

        role_element = doc.createElement("role")
        role_element.setAttribute("name", "app-connector")
        restrictedRoles_element.appendChild(role_element)

    # write minidom to XML
    file_object = open(self.files_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    self.remove_blank_lines(self.files_config_filepath)

    # check files-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_files_config_filepath, self.files_config_filepath)

    log.info("Configure the files-config.xml for the HCL Docs completed")

  def import_ibmdocs_xml (self):
    #from util import wsadminlib
    log.info("Start Import ibmdocs.xml")

    src_ibmdocs_xml_path = os.path.join ( self.ext_bld_dir, "config", IBM_DOCS_XML)
    src_ibmdocs_xml_path = os.path.abspath(src_ibmdocs_xml_path)
    src_ibmdocs_xml_path = src_ibmdocs_xml_path.replace("\\","/")

    #get the node list of installed connections
    apps = ['Files']
    argsApp = CFG.get_was_cmd_line()
    argsApp.extend(["-f",  "./icext/tasks/get_node_with_app.py"])
    argsApp.extend(apps)
    suc, node_out = call_wsadmin(argsApp)

    if not suc:
      raise Exception("Import ibmdocs.xml failed")

    node_name_var = "nodename"
    node_name_var = "".join([node_name_var,": "])

    ic_nodes = self._parse_info(node_name_var,node_out)

    self.ic_node_name_list = []
    for ic_node in ic_nodes:
      #if ic_node != 'webserver' or ic_node.find("webserver")<:
      if ic_node.find("webserver")==-1:
        self.ic_node_name_list.append(ic_node)

    if len(self.ic_node_name_list) == 0:
      raise Exception("Import ibmdocs.xml failed")

    # extract filesAdmin.py and lotusConnectionsCommonAdmin.py from configuration repository to temp dir
    from util import operate_config_file
    files_admin_file = os.path.join(CFG.get_temp_dir(), "filesAdmin.py")
    common_admin_file = os.path.join(CFG.get_temp_dir(), "lotusConnectionsCommonAdmin.py")
    shutil.copy('./util/wsadminlib.py',CFG.get_temp_dir())
    operate_config_file.extract("bin_lc_admin/filesAdmin.py", files_admin_file)
    operate_config_file.extract("bin_lc_admin/lotusConnectionsCommonAdmin.py", common_admin_file)

    if operate_config_file.exist(self.remote_ibmdocsxml_filepath):
      operate_config_file.delete(self.remote_ibmdocsxml_filepath)

    operate_config_file.checkin(self.remote_ibmdocsxml_filepath, src_ibmdocs_xml_path)

    #import ibmdocs xml
    savedPath = os.getcwd()
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  savedPath + "/icext/tasks/" + __name__.split(".")[1]+ ".py"])
    args.append(self.remote_ibmdocsxml_filepath)
    args.append(self.ic_node_name_list[0])
    os.chdir(CFG.get_temp_dir())
    succ, ws_out = call_wsadmin(args)
    os.chdir(savedPath)

    if operate_config_file.exist(self.remote_ibmdocsxml_filepath):
      operate_config_file.delete(self.remote_ibmdocsxml_filepath)

    if ws_out.find("No Files services found.") > -1:
      raise Exception("Files Application does not start or is not configure correctly.")

    if not succ or ws_out.find("Import ibmdocs.xml successfully") < 0:
      raise Exception("Import ibmdocs.xml failed")

    log.info("Import ibmdocs.xml completed")

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

  def uninstall_files_url_config(self):
    log.info("Remove HCL Docs filetype from files-url-config.xml.")

    # extract files-url-config.xml to local
    operate_config_file.extract(self.remote_files_url_config_filepath, self.files_url_config_filepath)

    # Create the minidom document
    doc = parse(self.files_url_config_filepath)
    root = doc.documentElement

    objectTypes = root.getElementsByTagName("objectType")
    for objectType in objectTypes :
      if objectType.getAttribute('name') == "ibmdocs:file":
        root.removeChild(objectType)
        break

    # write minidom to XML
    file_object = open(self.files_url_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode("utf-8"))
    file_object.close()
    self.remove_blank_lines(self.files_url_config_filepath)

    # check files-url-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_files_url_config_filepath, self.files_url_config_filepath)

    log.info("Remove HCL Docs filetype from files-url-config.xml complete.")

  def uninstall_files_config (self):
    log.info("Remove HCL Docs filetype from files-config.xml.")

    # extract files-config.xml to local
    operate_config_file.extract(self.remote_files_config_filepath, self.files_config_filepath)

    # Create the minidom document
    doc = parse(self.files_config_filepath)
    root = doc.documentElement

    actionControls = root.getElementsByTagName("actionControl")
    for actionControl in actionControls :
      objectType = actionControl.getElementsByTagName("objectType")[0]
      if objectType.getAttribute('id') == "00000000-00000-0000-0001-00000000000000":
      #if objectType.getAttribute('id') == "00000000-00000-0000-0001-00000000000000" or objectType.getAttribute('id') == "00000000-0000-0000-0001-000000000000":
        root.removeChild(actionControl)
        break

    # write minidom to XML
    file_object = open(self.files_config_filepath, 'w')
    file_object.write(self.to_pretty_xml(doc).decode('UTF-8'))
    file_object.close()
    self.remove_blank_lines(self.files_config_filepath)

    # check files-config.xml into the configuration repository
    operate_config_file.checkin(self.remote_files_config_filepath, self.files_config_filepath)

    log.info("Remove HCL Docs filetype from files-config.xml complete.")

  def unmap_appconnector (self):
    log.info("Start unmap app-connector")
    args = ["unmap"]
    succ, ws_out = self.call_task("map_appconnector.py", args)

    if not succ or ws_out.find("app-connector mapped successfully") < 0:
      raise Exception("Unmap app-connector failed")

    log.info("Unmap app-connector completed")

  def do(self):
    self.import_ibmdocs_xml()
    self.install_mime_files_config()
    self.install_files_url_config()
    self.install_files_config()
    self.map_appconnector()

    return True

  def undo(self):
    self.unmap_appconnector()
    self.uninstall_files_config()
    self.uninstall_files_url_config()
    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):
    return True

  def _parse_info(self,des,des_prt):
    des_list = []
    for line in des_prt.split('\n'):
      if line.find(des) > -1:
        #raise Exception("Didn't get the node name")
        index_start = line.find(des)
        index_end = index_start + len(des)
        des_name = line[index_end : len(line)]
        if des_name.find('\n') >= 0:
          des_name = des_name[0 : des_name.find('\n')]

        #log.info("Node name is: %s" % node_name)
        des_list.append(des_name)
      #endif line.find
    #endfor
    return des_list
