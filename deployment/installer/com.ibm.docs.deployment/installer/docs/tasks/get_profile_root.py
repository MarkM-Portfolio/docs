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


def get_profile_root(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  node_name = sys.argv[0]
  profile_root = wsadminlib.getWasProfileRoot(node_name)
  
  print "profile root:" + profile_root

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodename 
  """
  if len(sys.argv) < 1:
    sys.exit()
    
  get_profile_root(sys.argv)
