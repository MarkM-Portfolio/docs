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
import os

def save_config_json(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  src = args[0]
  print src
  cellName = wsadminlib.getCellName()
  dest = os.path.join("cells", cellName)
  for e in args[1:]:
    dest = os.path.join(dest, e)
  dest = dest.replace("\\", "/")
  print dest
    
  # do another extract here for retrieving the digest parameter for checkin
  temp_local_file = src + ".tmp"
  obj = AdminConfig.extract(dest, temp_local_file)
  
  AdminConfig.checkin(dest, src, obj)
  os.remove(temp_local_file)
  wsadminlib.save()
  print src, "has been checked into", dest, "successfully"
  
if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  save_config_json(sys.argv)
