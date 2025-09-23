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


def mapModulesToWebServer(app,appName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  print "mapModulesToWebServer"
  
  web_server_list = AdminConfig.list("WebServer")
  if not web_server_list:
    return
    
  web_server = AdminConfig.showAttribute(web_server_list, "name")
  #web_server = AdminConfig.showAttribute(AdminConfig.list("WebServer"), "name")
  web_server_id = AdminConfig.getid("/Server:"+web_server)
  web_node = web_server_id.split("/")[3]
  web_cell = web_server_id.split("/")[1]
  web_target = "WebSphere:cell="+web_cell+",node="+web_node+",server="+web_server
  print web_target

  results = AdminApp.taskInfo(app, "MapModulesToServers")
  lines = results.split("\n")
  module_num =-1
  prefix = "\""

  module_name=[]
  url_name=[]
  for line in lines:
    line_list = line.split(":" )
    items = line_list[0]
    if (items == "Module"):
      module_num = module_num+1
      module_name_tmp = prefix+line_list[1]+prefix
      module_name.append(module_name_tmp)
      print module_name
    #endIf
    if (items == "URI"):
      url_name.append(line_list[1])
      print url_name
    #endIf
  #endFor

  module_ret = AdminApp.listModules(appName, "-server" )
  module_num = 0
  mod = ""
  #print modiule_ret
  module_list = wsadminlib._splitlines(module_ret)
  
  target=[]
  modu=[]
  for module in module_list:
    target_tmp = module.split("#")[2] + "+" + web_target
    target.append(target_tmp)
    print target[module_num]
    modu_tmp = module_name[module_num] + " " + url_name[module_num] + " " + target[module_num]
    print "modu_tmp"
    print modu_tmp
    modu = "[" + modu_tmp + "]"
    mod = mod+modu
    print "mod"
    print mod
    module_num = module_num+1
  #endFor

  mod = "[" + mod + "]"
  print mod
  map_options=[]
  map_options_tmp="-MapModulesToServers" + " " + mod
  print map_options_tmp
  map_options.append(map_options_tmp)
  print map_options

  print "start mapping modules to target servers"
  AdminApp.edit(appName, map_options)
  # regenerate plugin.xml for context root
  # wsadminlib.generatePluginCfg(web_server, web_node)
  wsadminlib.save()
#endDef
