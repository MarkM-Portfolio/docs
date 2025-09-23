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

def get(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  webserver_name = args[0]
  cfg_info = []
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  cellname = wsadminlib.getCellName()
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        websrv_id= wsadminlib.getServerByNodeAndName(web_node_name,web_server_name)    
        pluginProperties=AdminConfig.list('PluginProperties', websrv_id)
        cfg_path = AdminConfig.showAttribute(pluginProperties,"RemoteConfigFilename")
        node_host_name = wsadminlib.getNodeHostname(web_node_name)
        print "RemoteConfigFilename:"+node_host_name+","+cfg_path+","+web_node_name+","+web_server_name
        break
    else:
      websrv_id= wsadminlib.getServerByNodeAndName(web_node_name,web_server_name)
      pluginProperties=AdminConfig.list('PluginProperties', websrv_id)
      cfg_path = AdminConfig.showAttribute(pluginProperties,"RemoteConfigFilename")
      node_host_name = wsadminlib.getNodeHostname(web_node_name)
      print "RemoteConfigFilename:"+node_host_name+","+cfg_path+","+web_node_name+","+web_server_name
  
  #wsadminlib.save()

if __name__ == "__main__":  
  import sys
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  
  get(sys.argv)