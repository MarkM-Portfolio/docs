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

def start(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  webserver_name = args[0]
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  started = "False"
  cellname = wsadminlib.getCellName()
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        mBean = AdminControl.queryNames('WebSphere:type=WebServer,*')
        if mBean:
          status = AdminControl.invoke(mBean,'ping','[%s %s %s]' % (cellname,web_node_name,web_server_name),'[java.lang.String java.lang.String java.lang.String]')
          if status == 'STOPPED':#'RUNNING':
            #ret = AdminControl.invoke(mBean,'start','[%s %s %s]' % (cellname,web_node_name,web_server_name),'[java.lang.String java.lang.String java.lang.String]')
            wsadminlib.startWebServer(web_node_name,web_server_name)
            started = "True"
        break    
    else:
      mBean = AdminControl.queryNames('WebSphere:type=WebServer,*')
      if mBean:
        status = AdminControl.invoke(mBean,'ping','[%s %s %s]' % (cellname,web_node_name,web_server_name),'[java.lang.String java.lang.String java.lang.String]')
        if status == 'STOPPED':#'RUNNING':
          #ret = AdminControl.invoke(mBean,'start','[%s %s %s]' % (cellname,web_node_name,web_server_name),'[java.lang.String java.lang.String java.lang.String]')
          wsadminlib.startWebServer(web_node_name,web_server_name)
          started = "True"
    
    if started == "True":
      print "WebServers Started"
    wsadminlib.save()
if __name__ == "__main__":  
  import sys
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  
  start(sys.argv)
