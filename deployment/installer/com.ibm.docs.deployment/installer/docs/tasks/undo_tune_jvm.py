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


def undo_tuneJVM(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]
  settings = args[3:] 
  
  if scopeType.lower() == "server" :
    jvmID = wsadminlib.getServerJvm(arg3,arg4)
    for setting in settings :
      propertyName = setting.split("=",1)[0]
      AdminConfig.unsetAttributes(jvmID,propertyName)
 
  if scopeType.lower() == "cluster" :
     serverList = wsadminlib.listServersInCluster(arg3)
     for setting in settings :
       propertyName = setting.split("=",1)[0]   
       for serverID in serverList :
         nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
         serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
	 jvmID = wsadminlib.getServerJvm(nodeName,serverName)
         AdminConfig.unsetAttributes(jvmID,propertyName)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName,value 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK tuneJVM"
    sys.exit()
  undo_tuneJVM(sys.argv)
  

