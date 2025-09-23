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



def setDataSourceConnectionsPool(args):
  from util import wsadminlib
 
  wsadminlib.enableDebugMessages()

  #arg3:clustername or nodename; arg4:servername
  datasource_name = args[0]
  settings = args[1:]

  datasource_id = AdminConfig.getid('/DataSource:%s/' % datasource_name)

  cmd_template =  '[[connectionPool [%s]]]'
  property_list = ''

  for setting in settings :
      propertyName,value = setting.split("=",1)
      property_list = property_list + ('[%s %s]' % (propertyName,value))

  cmd = cmd_template % property_list
  AdminConfig.modify(datasource_id,cmd)
  '''
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
         nodeName = wsadminlib.getObjectAttribute(serverID,"nodeName")
         serverName = wsadminlib.getObjectAttribute(serverID,"memberName")
         wsadminlib.setJvmProperty(nodeName,serverName,propertyName,value)
	 #print "Set JVM of %s.%s : %s = %s" % (nodeName,serverName,propertyName,value)
  '''
  wsadminlib.save()


if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName,propertyName,value 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK setDataSourceConnectionsPool"
    sys.exit()
  setDataSourceConnectionsPool(sys.argv)
  

