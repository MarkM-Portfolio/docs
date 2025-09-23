# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# OCO Source Materials                                              
#                                                                   
# Copyright IBM Corp. 2018                                   
#                                                                   
# The source code for this program is not published or otherwise    
# divested of its trade secrets, irrespective of what has been      
# deposited with the U.S. Copyright Office.                         
#                                                                   
# ***************************************************************** 

import sys
sys.path.append('/opt/ll/lib/apache/zookeeper')
from zooKeeperLib import *


#--------------------------------------------------------------------------------------------
# Obtain text_area data from the zooKeeperClient
#--------------------------------------------------------------------------------------------
def getMultilineData(zooKeeperClient,path):
   #print "getMultilineData called"
   data = ''
   zookeeperDir = '/opt/ll/lib/apache/zookeeper/.utils'
   zookeeperLib = 'zooKeeperLib.jar'
   try:
      p = subprocess.Popen('%s/bin/java -jar %s/%s GetData %s' % (zooKeeperClient.getJavaPath(),zookeeperDir,zookeeperLib,path), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         if line.count('ZOOKEEPER_DATA=') > 0:
            data = data + line.replace('ZOOKEEPER_DATA=','')
         elif line.count('END_DATA') > 0:
            data = data + line.replace('END_DATA','')
         else:
            data = data + line
      retval = p.wait()
      if retval:
         raise Exception('RC %s while executing java utility to retrive ZooKeeper data' % (retval))
   except:
      print('Error:  Failed to get data at path %s'  % (path))
      raise
   #print "data = %s " % (data)
   return data

def getPortByComponent(componentName):

   #print"Running getPortByComponent for %s " % (componentName)

   if componentName in 'Switchbox':
      componentName = 'News'
   if componentName in 'ApplicationRegistry Homepage URLPreview ConnectionsProxy':
      componentName = 'Util'
   if componentName in 'Help sanity Viewer meetings st.endpoint':
      componentName = 'Engage'

   port = 0
   try:
      #print"Inside try"
      zooKeeperClient = ZooKeeperClient()
      #print"Connected "
      path = '/registry/by_component/AC/experimental/values/*'
      experimental = zooKeeperClient.getData(path)

      #print "experimental %s" % (experimental)

      path = '/registry/by_component/AC/serverPortSettings/values/*'
      serverPortSettings = getMultilineData(zooKeeperClient,path)
      #print "serverPortSettings %s" % (serverPortSettings)

      portindex = 2
      if experimental == 'true':
         portindex = 1

      serverSettings_array = serverPortSettings.split('\n')
      for portsIdx in range (0, len(serverSettings_array)):
         ports = serverSettings_array[portsIdx].strip()
         # only proceed non-empty lines
         if ports != '':
            ports_array = ports.split(':')
            # only proceed those having 4 tokens
            if len(ports_array) == 3:
               #print "Server %s , port %s " % (ports_array[0],ports_array[portindex])
               #self.servers.append(SingleJVMServer(ports_array[0], ports_array[portindex], "512"))
               if ports_array[0] == componentName:
                  port = ports_array[portindex]
                  break

   except:
      sys.exit(-1)
   
   return port


#if len(sys.argv) == 2:
#   communitiesPort = getPortByComponent(sys.argv[1])
#   print " %s = %s" % (sys.argv[1] ,communitiesPort)
#else:
#   print "Usage"
#   print "\tpython getPortsFromZNode.py <componentName>"
#   print "\tWhere componentName is one of the following "
#   print "\tBlogs Contacts Activities Push Common Communities Files Forums Mobile News Profiles Search Wikis ApplicationRegistry Homepage URLPreview ConnectionsProxy Switchbox Help sanity Viewer meetings st.endpoint"
      
