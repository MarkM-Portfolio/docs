# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# *****************************************************************

import os
from common import command, call_wsadmin, CFG, config_log, FileInstall, configfiles
import logging as log
from util import operate_config_file

class RegisterDocsInNews(command.Command):

  def __init__(self):
    docs_server_url = CFG.get_docs_server_url()
    docs_server_trimed_protocol = docs_server_url.split("://", 1)[1]
    array = docs_server_trimed_protocol.split("/", 1)
    self.docs_host_name = array[0]
    self.docs_context_root = array[1]
    
     #get the node list of installed connections
    apps = ['News']
    argsApp = CFG.get_was_cmd_line()
    argsApp.extend(["-f",  "./icext/tasks/get_node_with_app.py"])
    argsApp.extend(apps)
    suc, node_out = call_wsadmin(argsApp)
    print("node_out: " + node_out)
    if not suc:
      raise Exception("Register Docs in news failed because failed to read News nodes name")
   
    node_name_var = "nodename"
    node_name_var = "".join([node_name_var,": "])
    
    news_nodes = self._parse_info(node_name_var,node_out)
       
    self.news_node_name_list = []
    for news_node in news_nodes:      
      #if news_node != 'webserver' or news_node.find("webserver")<:
      if news_node.find("webserver")==-1:
        self.news_node_name_list.append(news_node)
        
    if len(self.news_node_name_list) == 0:
      raise Exception("Register Docs in news failed because there is no News application")    
    
    
  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True
    
  def registerDocs(self, register):
    # extract newsAdmin.py and lotusConnectionsCommonAdmin.py from configuration repository to temp dir
    news_admin_file = os.path.join(CFG.get_temp_dir(), "newsAdmin.py")
    common_admin_file = os.path.join(CFG.get_temp_dir(), "lotusConnectionsCommonAdmin.py")
    operate_config_file.extract("bin_lc_admin/newsAdmin.py", news_admin_file)
    operate_config_file.extract("bin_lc_admin/lotusConnectionsCommonAdmin.py", common_admin_file)
    
    savedPath = os.getcwd()
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  savedPath + "/icext/tasks/" + __name__.split(".")[1]+ ".py"])    
    args.append( self.docs_host_name )
    args.append( self.docs_context_root )
    args.append( str(register) )
    args.append(self.news_node_name_list[0])
    #log.info("serviceNodeNameNews pass in: %s" % self.news_node_name_list[0])
    os.chdir(CFG.get_temp_dir())
    succ, ws_out = call_wsadmin(args)
    os.chdir(savedPath)
    
    if register and not succ:
      raise Exception("Docs is not register correctly.")
    #print ws_out  
    
    return True

  def do(self):
    log.info("Register Docs application in Connections News Started")
    self.registerDocs(True)
    log.info("Register Docs application in Connections News completed")    
    return True    
    
  def undo(self):
    log.info("Start to unregister Docs application in Connections News") 
    self.registerDocs(False)
    return True    

  def do_upgrade(self):
    log.info("Start to upgrade register Docs application in Connections News")
    self.registerDocs(True)
    log.info("Finished to upgrade register Docs application in Connections News")
    return True    
    
  def _parse_info(self,des,des_prt):    
    des_list = []    
    for line in des_prt.split('\n'):      
      if line.find(des) > -1:
        #raise Exception("Didn't get the node name")
        index_start = line.find(des)
        index_end = index_start + len(des)
        des_name = line[index_end : len(line)]
        if des_name.find('\n') >= 0:
          des_name = des_name[0 : des_name.find('\n')]
          
        #log.info("Node name is: %s" % des_name)
        des_list.append(des_name)            
      #endif line.find
    #endfor
    return des_list    