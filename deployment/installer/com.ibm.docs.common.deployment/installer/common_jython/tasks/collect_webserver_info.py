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
import os
def do(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  cellName = AdminControl.getCell()  
  # get webserver list
  hosts = []
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  for (web_node_name,web_server_name) in web_nodes_servers:
    node_host_name = wsadminlib.getNodeHostname(web_node_name)
    hosts.append( (node_host_name, web_server_name,web_node_name) )
  print "webserver_hosts =",hosts 
  print "WebServer information collected successfully!"
if __name__ == "__main__":
  '''
  #none parameter
  '''
  do(sys.argv)
