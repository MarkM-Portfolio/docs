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

def propagate_webplugin_settings(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  plug_cfg_bak_dir,merg_dir,cfg_file,webserver_name = args
    
  cellname = wsadminlib.getCellName()
  m = "generatePluginCfg:"        
  plgGen = AdminControl.queryNames('type=PluginCfgGenerator,*')  
  nodename = wsadminlib.getDmgrNodeName()
  configDir = os.path.join(wsadminlib.getWasProfileRoot(nodename), 'config')
  if wsadminlib.getNodePlatformOS(nodename) == 'windows':
    configDir = configDir.replace('/','\\')
  elif wsadminlib.getNodePlatformOS(nodename) == 'linux':
    configDir = configDir.replace('\\','/')
  
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")
  for (web_node_name,web_server_name) in web_nodes_servers:
    if webserver_name!="all_webservers":
      if webserver_name == web_server_name:
        merg_file = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,merg_dir,cfg_file)
        if os.path.exists(merg_file):
          config_file = "/cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file      
          if AdminConfig.existsDocument(config_file):
            AdminConfig.deleteDocument(config_file)
            AdminConfig.createDocument(config_file,merg_file)
        
            AdminControl.invoke(plgGen, 'propagate', '[%s %s %s %s]' % (
                       configDir, cellname, web_node_name, web_server_name),
                       '[java.lang.String java.lang.String java.lang.String java.lang.String]')
        break    
    else:
      merg_file = os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,merg_dir,cfg_file)
      if os.path.exists(merg_file):
        config_file = "/cells/"+cellname+"/nodes/"+web_node_name+"/servers/"+web_server_name+"/"+cfg_file      
        if AdminConfig.existsDocument(config_file):
          AdminConfig.deleteDocument(config_file)
          AdminConfig.createDocument(config_file,merg_file)
        
          AdminControl.invoke(plgGen, 'propagate', '[%s %s %s %s]' % (
                       configDir, cellname, web_node_name, web_server_name),
                       '[java.lang.String java.lang.String java.lang.String java.lang.String]')
    
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
  
  propagate_webplugin_settings(sys.argv)