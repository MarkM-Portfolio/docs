#!/usr/bin/python
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************


# Unique Identifier = L-MSCR-7BCD3
import re,sys,os,subprocess,shutil,glob,pwd,platform,os.path
import ConfigParser
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/apache/zookeeper')
from registryLib import *
from zooKeeperLib import *
from xml.dom import minidom
from xml.dom.ext import PrettyPrint
from StringIO import StringIO
from ConfigParser import NoSectionError, NoOptionError
WAS_INSTALL_ROOT = "/opt/IBM/WebSphere/AppServer"
#---------------------------------------------------------------------------------------------
# set java8 runtime environment for WAS
#---------------------------------------------------------------------------------------------
def set_was_java8():
  manage_sdk_path = os.path.join(WAS_INSTALL_ROOT,"bin/managesdk.sh")
  if os.path.exists(manage_sdk_path):
    command1 = [manage_sdk_path,"-listAvailable"]
    process = subprocess.Popen(command1, stdout=subprocess.PIPE )
    stdout = process.communicate()[0]
    process.wait()
    command2 = [manage_sdk_path,"-setCommandDefault","-sdkName","1.8_64"]
    command3 = [manage_sdk_path,"-setNewProfileDefault","-sdkName","1.8_64"]
    if("1.8_64" in stdout):
      logging.info('Set WAS runtime environment to Java8')
      process = subprocess.Popen(command2)
      process.wait()
      process = subprocess.Popen(command3)
      process.wait()
#---------------------------------------------------------------------------------------------
# Push IP information to ZooKeeper
#---------------------------------------------------------------------------------------------
def IsNotNull(value):
   return value is not None and len(value) > 0

#---------------------------------------------------------------------------------------------
# Push IP information to ZooKeeper
#---------------------------------------------------------------------------------------------
def registerWithZookeeper(zooKeeperClient,zkPath):

   print 'Publishing server information with ZooKeeper...'
   try:
      zooKeeperClient.createEphemeralNodes(zkPath, 'SEQUENTIAL')
   except:
      print 'Error while attempting to publish server details with ZooKeeper'
      raise
   print 'Server published on ZooKeeper'

#---------------------------------------------------------------------------------------------
# Create a server profile
#---------------------------------------------------------------------------------------------
def createProfile(adminUsername, adminPassword, nodeName, portsFile, serverName='proxy1', profileName='SecureProxySrv01', installDir='/opt/IBM/WebSphere/AppServer'):
   serviceUser = 'websphere'
   serviceGroup = 'websphere'
   #hostname = socket.gethostname().split('.')[0]

   adminUsername = adminUsername.encode('ascii','ignore')

   print 'Creating profile for server %s' % (serverName)
   print 'Creating profile at profile %s' % (profileName)
   try:
      cmd = [ '%s/bin/manageprofiles.sh' % installDir, '-create',
              '-templatePath', '%s/profileTemplates/secureproxy' % installDir,
              '-profileName', profileName,
              '-nodeName', nodeName,
              '-serverName', serverName,
              '-enableAdminSecurity', 'true',
              '-adminUserName', adminUsername, '-adminPassword', adminPassword,
			  '-portsFile', portsFile ]

      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print line.strip('\n')
      retval = p.wait()
      if retval:
         raise Exception('RC %s while creating WebSphere profile' % (retval))

      # Update permissions of installation dir
      cmd = 'chown -R %s:%s %s' % (serviceUser, serviceGroup, installDir)
      p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT);
      retval = p.wait()
      if retval:
         raise Exception('RC %s while updating profiles folder permission' % (retval))
   except:
      print 'Error:  Failed to create profile'
      raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))


#---------------------------------------------------------------------------------------------
# Create a Linux service for a server
#---------------------------------------------------------------------------------------------
def createService(adminUsername, adminPassword, serviceName='was.proxy1', serverName='proxy1', profileName='SecureProxySrv01', installDir='/opt/IBM/WebSphere/AppServer', order=98):
   serviceUser='websphere'

   #Use the wasservice.sh command to create the service
   cmd = '%s/bin/wasservice.sh -add %s -serverName %s -profilePath %s/profiles/%s -userid %s -stopArgs "-username %s -password %s"' % (installDir,serviceName,serverName,installDir,profileName,serviceUser,adminUsername,adminPassword)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while creating WebSphere service %s' % serviceName)

   #Remove the service to "recofigure" it better
   cmd = 'chkconfig --del %s_was.init' % (serviceName)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while deleting WebSphere service %s_was.init' % serviceName)

      retval = p.wait()
   if retval:
      raise Exception('RC %s while adding WebSphere service %s' % serviceName)

   #Rename the file to something shorter
   os.rename('/etc/init.d/%s_was.init' % (serviceName),'/etc/init.d/%s' % (serviceName))

   #Modify the script to inherient environment varibles and use the new service name
   modifiedFile = ''
   f = open('/etc/init.d/%s' % (serviceName), 'r')
   for line in f:
      if line.count('SERVICENAME="%s_was.init"' % (serviceName)) > 0:
         line = line.replace('SERVICENAME="%s_was.init"' % (serviceName),'SERVICENAME="%s"' % (serviceName))
      if line.count('$@" ${RUNASUSER}') > 0:
         line = line.replace('$@" ${RUNASUSER}','$@" - ${RUNASUSER}')
      if line.count('chkconfig:') > 0:
         line = line.replace('98',str(order))
      modifiedFile += line
   f.close()

   f = open('/etc/init.d/%s' % (serviceName), 'w')
   f.write(modifiedFile)
   f.close()

   #Readd the service and set it to start at runlevels 345
   cmd = 'chkconfig --add %s; chkconfig --level 345 %s on' % (serviceName,serviceName)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')


#---------------------------------------------------------------------------------------------
# Start a was service
#---------------------------------------------------------------------------------------------
def startWASService(serviceName):

   print 'Starting %s service...' % (serviceName)
   try:
      p = subprocess.Popen('service %s start' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      print p.communicate()[0]
      if p.returncode:
         raise Exception('RC %s while starting service %s' % (p.returncode,serviceName))
   except:
      print 'Error:  TFIM configuration failed. Unable to start service %s' % (serviceName)
      raise


#---------------------------------------------------------------------------------------------
# Stop a was service
#---------------------------------------------------------------------------------------------
def stopWASService(serviceName):

   print 'Stopping %s service...' % (serviceName)
   try:
      p = subprocess.Popen('service %s stop' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      print p.communicate()[0]
      if p.returncode:
         print 'Warning: RC %s while stop service %s.  Ignoring since the WebSphere service status implementation is often inaccurate...' % (p.returncode,serviceName)
   except:
      print 'Error:  TFIM configuration failed. Unable to stop service %s' % (serviceName)
      raise


#---------------------------------------------------------------------------------------------
# Start a server by name
#---------------------------------------------------------------------------------------------
def startServerByName(serverName, installDir='/opt/IBM/WebSphere/AppServer'):
   serviceUser='websphere'
   uid = pwd.getpwnam(serviceUser).pw_uid

   cmd = '%s/bin/startServer.sh %s' % (installDir, serverName)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, preexec_fn = lambda : os.setuid(uid))
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while starting server %s' % serverName)


#---------------------------------------------------------------------------------------------
# Set the permisions on a specified directory
#---------------------------------------------------------------------------------------------
def setPermissions(installDir,username,groupname):

   #Ensure the top level directorys are all 755 without effecting other directories
   directory = ''
   for part in installDir.lstrip('/').rstrip('/').split('/'):
      directory += '/%s' % (part)
      try:
         os.chmod(directory,0755)
      except:
         print 'Error while attempting to chmod %s directory' % (directory)
         raise

   #Recursively chown the install directory
   p = subprocess.Popen('chown -R %s:%s %s' % (username,groupname,installDir), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   output = p.communicate()[0]
   print output
   retval = p.returncode
   if retval:
      print 'Warning:  RC %s while attempting to chown %s directory' % (retval,directory)


#---------------------------------------------------------------------------------------------
# Push IP information to ZooKeeper
#---------------------------------------------------------------------------------------------
def registerWithZookeeper(zooKeeperClient,zkPath):

   print 'Publishing server information with ZooKeeper...'
   try:
      zooKeeperClient.createEphemeralNodes(zkPath, 'SEQUENTIAL')
   except:
      print 'Error while attempting to publish server details with ZooKeeper'
      raise
   print 'Server published on ZooKeeper'


#---------------------------------------------------------------------------------------------
# Activate the server
#---------------------------------------------------------------------------------------------
def activateServer(zooKeeperClient,zkPath):

   print 'Activating server in ZooKeeper...'
   try:
      zooKeeperClient.activateServer(zkPath)
   except:
      print 'Error while attempting to activate server in ZooKeeper'
      raise
   print 'Server activated in ZooKeeper'


#---------------------------------------------------------------------------------------------
# Import the java key store from zookeeper
#---------------------------------------------------------------------------------------------
def importJKS(zooKeeperClient,nodeConfigDir):

   print 'Importing java key store in ZooKeeper...'
   jksFile = nodeConfigDir + '/LotusLiveIDP.jks'
   if os.path.exists(jksFile):
      os.remove(jksFile)
   zooKeeperClient.decodeFileFromNode(jksFile,'/data/tfim/key_exports/lotusliveidp')
   print 'Imported java key store in ZooKeeper.'


#---------------------------------------------------------------------------------------------
# export ltpa token
#---------------------------------------------------------------------------------------------
def __exportLTPA(zooKeeperClient, ltpaPath, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot):

   filePath = appsRoot + '/ssoltpakey.txt'
   cmd = '%s/bin/wsadmin.sh -username %s -password %s -f %s/exportLTPAKeys.py %s 1bmd0cs' % (wasDir,wasUsername,wasPassword,scriptsRoot,filePath)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while export ltpa token' % retval)

   zooKeeperClient.encodeFileToNode(filePath, ltpaPath)

#---------------------------------------------------------------------------------------------
# import ltpa token
#---------------------------------------------------------------------------------------------
def __importLTPA(zooKeeperClient, ltpaPath, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot):

   filePath = appsRoot + '/ssoltpakey.txt'
   zooKeeperClient.decodeFileFromNode(filePath, ltpaPath)

   cmd = '%s/bin/wsadmin.sh -username %s -password %s -f %s/importLTPAKeys.py %s 1bmd0cs' % (wasDir,wasUsername,wasPassword,scriptsRoot,filePath)
   p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
   for line in p.stdout.readlines():
      print line.strip('\n')
      retval = p.wait()
   if retval:
      raise Exception('RC %s while import ltpa token' % retval)


#---------------------------------------------------------------------------------------------
# exchange SSO token
#---------------------------------------------------------------------------------------------
def setupSSO(zooKeeperClient, registryParser, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot):

   print 'setup SSO...'
   primary = 'false'
   try:
      baseTN = registryParser.getBaseTopologyName()
      ltpaPath = '/' + baseTN + '/data/docs_rp/sso_ltpa_key'
      mutex = ltpaPath + '/mutex'

      print 'request the mutex.'
      zooKeeperClient.requestMutex(mutex)
      print 'requested the mutex.'
      ltpaData = zooKeeperClient.getData(ltpaPath)
      #print 'got data: %s' %(ltpaData)
      if ltpaData == 'null':
         print 'This is primary DMZ secure proxy server.'
         primary = 'true'
         __exportLTPA(zooKeeperClient, ltpaPath, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot)
      else:
         print 'This is NOT primary DMZ secure proxy server.'
         primary = 'false'
         __importLTPA(zooKeeperClient, ltpaPath, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot)
   except:
      print 'Error happens when exchange SSO.'
      raise
   finally:
      zooKeeperClient.releaseMutex(mutex)

   return primary


#---------------------------------------------------------------------------------------------
# print minidom
#---------------------------------------------------------------------------------------------
# A workaround to a minidom prettyprint bug
def __toprettyxml(node, encoding='UTF-8'):
   tmpStream = StringIO()
   PrettyPrint(node, stream=tmpStream, encoding=encoding)
   return tmpStream.getvalue()

#---------------------------------------------------------------------------------------------
# create XML element
#---------------------------------------------------------------------------------------------
def __generateServerPathElement(doc):
   #Create the management interface element
   element = doc.createElement('systemProperties')
   element.setAttribute('xmi:id','Property_1330941321532')
   element.setAttribute('name','ws.ext.dirs')
   element.setAttribute('value','/opt/IBM/WebSphere/AppServer/optionalLibraries/IBM/proxy')
   element.setAttribute('required','false')

   return element


#---------------------------------------------------------------------------------------------
# copy files
#---------------------------------------------------------------------------------------------
def copyfiles(src, dst, pattern):
   try:
     for afile in glob.glob(src+pattern):
       shutil.copy (afile, dst)
   except IOError:
     raise


#---------------------------------------------------------------------------------------------
# backup file
#---------------------------------------------------------------------------------------------
def backupfile(file, dst):
   try:
     shutil.copy (file, dst)
   except IOError:
     raise


#---------------------------------------------------------------------------------------------
# configure variables.xml
#---------------------------------------------------------------------------------------------
def configureVariableXML(appsRoot, cellConfigDir, domain, jksPsw):

   variableFileIn = appsRoot + '/variables.xml'
   variableFileOut = cellConfigDir + '/variables.xml'
   variableFileOutBak = cellConfigDir + '/variables.xml.bak'
   backupfile(variableFileOut, variableFileOutBak)

   print 'Input file name is: %s' % (variableFileIn)
   print 'Output file name is: %s' % (variableFileOut)
   print 'Domain name is: %s' % domain

   tfimUrl = 'https://apps.' + domain + '/sps/idp/saml11/login'
   providerID = 'https://apps.' + domain + '/docs'
   idpPage = 'https://apps.' + domain + '/docs/shouldnotexist1'
   authedPage = 'https://apps.' + domain + '/docs/shouldnotexist2'
   homePage = 'https://apps.' + domain + '/files'
   hostPage = 'https://apps.' + domain

   try:
     doc = minidom.parse(variableFileIn)
   except:
     print 'Error:  Failed to parse client configuration file %s' % (variableFileIn)
     raise
   for subelement in doc.getElementsByTagName('entries'):
     if subelement.getAttribute('symbolicName') == 'DOCS_TFIM_URL':
        subelement.setAttribute('value', tfimUrl)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_PROVIDER_ID':
        subelement.setAttribute('value', providerID)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_NOEXISTING_PAGE_IDP':
        subelement.setAttribute('value', idpPage)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_NOEXISTING_PAGE_AUTHED':
        subelement.setAttribute('value', authedPage)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_BACKFROMSAML_PAGE':
     	# this is hard code, need not change
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_HOME_PAGE':
        subelement.setAttribute('value', homePage)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_HOST_PAGE':
        subelement.setAttribute('value', hostPage)
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_SAML_JKSKEY':
        # this is hard code, need not change
        print subelement.getAttribute('value')
     if subelement.getAttribute('symbolicName') == 'DOCS_SAML_JKSPASSWORD':
        subelement.setAttribute('value', jksPsw)

   if os.path.exists(variableFileOut):
     os.remove(variableFileOut)

   f=open(variableFileOut,'w')
   f.write(__toprettyxml(doc))
   f.close()

   return None


#---------------------------------------------------------------------------------------------
# configure server.xml
#---------------------------------------------------------------------------------------------
def configureServerXML(nodeConfigDir):

   serverFileOut = nodeConfigDir + '/servers/proxy1/server.xml'
   serverFileBak = nodeConfigDir + '/servers/proxy1/server.xml.bak'
   backupfile(serverFileOut, serverFileBak)

   pathin = serverFileBak
   pathout = serverFileOut
   print 'Input file name is: %s' % pathin
   print 'Output file name is: %s' % pathout

   try:
     doc = minidom.parse(pathin)
   except:
     print 'Error:  Failed to parse client configuration file %s' % pathin
     raise

   alterEntry = 'jvmEntries'
   pathElement = __generateServerPathElement(doc)
   for subelement in doc.getElementsByTagName(alterEntry):
     subelement.appendChild(pathElement)

   alterErr = 'errorStreamRedirect'
   for subelement in doc.getElementsByTagName(alterErr):
     subelement.setAttribute('rolloverSize', '10')
     subelement.setAttribute('maxNumberOfBackupFiles', '90')
     print 'SystemErr rolloverSize is: %s' % subelement.getAttribute('rolloverSize')
     print 'SystemErr maxNumberOfBackupFiles is: %s' % subelement.getAttribute('maxNumberOfBackupFiles')

   alterOut = 'outputStreamRedirect'
   for subelement in doc.getElementsByTagName(alterOut):
     subelement.setAttribute('rolloverSize', '10')
     subelement.setAttribute('maxNumberOfBackupFiles', '90')
     print 'SystemOut rolloverSize is: %s' % subelement.getAttribute('rolloverSize')
     print 'SystemOut maxNumberOfBackupFiles is: %s' % subelement.getAttribute('maxNumberOfBackupFiles')

   if os.path.exists(pathout):
     os.remove(pathout)

   f=open(pathout,'w')
   f.write(__toprettyxml(doc))
   f.close()

   return None

def mapDocsHostWithIP(count):
   try:
      zooKeeperClient = ZooKeeperClient()

      hostsFile = '/etc/hosts'

      hosts_file = open(hostsFile, 'r')
      hosts_content = hosts_file.read()
      print "Current content of file /etc/hosts: \n%s" % hosts_content
      hosts_file.close()

      hosts_file = open(hostsFile, 'a')
      if not hosts_content.endswith('\n') and not hosts_content.endswith('\r'):
         hosts_file.write('\n')
      for i in range(1, count + 1):
         host_name = zooKeeperClient.getHostname('/topology/docs/servers/' + str(i))
         front_vip = zooKeeperClient.getFrontEndInterface('/topology/docs/servers/' + str(i))
         print "Host name is %s, front end IP is: %s" % (host_name, front_vip)
         if hosts_content.find(host_name) == -1 and hosts_content.find(front_vip) == -1:
           new_line = front_vip + ' ' + host_name
           print "Add line to /etc/hosts: %s" % (new_line)
           hosts_file.write(new_line)
           hosts_file.write('\n')
      hosts_file.close()
      print "\n"

      hosts_file = open(hostsFile, 'r')
      hosts_content = hosts_file.read()
      print "New content of file /etc/hosts: \n%s" % hosts_content
      hosts_file.close()
   except:
     print 'Exception happens while mapping Docs server host name and front end ip'
     raise

#---------------------------------------------------------------------------------------------
# merge targetTree.xml
#---------------------------------------------------------------------------------------------
def mergeTargetTree(path, count):
   cellGroup = 'cellGroup'
   cell = 'cell'
   cluster = 'cluster'
   link = 'link'
   targetFile = path + '/targetTree.xml'
   if count == 1:
      try:
         src = path + '/targetTree.xml.1'
         shutil.copy (src, targetFile)
      except IOError:
         raise
   else:
      try:
         doc1 = minidom.parse(path + '/targetTree.xml.1')
         doc1CellGroupElements = doc1.getElementsByTagName(cellGroup)
         doc1CellGroupElement = doc1CellGroupElements[0]
         doc1ClusterElements = doc1.getElementsByTagName(cluster)
         doc1ClusterElement = doc1ClusterElements[0]
         doc1Links = doc1ClusterElement.getElementsByTagName(link)
         doc1Link0 = doc1Links[0]
         for x in range(2,count+1):
            file = path + '/targetTree.xml.' + str(x)
            print 'We\'re on file: %s' % (file)
            doc = minidom.parse(file)
            docCellElements = doc.getElementsByTagName(cell)
            docCellElement = docCellElements[0]
            docClusterElements = doc.getElementsByTagName(cluster)
            docClusterElement = docClusterElements[0]

            docLinks = docClusterElement.getElementsByTagName(link)
            for child in docLinks:
               childName = child.getAttribute('name')
               #print 'The element is: %s' % childName
               if childName.find('server/server1') != -1:
                  print 'We found element: %s' % childName
                  doc1ClusterElement.insertBefore(child, doc1Link0)
                  #docClusterElement.removeChild(child)
                  doc1CellGroupElement.appendChild(docCellElement)

         f=open(targetFile,'w')
         f.write(__toprettyxml(doc1))
         f.close()
      except:
         print 'Error:  Failed to parse targetTree file.'
         raise

   # Change /etc/hosts file to map the Docs server's host name with Docs server's front end IP
   #mapDocsHostWithIP(count)

#---------------------------------------------------------------------------------------------
# copy targetTree.xml
#---------------------------------------------------------------------------------------------
def copyTargetTree(appsRoot, staticRouteDir):
   targetTreeDst = staticRouteDir + '/targetTree.xml'
   targetTreeSrc = appsRoot + '/targetTree.xml'
   backupfile(targetTreeSrc, targetTreeDst)

#---------------------------------------------------------------------------------------------
# configure security.xml
#---------------------------------------------------------------------------------------------
def configureSecurityXML(cellConfigDir):

   securityFileOut = cellConfigDir + '/security.xml'
   securityFileOutBak = cellConfigDir + '/security.xml.bak'
   backupfile(securityFileOut, securityFileOutBak)

   pathin = securityFileOutBak
   pathout = securityFileOut

   print 'Input file name is: %s' % pathin
   print 'Output file name is: %s' % pathout

   alterEntry = 'authMechanisms'

   try:
     doc = minidom.parse(pathin)
   except:
     print 'Error:  Failed to parse client configuration file %s' % pathin
     raise

   pathElement = __generateServerPathElement(doc)

   for subelement in doc.getElementsByTagName(alterEntry):
     if subelement.getAttribute('xmi:type') == 'security:LTPA':
        subelement.setAttribute('timeout', '1080')
        print subelement.getAttribute('timeout')

   if os.path.exists(pathout):
     os.remove(pathout)

   f=open(pathout,'w')
   f.write(__toprettyxml(doc))
   f.close()

   return None

#---------------------------------------------------------------------------------------------------------
# Configure the proxy server settings XML file: Add proxy compress action and proxy rule expression, etc.
#---------------------------------------------------------------------------------------------------------
def configureProxySettingsXML(serverConfigDir, settingsPropertyFile):
   ProxyVirtualHostConfigId = 'IBMDocs_ProxyVirtualHostConfig_001'
   ProxyVirtualHostsId = 'IBMDocs_ProxyVirtualHost_001'
   ProxyProxyRuleExpressionId = 'IBMDocs_ProxyRuleExpression_001'
   ProxyCompressionActionId = 'IBMDocs_HTTPResponseCompressionAction_001'
   ProxyWorkloadManagementPolicyId = 'IBMDocs_WorkloadManagementPolicyId_001'

   settingsFile = serverConfigDir + '/proxy-settings.xml'
   settingsFileBak = serverConfigDir + '/proxy-settings.xml.bak'
   backupfile(settingsFile, settingsFileBak)

   pathin = settingsFileBak
   pathout = settingsFile
   print 'Input proxy settings file name is: %s' % pathin
   print 'Output proxy settings file name is: %s' % pathout

   config = ConfigParser.SafeConfigParser()
   config.readfp(open(settingsPropertyFile))
   compress_expression = config.get("CompressAction", "compress_expression")
   compress_types = config.get("CompressAction", "compress_types").split(",")
   print "The compress expression is: %s" % compress_expression
   print "The compress types are: %s" % compress_types
   availabilityMonitorTimeout = config.get("WorkloadManagementPolicy", "availabilityMonitorTimeout")
   print "The availabilityMonitorTimeout of WorkloadManagementPolicy is : %s" % availabilityMonitorTimeout

   try:
     doc = minidom.parse(pathin)
   except:
     print 'Error: Failed to parse proxy settings XML file %s' % pathin
     raise

   root = doc.getElementsByTagName("xmi:XMI")[0]
   proxyVirtualHostSchema = root.getAttribute('xmlns:proxyVirtualHost')
   if proxyVirtualHostSchema == '':
     root.setAttribute('xmlns:proxyVirtualHost', 'http://www.ibm.com/websphere/appserver/schemas/6.0/proxyVirtualHost.xmi')

   proxyVirtualHostCfgElements = doc.getElementsByTagName('proxyVirtualHost:ProxyVirtualHostConfig')
   if proxyVirtualHostCfgElements.length > 0 :
     proxyVirtualHostCfgElement = proxyVirtualHostCfgElements[0]
   else :
     proxyVirtualHostCfgElement = doc.createElement('proxyVirtualHost:ProxyVirtualHostConfig')
     root.appendChild(proxyVirtualHostCfgElement)

   if not proxyVirtualHostCfgElement.hasAttribute('xmi:id'):
     proxyVirtualHostCfgElement.setAttribute('xmi:id', ProxyVirtualHostConfigId)

   enabledVirtualHosts = proxyVirtualHostCfgElement.getAttribute('enabledProxyVirtualHosts')
   print 'Current Enabled Virtual hosts: %s' % enabledVirtualHosts
   index = enabledVirtualHosts.find(ProxyVirtualHostsId)
   if index == -1 :
     if enabledVirtualHosts == '':
       enabledVirtualHosts = ProxyVirtualHostsId
     else:
       enabledVirtualHosts = enabledVirtualHosts + ' ' + ProxyVirtualHostsId
   print 'New Enabled Virtual hosts: %s' % enabledVirtualHosts
   proxyVirtualHostCfgElement.setAttribute('enabledProxyVirtualHosts', enabledVirtualHosts)

   # Removes the old elements about HCL Docs proxy server
   childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyVirtualHosts")
   for child in childs:
     if child.getAttribute('xmi:id') == ProxyVirtualHostsId:
       proxyVirtualHostCfgElement.removeChild(child)
   childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyRuleExpressions")
   for child in childs:
     if child.getAttribute('xmi:id') == ProxyProxyRuleExpressionId:
       proxyVirtualHostCfgElement.removeChild(child)
   childs = proxyVirtualHostCfgElement.getElementsByTagName("proxyActions")
   for child in childs:
     if child.getAttribute('xmi:id') == ProxyCompressionActionId:
       proxyVirtualHostCfgElement.removeChild(child)

   # Create proxy actions element
   proxyActionsElement = doc.createElement('proxyActions')
   proxyActionsElement.setAttribute('xmi:id', ProxyCompressionActionId)
   proxyActionsElement.setAttribute('name', 'IBMDocs_GZipCompressAction')
   proxyActionsElement.setAttribute('xmi:type', 'proxyVirtualHost:HTTPResponseCompressionAction')
   for compress_type in compress_types:
     compress_type = compress_type.strip()
     contentTypesTextNode = doc.createTextNode(compress_type)
     contentTypesElement = doc.createElement('contentTypes')
     contentTypesElement.appendChild(contentTypesTextNode)
     proxyActionsElement.appendChild(contentTypesElement)
   proxyVirtualHostCfgElement.appendChild(proxyActionsElement)

   # Create proxy rule expression element
   proxyRuleExpElement = doc.createElement('proxyRuleExpressions')
   proxyRuleExpElement.setAttribute('xmi:id', ProxyProxyRuleExpressionId)
   proxyRuleExpElement.setAttribute('name', 'IBMDocs_ProxyRuleExpression')
   proxyRuleExpElement.setAttribute('expression', compress_expression)
   proxyRuleExpElement.setAttribute('enabledProxyActions',ProxyCompressionActionId)
   proxyVirtualHostCfgElement.appendChild(proxyRuleExpElement)

   # Create proxy virtual host element
   proxyVirtualHostsElement = doc.createElement('proxyVirtualHosts')
   proxyVirtualHostsElement.setAttribute('xmi:id', ProxyVirtualHostsId)
   proxyVirtualHostsElement.setAttribute('virtualHostPort', '*')
   proxyVirtualHostsElement.setAttribute('enabledProxyRuleExpressions', ProxyProxyRuleExpressionId)
   proxyVirtualHostCfgElement.appendChild(proxyVirtualHostsElement)

   workloadManagementPolicy = doc.getElementsByTagName('workloadManagementPolicy')
   if workloadManagementPolicy.length > 0:
     workloadManagementPolicy[0].setAttribute('availabilityMonitorTimeout', availabilityMonitorTimeout)
   else:
     parentElement = doc.getElementsByTagName('proxy:ProxySettings')[0]
     workloadManagementPolicy = doc.createElement('workloadManagementPolicy')
     workloadManagementPolicy.setAttribute('xmi:id', ProxyWorkloadManagementPolicyId)
     workloadManagementPolicy.setAttribute('availabilityMonitorTimeout', availabilityMonitorTimeout)
     parentElement.appendChild(workloadManagementPolicy)

   if os.path.exists(pathout):
     os.remove(pathout)

   f = open(pathout,'w')
   f.write(__toprettyxml(doc))
   f.close()

   return None

#---------------------------------------------------------------------------------------------
# configure cell.xml
#---------------------------------------------------------------------------------------------
def configureCellXML(cellConfigDir):
   cellConfigFileOut = cellConfigDir + '/cell.xml'
   cellConfigFileOutBak = cellConfigDir + '/cell.xml.bak'
   backupfile(cellConfigFileOut, cellConfigFileOutBak)

   pathin = cellConfigFileOutBak
   pathout = cellConfigFileOut

   print 'Input file name is: %s' % pathin
   print 'Output file name is: %s' % pathout

   try:
     doc = minidom.parse(pathin)
   except:
     print 'Error: Failed to parse cell configuration file %s' % pathin
     raise

   element = doc.createElement('properties')
   element.setAttribute('xmi:id','Property_1348286402559')
   element.setAttribute('name','IBM_CLUSTER_ENABLE_NON_DEFAULT_COOKIE_NAMES')
   element.setAttribute('value','true')
   element.setAttribute('required','false')

   for subelement in doc.getElementsByTagName('topology.cell:Cell'):
     subelement.appendChild(element)

   if os.path.exists(pathout):
     os.remove(pathout)

   f = open(pathout,'w')
   f.write(__toprettyxml(doc))
   f.close()

   return None

#---------------------------------------------------------------------------------------------
# tune JVM heap size(init=768M,max=2048M)
#---------------------------------------------------------------------------------------------
def tuneJVM(serviceUser,wasUserName,wasPassword,nodeName,serverName,wasDir='/opt/IBM/WebSphere/AppServer'):
   JVM_Parameter_64 = [
       'initialHeapSize=768',
       'maximumHeapSize=2506'
       ]

   try:
      cmd = [
              #'sudo -u %s %s/bin/wsadmin.sh' % (serviceUser,wasDir),
              'su -c "%s/bin/wsadmin.sh' % (wasDir),
              '-lang', 'jython',
              '-user',wasUserName,
              '-password', wasPassword,
              '-f', os.path.abspath('./tune_jvm.py'),
              nodeName,
              serverName
              ]
      cmd.extend(JVM_Parameter_64)
      cmd.extend(['"',serviceUser])
      print cmd

      p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
      for line in p.stdout.readlines():
         print line.strip('\n')
      retval = p.wait()
      if retval:
         raise Exception('RC %s while tuning JVM' % (retval))

   except:
      print 'Error:  Failed to tune JVM'
      raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))

#---------------------------------------------------------------------------------------------
# tune Proxy thread pool(Default:maximumSize=100,Proxy:maximumSize=120)
#---------------------------------------------------------------------------------------------
def tuneThreadPool(serviceUser,wasUserName,wasPassword,nodeName,serverName,wasDir='/opt/IBM/WebSphere/AppServer'):
  thread_pool_parameter = [
    'Default:maximumSize=100',
    'Proxy:maximumSize=120'
  ]

  try:
    cmd = [
            #'sudo -u %s %s/bin/wsadmin.sh' % (serviceUser,wasDir),
            'su -c "%s/bin/wsadmin.sh' % (wasDir),
              '-lang', 'jython',
              '-user',wasUserName,
              '-password', wasPassword,
              '-f', os.path.abspath('./tune_thread_pool.py'),
              nodeName,
              serverName
          ]
    cmd.extend(thread_pool_parameter)
    cmd.extend(['"',serviceUser])
    print cmd
    p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in p.stdout.readlines():
      print line.strip('\n')
    retval = p.wait()
    if retval:
      raise Exception('RC %s while tuning thread pool' % (retval))

  except:
    print 'Error:  Failed to tune thread pool'
    raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))

#---------------------------------------------------------------------------------------------
# Fixed OCS ticket 219888
#---------------------------------------------------------------------------------------------
def restrictCiphers(wasUserName, wasPassword, serverName, nodeName, wasDir='/opt/IBM/WebSphere/AppServer'):
    print 'Remove medium strength ciphers 3DES start...'
    resCiphers_script = 'restrict_ciphers.py'
    total_cmd_str = '%s/bin/wsadmin.sh -lang jython -username %s -password %s -f %s %s %s'
    if sys.platform.lower() == 'win32':
        total_cmd_str = '%s/bin/wsadmin.bat -lang jython -username %s -password %s -f %s %s %s'
    # print total_cmd_str
    totalcmd = total_cmd_str % (wasDir, wasUserName, wasPassword, resCiphers_script, serverName, nodeName)
    # print totalcmd
    try:
        p = subprocess.Popen(totalcmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
        retval = p.communicate()[0]
        # print '---------', retval
        if 'Exception' in retval:
            print 'RC %s while restricting ciphers by wsadmin (%s)' % (retval, totalcmd)
    except Exception, e:
        print 'Error --> %s Remove medium strength ciphers 3DES By Commond : (%s)' % (retval, totalcmd)
    finally:
        print 'Remove medium strength ciphers 3DES complete...'
