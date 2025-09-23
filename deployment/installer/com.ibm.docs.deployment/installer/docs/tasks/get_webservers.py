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
import subprocess
import os


def get(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()  
  web_nodes_servers = wsadminlib.listServersOfType("WEB_SERVER")  
  for (web_node_name,web_server_name) in web_nodes_servers:
    print "web_node_name:"+web_node_name+" "+"web_server_name:"+web_server_name    
  
  #wsadminlib.save()

if __name__ == "__main__":  
  import sys
  """
    #  none parameters     
  """ 
  get(sys.argv)