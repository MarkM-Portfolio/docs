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


def map2webserver(args):
  from util import wsadminlib
  from common.utils import jython_common
  wsadminlib.enableDebugMessages()
  ear_name,app_name,scope_name,arg4,arg5,webserver_name = args[0:6]  
  servers = []
  clusters = []  
  if scope_name.lower() == "server":
    server={}
    server["servername"] = arg4
    server["nodename"] = arg5
    servers.append(server)
  if scope_name.lower() == "cluster":
    clusters.append(arg4)
  
  jython_common.mapModulesToWebServer(ear_name,app_name,servers,clusters,webserver_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, app_name, 
  """
  if len(sys.argv) < 6:
    print ">>> Errors for arguments number passed to TASK map2webserver"
    sys.exit()
  map2webserver(sys.argv)

