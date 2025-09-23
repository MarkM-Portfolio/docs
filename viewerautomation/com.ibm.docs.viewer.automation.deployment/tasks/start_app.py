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

def start_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  app_name = args[0]
  node_name = args[1]
  process_name = args[2]
  wsadminlib.startApplicationOnServer(app_name, node_name, process_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name
    #  IBMConversion
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK start_app.py"
    sys.exit()
  start_it(sys.argv)
