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



def getJVMProperty(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]
  settings = args[3:]
  
  result = {}
  
  if scopeType.lower() == "server" :
    for setting in settings :
      args = []
      args.extend(['-serverName', arg4])
      args.extend(['-nodeName', arg3])
      args.extend(['-propertyName', setting])
      value = AdminTask.showJVMProperties(args)
      result[setting] = value
 
  if scopeType.lower() == "cluster" :
     serverList = wsadminlib.listServersInCluster(arg3)
     for setting in settings :
       for serverID in serverList :
         nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
         serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
         args = []
         args.extend(['-serverName', serverName])
         args.extend(['-nodeName', nodeName])
         args.extend(['-propertyName', setting])
         value = AdminTask.showJVMProperties(args)
         result[setting] = value      
         break
  print 'jvm_settings:' , result


if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName,value 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK tuneJVM"
    sys.exit()
  getJVMProperty(sys.argv)
  
