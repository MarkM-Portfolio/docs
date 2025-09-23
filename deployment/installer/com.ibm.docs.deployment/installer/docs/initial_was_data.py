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
from common import command, call_wsadmin, CFG
import logging as log
import socket

class InitialWasData(command.Command):
  
  def __init__(self):
    # Get the cell name
    log.info("Start to get cell name...")
    cell_name_args = CFG.get_was_cmd_line()
    cell_name_args.extend(["-f",  "./docs/tasks/get_cell_name.py"])
    cell_name_succ, cell_name_ws_out = call_wsadmin(cell_name_args)
    if not cell_name_succ:
      raise Exception("Failed to get the cell name")
    cell_name_var = "cellname"
    cell_name_var = "".join([cell_name_var,": "])
    
    cell_names = self._parse_info(cell_name_var,cell_name_ws_out)
       
    if len(cell_names) == 0:
      raise Exception("Failed to get the cell name")
    
    CFG.set_cell_name(cell_names[0])  
    log.info("Get cell %s successfully" % CFG.get_cell_name())
    
    log.info("Start to check dmgr node on the host...")
    #whether dmgr host    
    hostname = socket.gethostname()    
    is_dm_args=CFG.get_was_cmd_line()
    is_dm_args.extend(["-f",  "./docs/tasks/is_dmgr_on_host.py"])
    is_dm_args.extend([hostname])
    is_dm_succ, is_dm_ws_out = call_wsadmin(is_dm_args)
    if not is_dm_succ:
      raise Exception("Failed to get node on host")
        
    is_dm_path_var = "IsDMGR"
    is_dm_path_var = "".join([is_dm_path_var,": "])
    dm_nodes = self._parse_info(is_dm_path_var,is_dm_ws_out)
    #dm_node = dm_nodes[0]
    print(dm_nodes)
    if dm_nodes[0] == "True":
      CFG.set_is_dmgr_node_on_host(True)
    elif dm_nodes[0] == "False":
      CFG.set_is_dmgr_node_on_host(False)
    #elif dm_nodes[0] == "None":
    #  raise Exception("Unkown node")
   
    log.info("The host has dmgr node? : %s" % CFG.get_is_dmgr_node_on_host())    
    
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
          
        #log.info("Node name is: %s" % node_name)
        des_list.append(des_name)            
      #endif line.find
    #endfor
    return des_list