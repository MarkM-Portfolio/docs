# *****************************************************************
#
# HCL Confidential
#
# HCL Docs Source Materials
#
# Copyright HCL Technologies Limited 2012, 2022
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

# -*- encoding: utf8 -*-

def mapModulesToWebServer(app,appName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  print("mapModulesToWebServer")
  
  web_server_list = AdminConfig.list("WebServer")
  if not web_server_list:
    return
    
  web_server = AdminConfig.showAttribute(web_server_list, "name")
  web_server_id = AdminConfig.getid("/Server:"+web_server)
  web_node = web_server_id.split("/")[3]
  web_cell = web_server_id.split("/")[1]
  web_target = "WebSphere:cell="+web_cell+",node="+web_node+",server="+web_server
  print(web_target)

  results = AdminApp.taskInfo(app, "MapModulesToServers")
  print(">> results:  " + str(results))
  lines = results.split("\n")
  print(">> lines:  " + str(lines))
  module_num =-1
  prefix = "\""

  module_name=[]
  url_name=[]
  for line in lines:
    line_list = line.split(":" )
    items = line_list[0].strip().upper()
    print(">>> items:"+ items)
    if (items == "MODULE"):
      module_num = module_num+1
      module_name_tmp = prefix+line_list[1].strip()+prefix
      module_name.append(module_name_tmp)
      print("module: " + str(module_name))
    #endIf
    if (items == "URI"):
      url_name.append(line_list[1].strip())
      print("uri: " + str(url_name))
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
    target.append(target_tmp.strip())
    print(target[module_num])
    modu_tmp = module_name[module_num] + " " + url_name[module_num] + " " + target[module_num]
    print("modu_tmp")
    print(modu_tmp)
    modu = "[" + modu_tmp + "]"
    mod = mod+modu
    print("mod")
    print(mod)
    module_num = module_num+1
  #endFor

  mod = "[" + mod + "]"
  print(mod)
  map_options=[]
  map_options_tmp="-MapModulesToServers" + " " + mod
  print(map_options_tmp)
  map_options.append(map_options_tmp)
  print(map_options)

  print("start mapping modules to target servers")
  AdminApp.edit(appName, map_options)
  # regenerate plugin.xml for context root
  # wsadminlib.generatePluginCfg(web_server, web_node)
  wsadminlib.save()
#endDef
