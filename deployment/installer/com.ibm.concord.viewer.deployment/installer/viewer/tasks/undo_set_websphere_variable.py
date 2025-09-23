# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-

def set_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  v_name = args[0]
  wsadminlib.removeWebSphereVariable(v_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK start_server_cluster.py"
    sys.exit()
  set_it(sys.argv)
