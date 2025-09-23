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
import os, sys
import logging as log
from common import command, CFG, call_wsadmin, product_script_directory

class CollectWebserverInfo(command.Command):
  
  def __init__(self):
    pass

  def do(self):
    log.info("Starting to collect WebServer informations...")
    args = CFG.get_was_cmd_line()
    args.extend(["-f", './common_jython/tasks/collect_webserver_info.py'])
    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False

    hosts = []
    for line in ws_out.split('\n'):
      if line.find('webserver_hosts =') > -1:        
        hosts = eval(line.strip(' \r\n\t').replace('webserver_hosts =',''))        
        break
    
    webserver_hosts = []
    for i in hosts:
      if CFG.get_webserver_name()!="" and CFG.get_webserver_name()!="all_webservers":
        if CFG.get_webserver_name() == i[1]:
          webserver_hosts.append( {'hostname':i[0], 'web_server_name':i[1], 'web_node_name':i[2]} )
          break
      else:        
        webserver_hosts.append( {'hostname':i[0], 'web_server_name':i[1], 'web_node_name':i[2]} )
    
    CFG.webserver_info = dict((i['hostname'], dict({'servername':i['web_server_name'],'nodename':i['web_node_name']})) for i in webserver_hosts)
    log.info("Successfully collected WebServer informations...")
    return True
    
  def undo(self):
    log.info("Start to clear WebServer informations from cache...")
    CFG.webserver_info = None
    log.info("Successfully cleared WebServer informations from cache...")  
    return True

  def do_upgrade(self):
    return self.do()

  def undo_upgrade(self):    
    return self.undo()