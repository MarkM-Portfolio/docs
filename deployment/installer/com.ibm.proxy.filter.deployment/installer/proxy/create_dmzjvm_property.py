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

import os
import logging as log
from common import command, CFG, call_wsadmin, split_lines, backup_file
from util import wsadminlib
from xml.dom import minidom
from xml.dom.ext import PrettyPrint
from io import StringIO

WS_EXT_DIR = {"name": "ws.ext.dirs", "value":"${USER_INSTALL_ROOT}/optionalLibraries/docs"}
pjvmext_id = 'Property_IBMDocs_ProxyServer_JVMExt_001'

def to_prettyxml(node, encoding='UTF-8'):
  tmpStream = StringIO()
  PrettyPrint(node, stream=tmpStream, encoding=encoding)
  return tmpStream.getvalue()

def add_ext_dir(ext_dirs, docs_proxyfilter_dir):
  result = ext_dirs
  log.info("Old ws.ext.dirs value is %s" %result)

  separator = ":"
  if os.name == "nt":
    separator = ";"
  else:
    separator = ":"

  if result != None and result != "":
    found = 0
    dirs = result.split(separator)
    for edir in dirs:
      if edir == docs_proxyfilter_dir:
        found = 1
        break
    if found == 0:
      result = result + separator + docs_proxyfilter_dir
  else:
    result = docs_proxyfilter_dir

  log.info("New ws.ext.dirs value is %s" %result)

  return result

def remove_ext_dir(ext_dirs, docs_proxyfilter_dir):
  result = ext_dirs
  log.info("Old ws.ext.dirs value is %s" %result)

  separator = ":"
  if os.name == "nt":
    separator = ";"
  else:
    separator = ":"

  temp = ""
  if result != None and result != "":
    dirs = result.split(separator)
    for edir in dirs:
      if edir != docs_proxyfilter_dir:
        temp = temp + separator + edir

  result = temp
  if result != None and result.find(separator) == 0:
    result = result[1:len(result)]

  log.info("New ws.ext.dirs value is %s" %result)

  return result

def create_jvm_property(node_name, server_name):
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "./proxy/tasks/get_server_config_files_directory.py"])
  args.extend([node_name])
  args.extend([server_name])
  succ, ws_out = call_wsadmin(args)
  outs = split_lines(ws_out)

  # Get the directory of proxy server configuration files.
  serverCfgDir = ""
  for each_out in outs:
    if each_out.find("IBMDocs_WAS_Server_Config_Files_Dir:") >= 0:
      serverCfgDir = each_out[len("IBMDocs_WAS_Server_Config_Files_Dir:"):len(each_out)]

  # Get the server.xml file path.
  serverFile = os.path.join(serverCfgDir, 'server.xml')
  log.info("The server.xml file path is: %s" % serverFile)

  # Backup the server.xml file
  count = 1
  serverFileBK = os.path.join(serverCfgDir, 'server.xml.bak')
  while os.path.isfile(serverFileBK):
    serverFileBK = os.path.join(serverCfgDir, 'server.xml.bak%d' % count)
    count = count + 1
  backup_file(serverFile, serverFileBK)
  log.info("Back up server.xml file to file: %s" % serverFileBK)

  try:
    doc = minidom.parse(serverFile)
  except:
    log.info('Error:  Failed to parse server.xml file %s' % serverFile)
    raise

  wsExtDirEntry = None
  jvmEntries = doc.getElementsByTagName('jvmEntries')
  for jvmEntry in jvmEntries:
    systemProperties = jvmEntry.getElementsByTagName('systemProperties')
    if systemProperties != None:
      for systemProperty in systemProperties:
        if systemProperty.getAttribute('name') == WS_EXT_DIR["name"]:
          wsExtDirEntry = systemProperty
          wsExtDirEntry.setAttribute('value', add_ext_dir(wsExtDirEntry.getAttribute('value'), WS_EXT_DIR["value"]))
          break

    if wsExtDirEntry == None:
      wsExtDirEntry = doc.createElement('systemProperties')
      wsExtDirEntry.setAttribute('xmi:id', pjvmext_id)
      wsExtDirEntry.setAttribute('name', WS_EXT_DIR["name"])
      wsExtDirEntry.setAttribute('value', WS_EXT_DIR["value"])
      wsExtDirEntry.setAttribute('required','false')
      jvmEntry.appendChild(wsExtDirEntry)
    break

  f = open(serverFile, 'w')
  f.write(to_prettyxml(doc))
  f.close()

  return None

def delete_jvm_property(node_name, server_name):
  args = CFG.get_was_cmd_line()
  args.extend(["-f",  "./proxy/tasks/get_server_config_files_directory.py"])
  args.extend([node_name])
  args.extend([server_name])
  succ, ws_out = call_wsadmin(args)
  outs = split_lines(ws_out)

  # Get the directory of proxy server configuration files.
  serverCfgDir = ""
  for each_out in outs:
    if each_out.find("IBMDocs_WAS_Server_Config_Files_Dir:") >= 0:
      serverCfgDir = each_out[len("IBMDocs_WAS_Server_Config_Files_Dir:"):len(each_out)]

  # Get the server.xml file path.
  serverFile = os.path.join(serverCfgDir, 'server.xml')
  log.info("The server.xml file path is: %s" % serverFile)

  try:
    doc = minidom.parse(serverFile)
  except:
    log.info('Error:  Failed to parse server.xml file %s' % serverFile)
    raise

  wsExtDirEntry = None
  jvmEntries = doc.getElementsByTagName('jvmEntries')
  for jvmEntry in jvmEntries:
    systemProperties = jvmEntry.getElementsByTagName('systemProperties')
    if systemProperties != None:
      for systemProperty in systemProperties:
        if systemProperty.getAttribute('name') == WS_EXT_DIR["name"]:
          value = remove_ext_dir(systemProperty.getAttribute('value'), WS_EXT_DIR["value"])
          if value == None or value == '':
            jvmEntry.removeChild(systemProperty)
          else:
            systemProperty.setAttribute('value', value)
          break

    break

  f = open(serverFile, 'w')
  f.write(to_prettyxml(doc))
  f.close()

  return None

class CreateJVMProperty(command.Command):
  """ This class creates JVM property for WAS proxy server, and relevant HttpSessionIdReUse property"""
  def __init__(self):
    self.proxy_node_name = CFG.get_proxy_node_name()
    self.proxy_server_name = CFG.get_proxy_server_name()

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def do(self):
    log.info("Start to create JVM property for HCL Docs proxy server")

    create_jvm_property(self.proxy_node_name, self.proxy_server_name)

    log.info("Create JVM property for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to delete JVM property for HCL Docs proxy server")

    delete_jvm_property(self.proxy_node_name, self.proxy_server_name)

    log.info("Delete JVM property for HCL Docs proxy server completed")
    return True
