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

from util import wsadminlib

def tuneProxySettings(scopeType, arg3, arg4, workloadManagementPolicy): 
  wsadminlib.enableDebugMessages()
  #arg3:clustername or nodename; arg4:servername
    
  scopeId = ""
  if scopeType.lower() == "server" :
    scopeId = "".join(["/Node:", arg3, "/Server:", arg4, "/ProxySettings:/"])

  if scopeType.lower() == "cluster" :
    scopeId = "".join(["/ServerCluster:", arg3, "/ProxySettings:/"])	
  
  print("tuneProxySettings : scopeId: ")
  print(scopeId)
  
  proxySettings = AdminConfig.getid(scopeId)
  
  print("tuneProxySettings : proxySettings: ")
  print(proxySettings)
  
  AdminConfig.modify(proxySettings, [['enableCaching', 'false']])
  
  workloadPolicyAttribute = [['availabilityMonitorTimeout', workloadManagementPolicy]]
  workloadPolicy = AdminConfig.showAttribute(proxySettings, "workloadManagementPolicy")
  
  print("tuneProxySettings : workloadPolicy: ")
  print(workloadPolicy)
  
  if workloadPolicy is None:
    AdminConfig.create('WorkloadManagementPolicy', proxySettings, workloadPolicyAttribute)
  else:
    AdminConfig.modify(workloadPolicy, workloadPolicyAttribute)
	
  wsadminlib.save()

def tuneJVM(scopeType, arg3, arg4, settings): 
  wsadminlib.enableDebugMessages()
  #arg3:clustername or nodename; arg4:servername  
  settings = settings.split(';')
  if scopeType.lower() == "server" :
    for setting in settings :
      propertyName,value = setting.split("=",1)
      wsadminlib.setJvmProperty(arg3,arg4,propertyName,value)
      #print "Set JVM of %s.%s : %s = %s" % (arg3,arg4,propertyName,value)
 
  if scopeType.lower() == "cluster" :
    serverList = wsadminlib.listServersInCluster(arg3)
    for setting in settings :
      propertyName,value = setting.split("=",1)   
      for serverID in serverList :
        nodeName = wsadminlib.getObjectAttribute(serverID, "nodeName")
        serverName = wsadminlib.getObjectAttribute(serverID, "memberName")
        wsadminlib.setJvmProperty(nodeName,serverName,propertyName,value)
  #print "Set JVM of %s.%s : %s = %s" % (nodeName,serverName,propertyName,value)
  
  wsadminlib.save()
 
def tuneThreadPool(scopeType, arg3, arg4, settings): 
  wsadminlib.enableDebugMessages()
  #arg3:clustername or nodename; arg4:servername  
  
  settings = settings.split(',')
  if scopeType.lower() == "server" :
    for setting in settings :
      poolName, propertyScope = setting.split(":",1)
      propertyName,value = propertyScope.split("=",1)
      scopeId = "".join(["/Node:", arg3, "/Server:", arg4, "/"])		 
      pools = AdminConfig.list("ThreadPool", AdminConfig.getid(scopeId)).split()
      poolId = ""
      for pool in pools :
        if pool.find(poolName) >= 0:
          poolId = pool
          break
      AdminConfig.modify(poolId, [[propertyName, value]])
      #print "Set thread pool of %s.%s : %s = %s" % (nodeName,serverName,propertyName,value)

  if scopeType.lower() == "cluster" :
    serverList = wsadminlib.listServersInCluster(arg3)
    for setting in settings :
      poolName, propertyScope = setting.split(":",1)
       
      print("tuneThreadPool : poolName: ")
      print(poolName)
       
      propertyName,value = propertyScope.split("=",1)   
      for serverID in serverList :
        nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
        serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
        scopeId = "".join(["/Node:", nodeName, "/Server:", serverName, "/"])
         
        print("tuneThreadPool : scopeId: ")
        print(scopeId)
         
        pools = AdminConfig.list("ThreadPool", AdminConfig.getid(scopeId)).split()
        poolId = ""
        for pool in pools :
          if pool.find(poolName) >= 0:
            poolId = pool
            break
	 
        print("tuneThreadPool : poolId: ")
        print(poolId)
     
        AdminConfig.modify(poolId, [[propertyName, value]])
        #print "Set thread pool of %s.%s : %s = %s" % (nodeName,serverName,propertyName,value)
  
  wsadminlib.save()

def tuneProxy(args):
  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]
  workloadManagementPolicy = args[3]
  tuneProxySettings(scopeType, arg3, arg4, workloadManagementPolicy)
  jvmProperties = args[4]
  tuneJVM(scopeType, arg3, arg4, jvmProperties)
  threadPoolProperties = args[5]
  tuneThreadPool(scopeType, arg3, arg4, threadPoolProperties)
  

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 6:
    wsadminlib.sop("create_proxy_tuning:", "Errors for arguments number passed to TASK create_proxy_tuning.py")
    sys.exit()
  tuneProxy(sys.argv)
  
