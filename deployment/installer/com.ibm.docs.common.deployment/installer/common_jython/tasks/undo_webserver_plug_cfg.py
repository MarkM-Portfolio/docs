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

def undo_webserver_plug_cfg(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  plug_cfg_bak_dir,bak_d,cfg_file,webserver_name = args
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  cellname = wsadminlib.getCellName()
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,bak_d)
        if os.path.exists(bak_dir):    
          config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file
          if AdminConfig.existsDocument(config_file):
            AdminConfig.deleteDocument(config_file)    
        dest_file = os.path.join(bak_dir,cfg_file)
        AdminConfig.createDocument(config_file,dest_file)
        break
    else:
      bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,bak_d)
      if os.path.exists(bak_dir):    
        config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file
        if AdminConfig.existsDocument(config_file):
          AdminConfig.deleteDocument(config_file)    
      dest_file = os.path.join(bak_dir,cfg_file)
      AdminConfig.createDocument(config_file,dest_file)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  backup dir, 
  """
  if len(sys.argv) < 4:
    print "Exception: invalid arguments"
    sys.exit()
  undo_webserver_plug_cfg(sys.argv)
