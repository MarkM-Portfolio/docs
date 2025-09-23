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


import os, sys, shutil,string
import logging as log

from xml.dom.minidom import parse, parseString
from xml.dom.minidom import Document
from common import command, CFG, was_log, was, call_wsadmin
from xml.parsers.expat import ExpatError

import fileinput
import re

try:
  import json
except ImportError:
  import simplejson as json

PLUG_CFG_ORG="org"
PLUG_CFG_PROXY="proxy"
PLUG_CFG_FILE="plugin-cfg.xml"
PLUG_KEY_KDB="plugin-key.kdb"
PLUG_KEY_STH="plugin-key.sth"

class MapProxy2WebServer(command.Command):

  def __init__(self):
    #self.config = config.Config()
    #self.build_dir = CFG.get_build_dir()

    #self.proxy_scope_type = CFG.get_scope_type().lower()
    self.proxy_deployed = False

    self.proxy_scope_type = None
    self.proxy_server_name = None
    self.proxy_server_node = None
    self.proxy_cluster_name = None
    self.docs_cluster_or_server_name = None
    self.webserver_name = None

    if not self.get_was_variable('DOCS_INSTALL_ROOT'):
      return

    self.proxy_scope_type = self.get_was_variable('PROXY_SEVERCLUSTER_TYPE')
    if not self.proxy_scope_type:
      return
    self.proxy_scope_type = self.proxy_scope_type.lower()
    if self.proxy_scope_type == "server":
      #proxy_servers, clusters  = CFG.prepare_scope()
      self.proxy_server_name = self.get_was_variable('PROXY_SEVERCLUSTER_NAME')
      self.proxy_server_node = self.get_was_variable('PROXY_SEVERCLUSTER_NODE')
      if not self.proxy_server_name or not self.proxy_server_node:
        return
    else:
      self.proxy_cluster_name = self.get_was_variable('PROXY_SEVERCLUSTER_NAME')
      if not self.proxy_cluster_name:
        return

    self.docs_cluster_or_server_name = self.get_was_variable('DOCS_SERVERCLUSTER_NAME')
    if not self.docs_cluster_or_server_name:
      return

    self.webserver_name = self.get_was_variable('IHS_FOR_DOCS_PROXY')

    self.proxy_deployed = True

  def readCfg(self, cfg=None):
    self.app_name = cfg['app']
    if cfg['has_local_webserver'] == True:
      self.local_ihs_server = CFG.get_webserver_name()
    else:
      self.local_ihs_server = None
    self.need_map_module = cfg['need_map_module']
    if self.local_ihs_server:
      if self.webserver_name:
        if self.webserver_name != self.local_ihs_server:
          self.proxy_deployed = False
      else:
        self.webserver_name = self.local_ihs_server
    else:
      self.local_ihs_server = "all_webservers"

    if not self.webserver_name:
      self.webserver_name = "all_webservers"
    self.plug_cfg_backup_dir = CFG.get_temp_dir() + os.sep + "webserver"
    self.remote_webserver_plug_cfg = []
    self.proxy_server_port_info = []
    self.ins_upg = False
    if self.need_map_module:
      self.ear_path = os.path.join(CFG.get_build_dir(),cfg['ear_file_name'])
    return True

  def map_module_to_web_server(self):
    log.info("map application modules to web server...")
    if not self.need_map_module:
      return True
    servers, clusters  = CFG.prepare_scope()
    if len(servers) > 0:
      servers = servers[0]['nodename']+', '+servers[0]['servername']
    else:
      servers = '###SERVER_HAS_NONE###'
    if len(clusters) > 0:
      clusters = clusters[0]
    else:
      clusters = '###CLUSTER_HAS_NONE###'


    args = []
    args.extend([self.ear_path , CFG.get_app_name() , self.local_ihs_server ,servers , clusters])
    self.call_common_task("add_webserver_to_modules_map.py", args)

    return True

  def get_was_variable(self, name):
    log.debug("Getting " + name + "from WebSphere Variable")
    succ, ws_out = self.call_common_task("get_websphere_variable.py", [name])
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

  def do(self):
    if not self.proxy_deployed and not self.need_map_module:
      return True
    log.info("Configuring WebServer for HCL Docs and Conversion...")

    if not CFG.webserver_info or len(CFG.webserver_info)==0:
      log.info("Invalid webserver name %s configuration or No Web Server found in this cell..." % (self.webserver_name))
      return self.msg_for_failure()

    if not self.map_module_to_web_server():
      self.msg_for_failure()

    if CFG.get_restart_webservers():
      self.stop_web_servers()

    if not self.generate_ihs_plug():
      return self.msg_for_failure(True)

    if not self.get_remote_webserver_plug_cfg_dir():
      return self.msg_for_failure(True)

    if not self.register_webserver():
      return self.msg_for_failure(True)

    #if not self.get_remote_webserver_plug_cfg_file():
    #  return self.msg_for_failure(True)

    if not self.get_proxy_server_info():
      return self.msg_for_failure(True)

    if not self.get_docs_server_info():
      return self.msg_for_failure(True)

    if not self.configure_ihs_plug_cfg():
      return self.msg_for_failure(True)

    if not self.propagate_ihs_plug():
      return self.msg_for_failure(True)

    #if not self.transfer_to_remote_node(PLUG_CFG_PROXY):
    #  return self.msg_for_failure(True)

    if CFG.get_restart_webservers():
      self.start_web_servers()

    self.ins_upg = True

    log.info("Successfully Configured WebServer for HCL Docs and Conversion...")

    return True

  def undo(self):
    if not self.proxy_deployed and not self.need_map_module:
      return True
    if self.ins_upg:
      return self.rollback_ihs_plug_cfg()
    else:
      return True

  def do_upgrade(self):
    if not self.proxy_deployed and not self.need_map_module:
      return True
    return self.do()

  def undo_upgrade(self):
    if not self.proxy_deployed and not self.need_map_module:
      return True
    return self.undo()

  def stop_web_servers(self):
    log.info("Starting to stop webservers...")

    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_common_task("stop_webserver.py", args)

    if not succ:
      return False

    log.info("Stopped webservers successfully...")
    return True

  def start_web_servers(self):
    log.info("Starting webservers...")

    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_common_task("start_webserver.py", args)

    if not succ:
      return False

    log.info("Started webservers successfully...")
    return True

  def get_remote_webserver_plug_cfg_dir(self):
    log.info("Getting Configuration Directory for Remote WebServer plugin-cfg.xml...")
    args = []
    args.extend([self.webserver_name])
    succ, ws_out = self.call_common_task("get_webserver_cfg_path.py", args)

    if not succ:
      return False

    remote_webserver_plug_cfg_files = []
    for line in ws_out.split('\n'):
      if line.find('RemoteConfigFilename:') > -1:
        plug_cfg_file = line.replace('RemoteConfigFilename:','').split(',')
        print("plug_cfg_file: ")
        print(plug_cfg_file)
        remote_webserver_plug_cfg_files.append(plug_cfg_file)

    self.remote_webserver_plug_cfg = dict((i[0], dict({'plugincfgpath':i[1],'nodename':i[2],'servername':i[3]})) for i in remote_webserver_plug_cfg_files)
    log.info("Successfully Got Configuration Directory for Remote WebServer plugin-cfg.xml...")

    return True

  def register_webserver(self):
    log.info("Registering Remote WebServer for JobManager...")
    while(not was.verify_job_manager_hosts(CFG.webserver_info)):
      print('Some hosts are not added into job manager as targets, please enter information for them.')
      was.collect_hosts_info("webserver")
      print('\nVerifiying target hosts ...\n')

    log.info("Successfully Registered Remote WebServer for JobManager...")

    return True

  def get_remote_webserver_plug_cfg_file(self):
    log.info("Getting Remote WebServer plugin-cfg.xml...")
    args = []
    webserver_hosts = json.dumps(list(CFG.webserver_info.keys()))
    remote_webserver_cfg_info = json.dumps(self.remote_webserver_plug_cfg)
    args = CFG.get_was_cmd_line()
    args.extend(['-f',  './common_jython/tasks/start_remote_jobs_new.py', 'do',
              webserver_hosts,
              remote_webserver_cfg_info,
              self.plug_cfg_backup_dir,
              PLUG_CFG_ORG,
              PLUG_CFG_FILE,
              CFG.timestamp
              ])
    succ, ws_out = call_wsadmin(args)
    if ws_out.find("jobmanager task complete successfully!") == -1:
      return False
    else:
      for line in ws_out.split('\n'):
        if line.find('Successful WebServer:') > -1 or line.find('Failed WebServer:'):
          log.info(line)

    log.info("Successfully Got Remote WebServer plugin-cfg.xml...")

    return True

  def get_docs_server_info(self):
    if not self.proxy_deployed:
      return True
    log.info("Geting docs server info...")
    args = []
    command_file = "is_app_cluster_name.py"
    args.extend([self.docs_cluster_or_server_name])
    succ, ws_out = self.call_common_task(command_file, args)

    if not succ:
      return False

    result = None
    for line in ws_out.split('\n'):
      if line.find('is_app_cluster_name =') > -1:
        result = eval(line.strip(' \r\n\t').replace('is_app_cluster_name =',''))
        break

    if result[0] == "True":
      self.docs_scope_type = "cluster"
      self.docs_cluster_name = self.docs_cluster_or_server_name
    else:
      self.docs_scope_type = "server"
      self.docs_cluster_name = ''
      args = []
      command_file = "get_node_by_name_and_app.py"
      args.extend([self.docs_cluster_or_server_name,"IBMDocs"])
      succ, ws_out = self.call_common_task(command_file, args)

      if not succ:
        return False

      result = None
      for line in ws_out.split('\n'):
        if line.find('get_node_by_name_and_app =') > -1:
          result = eval(line.strip(' \r\n\t').replace('get_node_by_name_and_app =',''))
          break
      if result[0]:
        (self.docs_server_node,self.docs_server_name)=result[0]
      else:
        return False


    log.info("Successfully got docs server info...")

    return True

  def get_proxy_server_info(self):
    if not self.proxy_deployed:
      return True
    log.info("Geting proxy server and port info...")
    args = []
    command_file = "get_proxyservers.py"
    if self.proxy_scope_type == "server":
      args.extend([self.proxy_server_name,self.proxy_server_node])
      command_file = "get_proxyserver.py"
    else:
      args.extend([self.proxy_cluster_name])
    succ, ws_out = self.call_common_task(command_file, args)

    if not succ:
      return False

    proxy_hosts = None
    for line in ws_out.split('\n'):
      if line.find('proxy_server_port_info =') > -1:
        proxy_hosts = eval(line.strip(' \r\n\t').replace('proxy_server_port_info =',''))
        break

    for i in proxy_hosts:
      self.proxy_server_port_info.append( {'hostname':i[0], 'nodename':i[1], 'servername':i[2], 'PROXY_HTTP_ADDRESS':i[3], 'PROXY_HTTPS_ADDRESS':i[4]} )

    log.info("Successfully got proxy server and port info...")

    return True

  def find_cluster_name_in_ihs_cfg(self,root,cluster_name):
    cluster_name_found = False
    serverClusterTypes = root.getElementsByTagName("ServerCluster")
    for serverClusterType in serverClusterTypes :
      if serverClusterType.getAttribute('Name') == cluster_name:
        cluster_name_found = True
        break
    return cluster_name_found

  def find_cluster_name_by_server_in_ihs_cfg(self,root,server_name):
    cluster_name = ''
    servers = root.getElementsByTagName("Server")
    for server in servers:
      if  server.getAttribute('Name') == server_name:
        serverCluster = server.parentNode
        if serverCluster and serverCluster.tagName == "ServerCluster":
          cluster_name = serverCluster.getAttribute('Name')
          break
    return (cluster_name)

  def configure_ihs_plug_cfg(self):
    log.info("Configuring Webserver Plugin Settings for HCL Docs  and Conversion...")
    for webnode_dir in os.listdir(self.plug_cfg_backup_dir):
      websrv_dirs= os.path.join(self.plug_cfg_backup_dir,webnode_dir)
      for websrv_dir in os.listdir(websrv_dirs):
        org_file = os.path.join(websrv_dirs,websrv_dir,PLUG_CFG_ORG,PLUG_CFG_FILE)
        log.info("Configure server %s , plugin file path is %s", websrv_dir, org_file)
        if os.path.exists(org_file):
          proxy_file_dir = os.path.join(websrv_dirs,websrv_dir,PLUG_CFG_PROXY)
          if not os.path.exists(proxy_file_dir):
            os.makedirs(proxy_file_dir)
          proxy_file =  os.path.join(proxy_file_dir,PLUG_CFG_FILE)
          shutil.copy(org_file,proxy_file)

          if not self.proxy_deployed:
            continue
          #In some locale, there will be a encoding mismatch issue inside generated plugin-cfg.xml
          cfg_xml_doc = None
          try:
            cfg_xml_doc = parse(org_file)
          except ExpatError:
            file_object = open(org_file,'rb')
            all_the_text_new = None
            try:
              all_the_text = file_object.read()
              #solution: replace encoding value in the org_file with 'UTF-8', and change the REAL encoding into UTF-8
              rule = r'xml version="1.0" encoding="[a-zA-Z-_0-9]+"'
              rep = r'xml version="1.0" encoding="UTF-8"'
              all_the_text_new = str(re.sub(rule,rep,all_the_text),'UTF-8')
              print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<in configure_ihs_plug_cfg>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
              print("all_the_text=")
              print(all_the_text)
              print("all_the_text_new=")
              print(all_the_text_new)
            finally:
              file_object.close()
            if all_the_text_new:
              os.remove(org_file)
              org_file_refresh = org_file+'.refresh'
              file_object_write = open(org_file_refresh,'ab')
              try:
                file_object_write.write(all_the_text_new.encode('UTF-8'))
              finally:
                file_object_write.close()
            print("org_file_refresh=")
            print(org_file_refresh)
            cfg_xml_doc = parse(org_file_refresh)
          root = None
          if cfg_xml_doc:
            root = cfg_xml_doc.documentElement

          if not root:
            return False

          docs_proxy_found = False
          replace_route = None

          if self.proxy_scope_type == "server":
            self.proxy_cluster_name = self.find_cluster_name_by_server_in_ihs_cfg(root,self.proxy_server_name)
            if self.proxy_cluster_name != '':
              docs_proxy_found = True
            else:
              self.proxy_cluster_name = 'ODRCluster'
          else:
            docs_proxy_found = self.find_cluster_name_in_ihs_cfg(root,self.proxy_cluster_name)

          if self.docs_scope_type == "server":
            self.docs_cluster_name = self.find_cluster_name_by_server_in_ihs_cfg(root,self.docs_server_node+'_'+self.docs_server_name)
          else:
            docs_found = self.find_cluster_name_in_ihs_cfg(root,self.docs_cluster_name)
            if not docs_found:
              return False
          if self.docs_cluster_name != '':
            routes = root.getElementsByTagName("Route")
            for route in routes:
              if route.getAttribute('ServerCluster') == self.docs_cluster_name:
                replace_route = route
                route.setAttribute('ServerCluster',self.proxy_cluster_name)
                break
          else:
            return False

          if not docs_proxy_found:
            # Create the <ServerCluster> element
            serverClusterType_element = cfg_xml_doc.createElement("ServerCluster")
            serverClusterType_element.setAttribute("Name", self.proxy_cluster_name)
            serverClusterType_element.setAttribute("CloneSeparatorChange", "false")
            serverClusterType_element.setAttribute("LoadBalance", "Round Robin")
            serverClusterType_element.setAttribute("PostSizeLimit", "-1")
            serverClusterType_element.setAttribute("RemoveSpecialHeaders", "true")
            serverClusterType_element.setAttribute("RetryInterval", "60")
            root.appendChild(serverClusterType_element)

            web_hosts = list(self.remote_webserver_plug_cfg.keys())
            ihs_conf_dir = None
            for web_host in web_hosts:
              web_nodename = self.remote_webserver_plug_cfg[web_host]['nodename']
              log.info("Iterate host %s node name %s", web_host, web_nodename)
              if (web_nodename == webnode_dir):
                ihs_conf_dir = self.remote_webserver_plug_cfg[web_host]['plugincfgpath']
                break

            plug_key_kdb_file = ihs_conf_dir.replace(PLUG_CFG_FILE,PLUG_KEY_KDB)
            plug_key_sth_file = ihs_conf_dir.replace(PLUG_CFG_FILE,PLUG_KEY_STH)

            log.info("Webserver %s key file path is %s", websrv_dir, plug_key_kdb_file)
            # Create the <Server> elements
            for proxyServer in self.proxy_server_port_info:
              proxyServer_element = cfg_xml_doc.createElement("Server")
              proxyServer_element.setAttribute("Name", proxyServer['servername'])
              proxyServer_element.setAttribute("ConnectTimeout", "0")
              proxyServer_element.setAttribute("ExtendedHandshake", "false")
              proxyServer_element.setAttribute("MaxConnections", "-1")
              proxyServer_element.setAttribute("WaitForContinue", "false")

              # Create the <Transport> element1
              print("proxyServer['hostname']: ")
              print(proxyServer['hostname'])

              transport1_element = cfg_xml_doc.createElement("Transport")
              transport1_element.setAttribute("Hostname", proxyServer['hostname'])
              transport1_element.setAttribute("Port", proxyServer['PROXY_HTTP_ADDRESS'])
              transport1_element.setAttribute("Protocol", "http")
              proxyServer_element.appendChild(transport1_element)

              # Create the <Transport> element2
              transport2_element = cfg_xml_doc.createElement("Transport")
              transport2_element.setAttribute("Hostname", proxyServer['hostname'])
              transport2_element.setAttribute("Port", proxyServer['PROXY_HTTPS_ADDRESS'])
              transport2_element.setAttribute("Protocol", "https")

              # Create the <Property> element1
              property_element1 = cfg_xml_doc.createElement("Property")
              property_element1.setAttribute("Name", "keyring")
              property_element1.setAttribute("Value", plug_key_kdb_file)
              transport2_element.appendChild(property_element1)

              # Create the <Property> element2
              property_element2 = cfg_xml_doc.createElement("Property")
              property_element2.setAttribute("Name", "stashfile")
              property_element2.setAttribute("Value", plug_key_sth_file)
              transport2_element.appendChild(property_element2)

              proxyServer_element.appendChild(transport2_element)

              serverClusterType_element.appendChild(proxyServer_element)

            # write minidom to XML
          if not docs_proxy_found or replace_route:
            file_object = open(proxy_file, 'w')
            file_object.write(self.to_pretty_xml(cfg_xml_doc).decode('UTF-8'))
            file_object.close()
            self.remove_blank_lines(proxy_file)


    log.info("Successfully Configured Webserver Plugin Settings for HCL Docs  and Conversion...")
    return True

  def generate_ihs_plug(self):
    log.info("Generating Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args = []
    args.extend([self.plug_cfg_backup_dir])
    args.extend([PLUG_CFG_ORG])
    args.extend([PLUG_CFG_FILE])
    args.extend([self.webserver_name])
    succ, ws_out = self.call_common_task("generate_webserver_plugin_cfg.py", args)

    if not succ:
      return False

    log.info("Successfully Generated Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    return True

  def propagate_ihs_plug(self):
    log.info("Propagating Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    args = []
    args.extend([self.plug_cfg_backup_dir])
    args.extend([PLUG_CFG_PROXY])
    args.extend([PLUG_CFG_FILE])
    args.extend([self.webserver_name])
    succ, ws_out = self.call_common_task("propagate_webserver_plugin_cfg.py", args)

    if not succ:
      return False

    log.info("Successfully Propagated Webserver Plugin Settings for %s EAR application..." % (self.app_name))
    return True

  def transfer_to_remote_node(self,subdir):
    log.info("Transfering plugin-cfg.xml to remote WebServer...")
    webserver_hosts = json.dumps(list(CFG.webserver_info.keys()))
    remote_webserver_cfg_info = json.dumps(self.remote_webserver_plug_cfg)
    args = CFG.get_was_cmd_line()
    args.extend(['-f',  './common_jython/tasks/start_remote_jobs_new.py', 'undo',
              webserver_hosts,
              remote_webserver_cfg_info,
              self.plug_cfg_backup_dir,
              subdir,
              PLUG_CFG_FILE,
              CFG.timestamp
              ])
    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False

    if ws_out.find("jobmanager task complete successfully!") == -1:
      return False


    log.info("Successfully Transfered plugin-cfg.xml to remote WebServer...")

    return True

  def rollback_ihs_plug_cfg(self):
    log.info("Rolling back Webserver Plugin Settings...")
    args1 = []
    args1.extend([self.plug_cfg_backup_dir])
    args1.extend([PLUG_CFG_ORG])
    args1.extend([PLUG_CFG_FILE])
    args1.extend([self.webserver_name])
    succ1, ws_out1 = self.call_common_task("undo_webserver_plug_cfg.py", args1)
    if not succ1:
      return False

    if not self.transfer_to_remote_node(PLUG_CFG_ORG):
      return False

    log.info("Successfully Rolled back Webserver Plugin Settings for %s EAR application..." % (self.app_name))

    return True

  def to_pretty_xml(self, node):
    return node.toprettyxml(indent="  ", newl="\n", encoding="UTF-8")

  def remove_blank_lines (self, file_name):
    for line in fileinput.FileInput(file_name, inplace=1):
      if line.strip() == '':
        continue
      print(line.rstrip())

  def msg_for_failure(self,restart_webserver=None):
    log.info("-->IM:WARNING:Failed to automatically configure WebServer for %s EAR application,please refer to the guide and configure it manually after installation..." % (self.app_name))
    if restart_webserver is not None:
      if CFG.get_restart_webservers():
        self.start_web_servers()
    return True
