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
    cell_name_args.extend(["-f",  "./conversion/tasks/get_cell_name.py"])
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