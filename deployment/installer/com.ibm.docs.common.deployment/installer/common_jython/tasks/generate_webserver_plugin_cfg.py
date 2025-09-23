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

def generate_webplugin_settings(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  plug_cfg_bak_dir,new_dir,cfg_file,webserver_name = args
  
  cellname = wsadminlib.getCellName()
  m = "generatePluginCfg:"
  plgGen = AdminControl.queryNames('type=PluginCfgGenerator,*')  
  nodename = wsadminlib.getDmgrNodeName()
  configDir = os.path.join(wsadminlib.getWasProfileRoot(nodename), 'config')
  prefix = "\""
  #if wsadminlib.getNodePlatformOS(nodename) == 'windows':
  #  configDir = configDir.replace('/','\\')
  #elif wsadminlib.getNodePlatformOS(nodename) == 'linux':
  #  configDir = configDir.replace('\\','/')
  configDir = configDir.replace("\\",'/')
  if configDir.find(' ') != -1:
    configDir = prefix + configDir + prefix
  
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")  
  for (web_node_name,web_server_name) in web_nodes_servers:    
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        AdminControl.invoke(plgGen, 'generate', '[%s %s %s %s false]' % (
                       configDir, cellname, web_node_name, web_server_name),
                       '[java.lang.String java.lang.String java.lang.String java.lang.String java.lang.Boolean]')
        #check out new generated webserver plugin-cfg.xml
        config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file
        config_file = config_file.replace("\\",'/')    
        if AdminConfig.existsDocument(config_file):    
          new_bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,new_dir)
          new_bak_dir = new_bak_dir.replace("\\",'/')
          if not os.path.exists(new_bak_dir):
            os.makedirs(new_bak_dir)
          new_dest_file = os.path.join(new_bak_dir,cfg_file) 
          new_dest_file = new_dest_file.replace("\\",'/')         
          new_doc_digest = AdminConfig.extract(config_file,new_dest_file)
        break
    else:          
      AdminControl.invoke(plgGen, 'generate', '[%s %s %s %s false]' % (
                       configDir, cellname, web_node_name, web_server_name),
                       '[java.lang.String java.lang.String java.lang.String java.lang.String java.lang.Boolean]')
      #check out new generated webserver plugin-cfg.xml
      config_file = "cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file 
      config_file = config_file.replace("\\",'/')   
      if AdminConfig.existsDocument(config_file):    
        new_bak_dir = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,new_dir)
        new_bak_dir = new_bak_dir.replace("\\",'/')
        if not os.path.exists(new_bak_dir):
          os.makedirs(new_bak_dir)
        new_dest_file = os.path.join(new_bak_dir,cfg_file) 
        new_dest_file = new_dest_file.replace("\\",'/')         
        new_doc_digest = AdminConfig.extract(config_file,new_dest_file)          
    
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
  
  generate_webplugin_settings(sys.argv)