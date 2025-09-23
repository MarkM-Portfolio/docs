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
import socket
from common.utils.jython_script_helper import *
import shutil
 
directory_name_on_dmgr = 'ibmdocs'

def do(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  target_list = eval(argv[1])
  path_info_on_remote = eval(argv[2])
  plug_cfg_bak_dir = argv[3]
  plug_cfg_org_dir = argv[4]
  plug_cfg_file = argv[5]
  
  for host in target_list:
    source_cfg_file_on_webserver = path_info_on_remote[host]['plugincfgpath']
    print("source_cfg_file_on_webserver: ")
    print(source_cfg_file_on_webserver)
    job_token = transfer_file_to_dmgr([host], source_cfg_file_on_webserver, directory_name_on_dmgr)
    cfg_file_on_dmgr = 'temp/JobManager/' + '/'.join( [job_token, host, directory_name_on_dmgr, plug_cfg_file] )
    web_node_name = path_info_on_remote[host]['nodename']
    web_server_name = path_info_on_remote[host]['servername']
    cfg_file_on_local_dir=os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,plug_cfg_org_dir)    
    if not os.path.exists(cfg_file_on_local_dir):
      os.makedirs(cfg_file_on_local_dir)  
    cfg_file_on_local=os.path.join(cfg_file_on_local_dir,plug_cfg_file)
    if AdminConfig.existsDocument(cfg_file_on_dmgr):      
      doc_digest = AdminConfig.extract(cfg_file_on_dmgr,cfg_file_on_local)      
      if doc_digest:
        print("Successful WebServer:"+host+","+web_node_name+","+web_server_name)
      else:
        print("Failed WebServer:"+host+","+web_node_name+","+web_server_name)
    else:
      print("Failed WebServer:"+host+","+web_node_name+","+web_server_name)
  
  print("jobmanager task complete successfully!")

def undo(argv):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  target_list = eval(argv[1])
  path_info_on_remote = eval(argv[2])
  plug_cfg_bak_dir = argv[3]
  plug_cfg_org_dir = argv[4]
  plug_cfg_file = argv[5]  
  dmgrnodename = wsadminlib.getDmgrNodeName()
  dmgr_node_host_name = wsadminlib.getNodeHostname(dmgrnodename)
  
  for host in target_list:    
    web_node_name = path_info_on_remote[host]['nodename']
    web_server_name = path_info_on_remote[host]['servername']
    cfg_file_on_local=os.path.join(plug_cfg_bak_dir,web_node_name,web_server_name,plug_cfg_org_dir,plug_cfg_file)
    cfg_file_on_dmgr_taskmgr = '/'.join( [directory_name_on_dmgr, web_node_name, web_server_name, plug_cfg_file] )
    cfg_file_on_dmgr = 'temp/JobManager/'+cfg_file_on_dmgr_taskmgr
    if AdminConfig.existsDocument(cfg_file_on_dmgr):
      AdminConfig.deleteDocument(cfg_file_on_dmgr)    
    
    AdminConfig.createDocument(cfg_file_on_dmgr,cfg_file_on_local)
        
    #job_token = transfer_file_to_dmgr([me_hostname], cfg_file_on_local, directory_name_on_dmgr)
    #cfg_file_on_dmgr = '/'.join( [job_token, host, directory_name_on_dmgr, plug_cfg_file] )
    #if dmgr_node_host_name!= host:
    #if socket.gethostbyname(host)!= socket.gethostbyname(dmgr_node_host_name):
    dest_cfg_file_on_webserver = path_info_on_remote[host]['plugincfgpath']
    job_status = remove_file_from_node([host],dest_cfg_file_on_webserver)
    job_status = distribute_to_nodes([host], cfg_file_on_dmgr_taskmgr, dest_cfg_file_on_webserver[:-15])
    #else:
    #  cfg_file_on_dmgr = os.path.join(wsadminlib.getWasProfileRoot(dmgrnodename), 'config',cfg_file_on_dmgr)
    #  copy_cmd = None
    #  work_dir = None
    #  if wsadminlib.getNodePlatformOS(dmgrnodename) == 'windows':
    #    cfg_file_on_dmgr = cfg_file_on_dmgr.replace('/','\\')
    #    copy_cmd = '[powershell -executionpolicy RemoteSigned Copy-Item %s %s -Force]' % (cfg_file_on_dmgr,dest_cfg_file_on_webserver)
    #    work_dir = 'C:\\'
    #  else:
    #    copy_cmd = '[cp -f %s %s]' % (cfg_file_on_dmgr,dest_cfg_file_on_webserver)
    #    work_dir = '/opt'
    #  run_script([host], copy_cmd, work_dir)
      
  print("jobmanager task complete successfully!")
  print("target_list='%s'" %  str(target_list).replace("'","\'").replace('"',"\'"))

if __name__ == "__main__":
  import sys
  if sys.argv[0] == "do":
    do(sys.argv)
  elif sys.argv[0] == "undo":
    undo(sys.argv)
    
