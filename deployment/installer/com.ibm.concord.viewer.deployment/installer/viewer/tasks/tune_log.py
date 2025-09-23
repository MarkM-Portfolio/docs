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

def tuneLOG(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  scopeType,arg3,arg4 = args[0:3]
  
  try:
    isVnInst = os.getenv('VIEWERNEXT_INSTALL')
  except:
    isVnInst = 'false'
  logfiles = 10
  if isVnInst == 'true':
    logfiles = 60

  sysOut = '${SERVER_LOG_ROOT}/SystemOut.log'
  sysErr = '${SERVER_LOG_ROOT}/SystemErr.log'
  if scopeType.lower() == "server" :
     print 'Tune LOG task on node: ' + arg3 + ' server: ' + arg4
     wsadminlib.setServerSysout(arg3,arg4,sysOut,10,logfiles)
     wsadminlib.setServerSyserr(arg3,arg4,sysErr,10,10)
  
  if scopeType.lower() == "cluster" :
     serverList = wsadminlib.listServersInCluster(arg3)
     for serverID in serverList :
       nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
       serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
       print 'Tune LOG task on node: ' + nodeName + ' server: ' + serverName
       wsadminlib.setServerSysout(nodeName,serverName,sysOut,10,logfiles)
       wsadminlib.setServerSyserr(nodeName,serverName,sysErr,10,10)
  
  wsadminlib.save()


if __name__ == "__main__":
  import sys, os
  
  try:
    import javaos
    if javaos._osType == 'posix' and \
            java.lang.System.getProperty('os.name').startswith('Windows'):
        sys.registry.setProperty('python.os', 'nt')
        reload(javaos)
  except:
    pass
  
  """
    #  required parameters
    #  nodeName,serverName
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK tuneLOG"
    sys.exit()
  print "start TASK tuneLOG..."
  tuneLOG(sys.argv)
  
