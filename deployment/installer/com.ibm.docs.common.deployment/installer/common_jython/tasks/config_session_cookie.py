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

def config_session_cookie(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  node_name = sys.argv[0]
  server_name = sys.argv[1]
  server = wsadminlib.getServerByNodeAndName(node_name, server_name)
  AdminConfig.modify(AdminConfig.list('Cookie', server).splitlines()[0], [['secure', 'true']])

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  config_session_cookie(sys.argv)
