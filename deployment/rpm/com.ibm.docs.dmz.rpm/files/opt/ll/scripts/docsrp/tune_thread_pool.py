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

import wsadminlib


def tuneThreadPool(args): 
  wsadminlib.enableDebugMessages()
   
  nodeName, serverName = args[0:2]
  settings = args[2:]  
  
  for setting in settings :
    poolName, propertyScope= setting.split(":",1)
    propertyName,value = propertyScope.split("=",1)
    scopeId = "".join(["/Node:", nodeName, "/Server:", serverName, "/"])		 
    pools = AdminConfig.list("ThreadPool", AdminConfig.getid(scopeId)).split()
    poolId = ""
    for pool in pools :
      if pool.find(poolName) >= 0:
        poolId = pool
        break
    AdminConfig.modify(poolId, [[propertyName, value]]) 
  
  wsadminlib.save()
  
if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName=value 
  """
  if len(sys.argv) < 3:
    print ">>> Errors for arguments number passed to TASK tuneThreadPool"
    sys.exit()
  tuneThreadPool(sys.argv)
