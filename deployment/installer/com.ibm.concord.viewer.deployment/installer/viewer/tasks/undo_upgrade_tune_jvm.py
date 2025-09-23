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



def removeJVMProperty(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]
  settings = args[3:]
 
  
  if scopeType.lower() == "server" :
    jvm = wsadminlib.getServerJvm(arg3,arg4)
    for setting in settings :
      AdminConfig.unsetAttributes(jvm, setting)      
 
  if scopeType.lower() == "cluster" :
     serverList = wsadminlib.listServersInCluster(arg3)
     for setting in settings :
       for serverID in serverList :
         nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
         serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
         jvm = wsadminlib.getServerJvm(nodeName, serverName)
         AdminConfig.unsetAttributes(jvm, setting)
         
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName,value 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK upgrade tuneJVM"
    sys.exit()
  removeJVMProperty(sys.argv)
  
