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

from util import wsadminlib
  
def add_trusted_security(args):
  cell = AdminControl.getCell()
  scope_type = args[0]
  if scope_type.lower() == 'server':
    node,server = args[1:3]
    proxySettings = AdminConfig.getid('/Cell:%s/Node:%s/Server:%s/ProxySettings:/' % (cell,node,server))
  else: #scope_type.lower() == 'cluster':
    cluster = args[1]
    proxySettings = AdminConfig.getid('/Cell:%s/ServerCluster:%s/ProxySettings:/' % (cell,cluster))
  trusted_addrs = AdminConfig.showAttribute(proxySettings,'trustedIntermediaryAddresses')
  webserver_name = args[3]
  
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")  
  webservers_need_trusted = []

  for (web_node_name,web_server_name) in web_nodes_servers:
    web_host_name = wsadminlib.getNodeHostname(web_node_name)
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        webservers_need_trusted.append(web_host_name)
        break
    else:
      webservers_need_trusted.append(web_host_name)
    
  if len(webservers_need_trusted):
    servers = ';'.join(webservers_need_trusted)
    AdminConfig.modify(proxySettings,[['trustedIntermediaryAddresses', servers]])
    wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 4:
    wsadminlib.sop("create_trusted_security:", "Errors for arguments number passed to TASK create_trusted_security.py")
    sys.exit()
  add_trusted_security(sys.argv)
  
