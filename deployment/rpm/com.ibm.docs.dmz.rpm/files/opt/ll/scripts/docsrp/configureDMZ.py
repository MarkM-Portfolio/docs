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
import re,sys,os,subprocess,shutil,glob,pwd
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/lib/apache/zookeeper')
sys.path.append('/opt/ll/scripts/docsrp')
from registryLib import *
from zooKeeperLib import *
from StringIO import StringIO
import dmzLib

#---------------------------------------------------------------------------------------------
# Main
#---------------------------------------------------------------------------------------------

print 'configureDMZ.py started...'

try:
    #Set variables
    serviceUser='websphere'
    serviceGroup='websphere'
    wasDir = '/opt/IBM/WebSphere/AppServer'
    profileName = 'SecureProxySrv01'
    serverName = 'proxy1'
    serviceName = 'was.proxy1'
    hostname = socket.gethostname().split('.')[0]
    nodeName = 'ocs_app_node_%s' % hostname
    cellName = hostname + 'Node01Cell'
    zkPath = '/topology/docs_rp/servers'

    appsRoot = '/opt/ll/apps/docsrp'
    scriptsRoot = '/opt/ll/scripts/docsrp'
    portsFile = appsRoot + '/portdef.properties'
    settingsPropertyFile = appsRoot + '/proxysettings.properties'
    libExtDir = wasDir + '/lib/ext'
    libOptionalDir = wasDir + '/optionalLibraries/IBM/proxy'
    cellConfigDir = wasDir + '/profiles/' + profileName + '/config/cells/' + cellName
    nodeConfigDir = wasDir + '/profiles/' + profileName + '/config/cells/' + cellName + '/nodes/' + nodeName
    serverConfigDir = nodeConfigDir + '/servers' + '/' + serverName
    staticRouteDir = wasDir + '/profiles/' + profileName + '/staticRoutes'

    print 'applications root directory is: %s' % appsRoot
    print 'cell configure directory is: %s' % cellConfigDir
    print 'node configure directory is: %s' % nodeConfigDir
    print 'server configure directory is: %s' % serverConfigDir

    #There is a PMR about pdjrtecfg not working when the WAS jre is added to the classpath. An external jre must be used in the meantime.
    #https://www-304.ibm.com/support/entdocview.wss?uid=swg1IV00477
    path = os.getenv('PATH')
    if path == None:
       print 'Error:  TFIM configuration failed. Unable to add external Java to PATH variable.'
       raise Exception('Unable to retrieve current PATH variable')
    os.putenv('PATH','/opt/ibm/java2-i386-50/jre/bin:%s' % (path))

    #Register IP information with ZooKeeper
    zooKeeperClient = ZooKeeperClient()
    zooKeeperClient.publishRegistrySettings('DocsProxy')
    dmzLib.registerWithZookeeper(zooKeeperClient, zkPath)

    #Read the registry settings
    registryParser = RegistryParser()
    wasUsername = registryParser.getSetting('MiddlewareWebSphere','admin_username')
    wasPassword = registryParser.getSetting('MiddlewareWebSphere','admin_password')

    isDocsMA = registryParser.getSetting('Docs','is_docs_multiactive')
    print 'is Docs multiactive %s' % (isDocsMA)
    routingPolicy = registryParser.getSetting('Docs', 'docsrp_routing_policy')
    print 'Docs routing policy is %s' % (routingPolicy)
    #set redeploy phase with ZooKeeper
    baseTopologyName = registryParser.getBaseTopologyName()
    topologyName = registryParser.getTopologyName()
    if (isDocsMA == "true" or routingPolicy == "dynamic"):
      phasePath = '/' + baseTopologyName + '/data/docs/data/' + topologyName + '/phase'
      zooKeeperClient.setData(phasePath, 'redeploy')
      print 'Set data center/side %s phase to redeploy successfully' % (topologyName)

    # Create profile
    zooKeeperClient.updateActivationStatus('Creating WebSphere Application profile')
    dmzLib.set_was_java8()
    dmzLib.createProfile(wasUsername, wasPassword, nodeName, portsFile, serverName, profileName, wasDir)

    # copy opensaml jar files
    libSamlSrcDir = appsRoot + '/opensaml'
    dmzLib.copyfiles(libSamlSrcDir, libExtDir, '/*.jar')
    # copy plugin jar files
    dmzLib.copyfiles(appsRoot, libOptionalDir, '/*.jar')

    zooKeeperClient.updateActivationStatus('Waiting for MiddlewareTAM...')
    #zooKeeperClient.waitForServerActivation('/topology/policy/servers/1')
    domainName = zooKeeperClient.getSettingByComponent('MiddlewareTAM','virtual_hosts_junction_domain')
    zooKeeperClient.updateActivationStatus('Waiting for MiddlewareTFIM...')
    zooKeeperClient.waitForServerActivation('/topology/tfim/servers/dmgr')
    tfimPassword = zooKeeperClient.getSettingByComponent('MiddlewareTFIM','key_store_password')
    encodedPsw = zooKeeperClient.encodeData(tfimPassword)
    # configure the variables xml
    dmzLib.configureVariableXML(appsRoot, cellConfigDir, domainName, encodedPsw)
    # configure the server xml
    dmzLib.configureServerXML(nodeConfigDir)
    # configure LTPA expiration
    dmzLib.configureSecurityXML(cellConfigDir)
    # get the key store
    dmzLib.importJKS(zooKeeperClient, nodeConfigDir)

    # Import and merge the target tree
    print 'Waiting for activation of Docs servers'
    numDocsNodes = int(registryParser.getSetting('Docs','num_docs_nodes'))
    for i in range(1,numDocsNodes+1):
       docsPath = '/topology/docs/servers/' + str(i)
       print 'Waiting for activation of Docs servers: %s' % (docsPath)
       zooKeeperClient.waitForServerActivation(docsPath)
       docsTargetTreeFile = appsRoot + '/targetTree.xml.' + str(i)
       docsTargetTreeDataPath = '/data/docs/target_trees/' + str(i)
       zooKeeperClient.decodeFileFromNode(docsTargetTreeFile, docsTargetTreeDataPath)

    dmzLib.mergeTargetTree(appsRoot, numDocsNodes)
    print 'Merged targetTree.'

    dmzLib.copyTargetTree(appsRoot, staticRouteDir)
    print 'Copied targetTree.'

    print 'Start to configure proxy settings.'
    dmzLib.configureProxySettingsXML(serverConfigDir, settingsPropertyFile)
    print 'Finish to configure proxy settings.'

    print 'Start to configure cell properties.'
    dmzLib.configureCellXML(cellConfigDir);
    print 'Finish to configure cell properties.'

    # Create service
    zooKeeperClient.updateActivationStatus('Creating WebSphere Application as services')
    dmzLib.createService(wasUsername, wasPassword, serviceName, serverName, profileName, wasDir)

    # Set permission
    zooKeeperClient.updateActivationStatus('Set WebSphere Application directory permission')
    dmzLib.setPermissions(wasDir,serviceUser,serviceGroup)

    # Start service
    zooKeeperClient.updateActivationStatus('Starting WebSphere Application as services')
    dmzLib.startWASService(serviceName)

    # handle SSO
    zooKeeperClient.updateActivationStatus('Starting exchange LTPA')
    primary = dmzLib.setupSSO(zooKeeperClient, registryParser, wasUsername, wasPassword, wasDir, appsRoot, scriptsRoot)
    if primary == 'false':
       dmzLib.stopWASService(serviceName)
       dmzLib.setPermissions(wasDir,serviceUser,serviceGroup)
       dmzLib.startWASService(serviceName)

    # tune JVM and Thread Pool
    zooKeeperClient.updateActivationStatus('Starting to tune JVM and Thread Pool')
    dmzLib.setPermissions(os.path.abspath('..'),serviceUser,serviceGroup)
    dmzLib.tuneJVM(serviceUser,wasUsername,wasPassword,nodeName,serverName)
    dmzLib.tuneThreadPool(serviceUser,wasUsername,wasPassword,nodeName,serverName)
    # restrict ciphers
    dmzLib.restrictCiphers(wasUsername,wasPassword,serverName,nodeName)
    dmzLib.stopWASService(serviceName)
    dmzLib.startWASService(serviceName)

except:
    zooKeeperClient.updateActivationStatus('HCL DocsProxy installation failed','failed')
    raise

#Activate the server in ZooKeeper
print 'Successfully installed Docs DMZ Proxy!!!'
zooKeeperClient.updateActivationStatus('Successfully installed IBMDocsProxy server!')
dmzLib.activateServer(zooKeeperClient,zkPath)
