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

def addWebServerToModulesMap(ear_name,app_name,webserver_name,servers,clusters):
  from common_jython.utils import wsadminlib
  wsadminlib.enableDebugMessages()   
  cellname = wsadminlib.getCellName()
  
  
  clus_srv_targets = []
  if servers != '###SERVER_HAS_NONE###' and len(servers) > 2 and servers.find(', '):
    servers = servers.split(", ")
    clus_srv_targets.append("WebSphere:cell=%s,node=%s,server=%s" % (cellname, servers[0], servers[1]))
  if len(clusters) > 0 and clusters != '###CLUSTER_HAS_NONE###':
    clus_srv_targets.append("WebSphere:cell=%s,cluster=%s" % (cellname,clusters))
    
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  if not web_nodes_servers:
    print "Web Server should be installed first."
    return
    
  content = AdminApp.listModules(app_name)
  if content.find('\r\n') != -1:
    modules = content.split('\r\n')
  else:
    modules = content.split('\n')
  
  modules_list = []
  for m in modules:
    module = {}
    module['Module'] = None
    module['Server'] = None
    module['URI'] = m.split('#')[1].replace('+',',')
    modules_list.append(module)

  results = AdminApp.taskInfo(ear_name, "MapModulesToServers")

  prefix = "\""
  inWindows = 0
  if results.find('\r\n') != -1:
    inWindows = 1
  else:
    inWindows = 0

  if inWindows:
    if results.find('\n\n') != -1:
      results = results.split('\n\n')[1]
      
    groups = results.split("\r\n\r\n")
  else:
    groups = results.split("\n\n")
    
  for module in modules_list:
    for group in groups:
      need_break = 0
      if group.find(module['URI']) == -1:
        continue
        
      lines = []
      if inWindows:
        lines = group.split("\r\n")
      else:
        lines = group.split("\n")
      line_count = len(lines)
      if line_count < 3:
        continue
      for i in range(1,line_count-1):
        line = lines[i]
        if len(line) > 3 and line.find(': ') != -1 and line.find(module['URI']) != -1:#now we find the URI item
          need_break = 1
          module_line = lines[i-1].split(': ')[1].strip()
          if module_line.find(' ') != -1:
            module_line = prefix + module_line + prefix
          module['Module'] = module_line
          break
      if need_break:
        break;
      
  web_url = ""  
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        web_url = web_url + "+" + "WebSphere:cell=%s,node=%s,server=%s" % (cellname, web_node_name, web_server_name)
        break
    else:
      web_url = web_url + "+" + "WebSphere:cell=%s,node=%s,server=%s" % (cellname, web_node_name, web_server_name)
  MODULES_SET = ""
  for module in modules_list:
    module['Server'] = clus_srv_targets[0] + web_url
    if module['Module'] and module['URI']:
      MODULES_SET = MODULES_SET + '[ ' + module['Module'] + ' ' + module['URI'] + ' ' + module['Server'] + ' ]'
    
  MODULES_SET = '[' + MODULES_SET + ']'
  mod_map_url = "[ -MapModulesToServers" + " " + MODULES_SET + "]"
  AdminApp.edit(app_name, mod_map_url)
  wsadminlib.save()

def mapModulesToWebServer(app,appName,servers,clusters,webserver_name):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()   
  cellname = wsadminlib.getCellName()
  clus_srv_targets = []
  for server in servers:
    clus_srv_targets.append("WebSphere:cell=%s,node=%s,server=%s" % (cellname, server['nodename'], server['servername']))
  for clustername in clusters:
    clus_srv_targets.append("WebSphere:cell=%s,cluster=%s" % (cellname,clustername))
  
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  if not web_nodes_servers:
    print "Web Server should be installed first."
    return

  results = AdminApp.taskInfo(app, "MapModulesToServers")
  lines = results.split("\n")
  module_num = 0
  prefix = "\""

  module_names=[]
  url_names=[]
  for line in lines:
    line_list = line.split(":" )
    items = line_list[0]
    if (items == "Module"):
      module_num = module_num + 1      
      module_name_tmp = line_list[1].strip()
      
      space_check = module_name_tmp.split(" ")
      
      if len(space_check) > 1:
      	module_name_tmp = prefix + module_name_tmp + prefix
      module_names.append(module_name_tmp)
    #endIf
    if (items == "URI"):
      url_names.append(line_list[1].strip())
    #endIf
  #endFor
 
  mod_map = ""
  nIndex = 0;
  while nIndex < module_num:
    mod_map = mod_map + "[ " + module_names[nIndex] + " " + url_names[nIndex] + " " + clus_srv_targets[0]
    web_url = ""
    for (web_node_name,web_server_name) in web_nodes_servers:
      if webserver_name!="all_webservers":
        if webserver_name == web_server_name:
          web_url = web_url + "+" + "WebSphere:cell=%s,node=%s,server=%s" % (cellname, web_node_name, web_server_name)
          break
      else:
        web_url = web_url + "+" + "WebSphere:cell=%s,node=%s,server=%s" % (cellname, web_node_name, web_server_name)
    
    mod_map = mod_map + web_url + " ]"
    nIndex = nIndex + 1
  
  if mod_map:
    mod_map_url = "[ " + "-MapModulesToServers" + " " + "[" + mod_map + "]]"
    print "start mapping modules to target servers"
    AdminApp.edit(appName, mod_map_url)
    # regenerate plugin.xml for context root
    # wsadminlib.generatePluginCfg(web_server, web_node)
    wsadminlib.save()
  #endif mod_map

#endDef