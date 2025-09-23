#!/usr/bin/python
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


# Unique Identifier = L-MSCR-7BCD3
import time,re,sys,os,subprocess,shutil,glob,pwd
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/scripts/docsrp')
from registryLib import *
from zooKeeperLib import *
from StringIO import StringIO
import dmzLib


#---------------------------------------------------------------------------------------------
# update registry.xml
#---------------------------------------------------------------------------------------------
def updateRegistryXML(value, registry = '/etc/ll/registry.xml', component = 'Docs', parameter = 'num_docs_nodes'): 		   
   fileOut = '/etc/ll/registry_new.xml'
   try:
     doc = minidom.parse(registry)
   except:
     print 'Error:  Failed to parse registry file %s' % (registry)
     raise
   for subelement in doc.getElementsByTagName("component"):
     compId = subelement.getAttribute('id')
     #print 'component id is: %s' % (compId)	
     if component == compId:
       for parameterNode in subelement.getElementsByTagName('param'):
         paraId = parameterNode.getAttribute('id')
         #print 'parameter id is: %s' % (paraId)
         if parameter == paraId:    
           newValue = str(value)	 	
           parameterNode.firstChild.data=newValue             
           #print 'Docs num_docs_nodes is set as: %s' % (parameterNode.firstChild.data)   
  
   if os.path.exists(fileOut):
     os.remove(fileOut)
   
   f=open(fileOut,'w')
   f.write(dmzLib.__toprettyxml(doc))
   f.close()         
   
   try:     
     shutil.copy (fileOut, registry)
     os.remove(fileOut)
   except IOError:
     print 'Error:  Failed to update registry file %s' % (registry)
     raise

   return None
   
#---------------------------------------------------------------------------------------------
# tune JVM heap size(init=768M,max=2048M)
#---------------------------------------------------------------------------------------------
#/opt/IBM/WebSphere/AppServer/profiles/SecureProxySrv01/bin/wsadmin.sh -lang jython -user xxx -password xxx -f ./reloadTargetTree.py proxy1
def reloadTargetTree(serviceUser,wasUserName,wasPassword,nodeName,serverName,scriptsRoot,wasDir='/opt/IBM/WebSphere/AppServer/profiles/SecureProxySrv01'):
   try:
      cmd = [ 
              #'sudo -u %s %s/bin/wsadmin.sh' % (serviceUser,wasDir),
              'su -c "%s/bin/wsadmin.sh' % (wasDir),
              '-lang', 'jython',
              '-user',wasUserName,
              '-password', wasPassword,
              '-f', os.path.abspath('%s/reloadTargetTree.py' % (scriptsRoot)),
              nodeName,
              #serverName
              serverName,'"',serviceUser
              ]
      print cmd

      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print line.strip('\n')
      retval = p.wait()
      if retval:
         raise Exception('RC %s while reload targetTree' % (retval))

   except:
      print 'Error:  Failed to reload TargetTree'
      raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))
   

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------

print 'updateDMZ.py started...'

try:
    #Set variables
    serviceUser='websphere'
    serviceGroup='websphere'
    wasDir = '/opt/IBM/WebSphere/AppServer'
    profileName = 'SecureProxySrv01'
    staticRouteDir = wasDir + '/profiles/' + profileName + '/staticRoutes'
    appsRoot = '/opt/ll/apps/docsrp-cron'
    scriptsRoot = '/opt/ll/scripts/docsrp-cron'
    timestamp = str( int(time.time()) )
    
    serverName = 'proxy1'    
    hostname = socket.gethostname().split('.')[0]
    nodeName = 'ocs_app_node_%s' % hostname
    
    #print 'applications root directory is: %s' % appsRoot
    #print 'timestamp is: %s' % timestamp
    #There is a PMR about pdjrtecfg not working when the WAS jre is added to the classpath. An external jre must be used in the meantime.
    #https://www-304.ibm.com/support/entdocview.wss?uid=swg1IV00477
    path = os.getenv('PATH')
    if path == None:
       print 'Error:  DMZ configuration failed. Unable to add external Java to PATH variable.'
       raise Exception('Unable to retrieve current PATH variable')
    os.putenv('PATH','/opt/ibm/java2-i386-50/jre/bin:%s' % (path))
    
    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    
    #Read the registry settings
    registryParser = RegistryParser()
    wasUsername = registryParser.getSetting('MiddlewareWebSphere','admin_username')
    wasPassword = registryParser.getSetting('MiddlewareWebSphere','admin_password')
    
    numDocsNodes_local = int(registryParser.getSetting('Docs','num_docs_nodes'))
    numDocsNodes_zk = int(zooKeeperClient.getSettingByComponent('Docs','num_docs_nodes'))
    print "There are %s docs node record in /etc/ll/registry.xml" % numDocsNodes_local
    print "There are %s docs node record in zookeeper server" % numDocsNodes_zk
    
    # get the nodes and which is not same is the value in registry.xml
    if numDocsNodes_zk > 0 and  numDocsNodes_zk != numDocsNodes_local:
      numDocsNodes = numDocsNodes_zk
      for i in range(1,numDocsNodes+1):     
         docsPath = '/topology/docs/servers/' + str(i)
         print 'Waiting for activation of Docs servers: %s' % (docsPath)	
         zooKeeperClient.waitForServerActivation(docsPath)
         docsTargetTreeFile = appsRoot + '/targetTree.xml.' + str(i)
         docsTargetTreeDataPath = '/data/docs/target_trees/' + str(i)
         zooKeeperClient.decodeFileFromNode(docsTargetTreeFile, docsTargetTreeDataPath)
    
      dmzLib.mergeTargetTree(appsRoot, numDocsNodes)	  
      print 'Merged targetTree.'    
      
      # back up current targetTree
      curTargetTree = staticRouteDir + '/targetTree.xml'
      bakTargetTree = appsRoot + '/targetTree_' + timestamp +'.xml'
      if os.path.exists(curTargetTree):
      	try:
      	  shutil.move(curTargetTree,bakTargetTree)
      	except IOError:
          raise  
      dmzLib.copyTargetTree(appsRoot, staticRouteDir)
      print 'Copied targetTree.'
        
      # Set permission  
      dmzLib.setPermissions(curTargetTree,serviceUser,serviceGroup)
      print 'Set permission on %s' % curTargetTree          
      dmzLib.setPermissions(scriptsRoot,serviceUser,serviceGroup)
      print 'Set permission on %s' % scriptsRoot          
      
      # reload target tree
      reloadTargetTree(serviceUser,wasUsername,wasPassword,nodeName,serverName,scriptsRoot)
      print 'Reloaded targetTree in the memory!!!'      
      
      # update num_docs_nodes in registry in local
      srcRegistry = '/etc/ll/registry.xml'
      destRegistry = '/etc/ll/registry_' + timestamp +'.xml'
      dmzLib.backupfile(srcRegistry, destRegistry)      
      updateRegistryXML(numDocsNodes,'/etc/ll/registry.xml','Docs','num_docs_nodes')
      print 'Updated registry.'      
      print '---------------------------------------------'    
      
    else:
      print 'There is no docs node added since last update.'
      print '---------------------------------------------'
    
except:
    print '---------------------------------------------'
    raise    