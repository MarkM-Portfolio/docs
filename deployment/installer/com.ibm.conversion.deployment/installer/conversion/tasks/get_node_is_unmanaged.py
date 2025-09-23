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


def is_unmanaged(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  node_name = sys.argv[0]
  unmanaged = wsadminlib.nodeIsUnmanaged(node_name)
  
  if unmanaged:
    print "result:True"
  else:
    print "result:False"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodename 
  """
  if len(sys.argv) < 1:
    sys.exit()
    
  is_unmanaged(sys.argv)
