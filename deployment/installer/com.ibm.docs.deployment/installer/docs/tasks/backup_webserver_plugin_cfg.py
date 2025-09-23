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

def backup_webplugin_settings(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  plug_cfg_bak_dir,bak_dir,cfg_file,webserver_name = args
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  cellname = wsadminlib.getCellName()
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        #backup the original plugin-cfg.xml for given webserver
        org_bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,bak_dir)          
        if not os.path.exists(org_bak_dir):
          os.makedirs(org_bak_dir)
        config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file
        if AdminConfig.existsDocument(config_file):
          org_dest_file = os.path.join(org_bak_dir,cfg_file)
          org_doc_digest = AdminConfig.extract(config_file,org_dest_file)      
        break
    else:
      #backup the original plugin-cfg.xml for all webservers
      org_bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,bak_dir)
      if not os.path.exists(org_bak_dir):
        os.makedirs(org_bak_dir)
      config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file
      if AdminConfig.existsDocument(config_file):
        org_dest_file = os.path.join(org_bak_dir,cfg_file)
        org_doc_digest = AdminConfig.extract(config_file,org_dest_file)
  
  #wsadminlib.save()

if __name__ == "__main__":  
  import sys
  """
    #  required parameters
    #  backup dir, 
  """
  if len(sys.argv) < 4:
    print "Exception: invalid arguments"
    sys.exit()
  
  backup_webplugin_settings(sys.argv)