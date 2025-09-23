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

pvhc_name = 'IBMDocs_ProxyVirtualHostConfig_001'
pvh_name = 'IBMDocs_ProxyVirtualHost_001'
pre_name = 'IBMDocs_ProxyRuleExpression_001'
pca_name = 'IBMDocs_HTTPResponseCompressionAction_001'

def to_prettyxml(node, encoding='UTF-8'):
  tmpStream = StringIO()
  PrettyPrint(node, stream=tmpStream, encoding=encoding)
  return tmpStream.getvalue()

def parse_content_types(pc_types):
  if pc_types != None:
    content_types = pc_types.split(";")
    return content_types;
  else:
    log.info("Input parameter pc_types is None")

  return None

def parse_rule_expression(pc_expression):
  rule_expression = ""
  if pc_expression != None:
    pc_expression = pc_expression.replace('"', "'")
    expressions_array = pc_expression.split(';')
    rule_expression = " OR ".join(expressions_array)
  else:
    wsadminlib.sop("parse_rule_expression:", "Input parameter pc_expression is None")

  wsadminlib.sop("parse_rule_expression:", "The proxy rule expression is: " + rule_expression)

  return rule_expression

def create_compress_action(node_name, server_name, pvhc_name, pvh_name, pre_name, pca_name, pc_expression, pc_types):
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

  # Get the proxy-settings.xml file path.
  settingsFile = os.path.join(serverCfgDir, 'proxy-settings.xml')
  log.info("The proxy-settings.xml file path is: %s" % settingsFile)

  # Backup the proxy-settings.xml file
  count = 1
  settingsFileBK = os.path.join(serverCfgDir, 'proxy-settings.xml.bak')
  while os.path.isfile(settingsFileBK):
    settingsFileBK = os.path.join(serverCfgDir, 'proxy-settings.xml.bak%d' % count)
    count = count + 1
  backup_file(settingsFile, settingsFileBK)
  log.info("Back up proxy-settings.xml file to file: %s" % settingsFileBK)

  # Parse the proxy-settings.xml file.
  try:
    doc = minidom.parse(settingsFile)
  except:
    log.info("Cannot parse the proxy-settings.xml file(%s)" % settingsFile)
    raise

  # Set the proxy virtual host schema.
  root = doc.getElementsByTagName("xmi:XMI")[0]
  proxyVirtualHostSchema = root.getAttribute('xmlns:proxyVirtualHost')
  if proxyVirtualHostSchema == '':
    root.setAttribute('xmlns:proxyVirtualHost', 'http://www.ibm.com/websphere/appserver/schemas/6.0/proxyVirtualHost.xmi')

  # Create a proxy virtual host config element.
  proxyVirtualHostCfgElements = doc.getElementsByTagName('proxyVirtualHost:ProxyVirtualHostConfig')
  if proxyVirtualHostCfgElements.length > 0:
    proxyVirtualHostCfgElement = proxyVirtualHostCfgElements[0]
  else:
    proxyVirtualHostCfgElement = doc.createElement('proxyVirtualHost:ProxyVirtualHostConfig')
    root.appendChild(proxyVirtualHostCfgElement)
  if not proxyVirtualHostCfgElement.hasAttribute('xmi:id'):
     proxyVirtualHostCfgElement.setAttribute('xmi:id', pvhc_name)

  # Removes the old elements about HCL Docs proxy server.
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyVirtualHosts")
  for child in childs:
    if child.getAttribute('xmi:id') == pvh_name:
      proxyVirtualHostCfgElement.removeChild(child)
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyRuleExpressions")
  for child in childs:
    if child.getAttribute('xmi:id') == pre_name or child.getAttribute('name') == pre_name:
      proxyVirtualHostCfgElement.removeChild(child)
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyActions")
  for child in childs:
    if child.getAttribute('xmi:id') == pca_name or child.getAttribute('name') == pca_name:
      proxyVirtualHostCfgElement.removeChild(child)

  # Create proxy actions element.
  proxyActionsElement = doc.createElement('proxyActions')
  proxyActionsElement.setAttribute('xmi:id', pca_name)
  proxyActionsElement.setAttribute('name', pca_name)
  proxyActionsElement.setAttribute('xmi:type', 'proxyVirtualHost:HTTPResponseCompressionAction')
  compress_types = parse_content_types(pc_types)
  for compress_type in compress_types:
    compress_type = compress_type.strip()
    contentTypesTextNode = doc.createTextNode(compress_type)
    contentTypesElement = doc.createElement('contentTypes')
    contentTypesElement.appendChild(contentTypesTextNode)
    proxyActionsElement.appendChild(contentTypesElement)
  proxyVirtualHostCfgElement.appendChild(proxyActionsElement)

  # Create proxy rule expression element.
  proxyRuleExpElement = doc.createElement('proxyRuleExpressions')
  proxyRuleExpElement.setAttribute('xmi:id', pre_name)
  proxyRuleExpElement.setAttribute('name', pre_name)
  proxyRuleExpElement.setAttribute('expression', parse_rule_expression(pc_expression))
  proxyRuleExpElement.setAttribute('enabledProxyActions',pca_name)
  proxyVirtualHostCfgElement.appendChild(proxyRuleExpElement)

  # Create proxy virtual host element.
  proxyVirtualHostsElement = doc.createElement('proxyVirtualHosts')
  proxyVirtualHostsElement.setAttribute('xmi:id', pvh_name)
  proxyVirtualHostsElement.setAttribute('virtualHostPort', '*')
  proxyVirtualHostsElement.setAttribute('enabledProxyRuleExpressions', pre_name)
  proxyVirtualHostCfgElement.appendChild(proxyVirtualHostsElement)

  # Enable the proxy virtual host.
  enabledVirtualHosts = proxyVirtualHostCfgElement.getAttribute('enabledProxyVirtualHosts')
  log.info("Current Enabled Virtual hosts: %s" % enabledVirtualHosts)
  index = enabledVirtualHosts.find(pvh_name)
  if index == -1 :
    if enabledVirtualHosts == '':
      enabledVirtualHosts = pvh_name
    else:
      enabledVirtualHosts = enabledVirtualHosts + ' ' + pvh_name
  log.info("New Enabled Virtual hosts: %s" % enabledVirtualHosts)
  proxyVirtualHostCfgElement.setAttribute('enabledProxyVirtualHosts', enabledVirtualHosts)

  f = open(settingsFile,'w')
  f.write(to_prettyxml(doc))
  f.close()

  return None

def delete_compress_action(node_name, server_name, pvhc_name, pvh_name, pre_name, pca_name):
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

  # Get the proxy-settings.xml file path.
  settingsFile = os.path.join(serverCfgDir, 'proxy-settings.xml')
  log.info("The proxy-settings.xml file path is: %s" % settingsFile)

  # Parse the proxy-settings.xml file.
  try:
    doc = minidom.parse(settingsFile)
  except:
    log.info("Cannot parse the proxy-settings.xml file(%s)" % settingsFile)
    raise

  proxyVirtualHostCfgElements = doc.getElementsByTagName('proxyVirtualHost:ProxyVirtualHostConfig')
  if proxyVirtualHostCfgElements.length > 0:
    proxyVirtualHostCfgElement = proxyVirtualHostCfgElements[0]
  else:
    log.info("No need to remove the compression action, because there is no proxy virtual host config")
    return None

  # Removes the old elements about HCL Docs proxy server.
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyVirtualHosts")
  for child in childs:
    if child.getAttribute('xmi:id') == pvh_name:
      proxyVirtualHostCfgElement.removeChild(child)
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyRuleExpressions")
  for child in childs:
    if child.getAttribute('xmi:id') == pre_name or child.getAttribute('name') == pre_name:
      proxyVirtualHostCfgElement.removeChild(child)
  childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyActions")
  for child in childs:
    if child.getAttribute('xmi:id') == pca_name or child.getAttribute('name') == pca_name:
      proxyVirtualHostCfgElement.removeChild(child)

  # Remove the enabled the proxy virtual host.
  enabledVirtualHosts = proxyVirtualHostCfgElement.getAttribute('enabledProxyVirtualHosts')
  newEnabledVirtualHosts = enabledVirtualHosts
  log.info("Current Enabled Virtual hosts: %s" % enabledVirtualHosts)
  index = enabledVirtualHosts.find(pvh_name)
  if index > -1:
    newEnabledVirtualHosts = enabledVirtualHosts[0:index]
    if len(enabledVirtualHosts[len(pvh_name):len(enabledVirtualHosts)]) > 0:
      newEnabledVirtualHosts = ' ' + enabledVirtualHosts[len(pvh_name):len(enabledVirtualHosts)]
  log.info("New Enabled Virtual hosts: %s" % newEnabledVirtualHosts)
  proxyVirtualHostCfgElement.setAttribute('enabledProxyVirtualHosts', newEnabledVirtualHosts)

  f = open(settingsFile,'w')
  f.write(to_prettyxml(doc))
  f.close()

  return None

class CreateCompressAction(command.Command):
  def __init__(self):
    self.node_name = CFG.get_proxy_node_name()
    self.server_name = CFG.get_proxy_server_name()
    self.docs_context_root = CFG.get_docs_context_root()

  def readCfg(self, cfg=None):
    """read and setup config parameters from global util/conf.py and setting.py """
    self.pc_expression = ""
    cfg_proxy_compress_expression = cfg['proxy_compress_expression']
    expressions_array = cfg_proxy_compress_expression.split(';')
    for expression in expressions_array:
      self.pc_expression = self.pc_expression + "URI=\"" + self.docs_context_root + expression + "\";"
    if self.pc_expression.endswith(";"):
      self.pc_expression = self.pc_expression[0:(len(self.pc_expression) - 1)]
    self.pc_types = cfg['proxy_compress_types']

  def do(self):
    log.info("Start to create Proxy Compress Action for HCL Docs proxy server")

    create_compress_action(self.node_name, self.server_name, pvhc_name, pvh_name, pre_name, pca_name, self.pc_expression, self.pc_types)

    log.info("Create Proxy Compress Action for HCL Docs proxy server completed")
    return True

  def undo(self):
    log.info("Start to delete Proxy Compress Action for HCL Docs proxy server")

    delete_compress_action(self.node_name, self.server_name, pvhc_name, pvh_name, pre_name, pca_name)

    log.info("Delete Proxy Compress Action for HCL Docs proxy server completed")
    return True
