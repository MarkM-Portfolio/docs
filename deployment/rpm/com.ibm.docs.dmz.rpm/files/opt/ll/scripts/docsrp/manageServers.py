import sys, os, shutil, subprocess
sys.path.append('/opt/ll/lib/registry')
sys.path.append('/opt/ll/scripts/docsrp')
from xml.dom import minidom
from xml.dom.ext import PrettyPrint
from registryLib import *
from StringIO import StringIO

serverName = 'proxy1'
serviceName = 'was.proxy1'
serviceUser = 'websphere'
serviceGroup = 'websphere'
wasDir = '/opt/IBM/WebSphere/AppServer/profiles/SecureProxySrv01'
targetFile = wasDir + '/staticRoutes/targetTree.xml'
appsRoot = '/opt/ll/apps/docsrp'
cronScriptsRoot = '/opt/ll/scripts/docsrp-cron'
originalTargetFile = appsRoot + '/targetTree.xml'
reloadScriptPath = cronScriptsRoot + '/reloadTargetTree.py'

def __toprettyxml(node, encoding='UTF-8'):
  tmpStream = StringIO()
  PrettyPrint(node, stream=tmpStream, encoding=encoding)
  return tmpStream.getvalue()

def setPermissions(path, username, groupname):
  directory = ''
  for part in path.lstrip('/').rstrip('/').split('/'):
    directory += '/%s' % (part)
    try:
      os.chmod(directory, 0755)
    except:
      print 'Error while attempting to chmod %s directory' % (directory)
      raise
  
  # Recursively chown of the specified path
  p = subprocess.Popen('chown -R %s:%s %s' % (username, groupname, path), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = p.communicate()[0]
  retval = p.returncode
  if retval:
    print 'Warning:  RC %s while attempting to chown %s directory' % (retval, directory)

# Find out the cell name according the server's host name
def findCellByHostName(doc, host_name):
  cell_element = None
  cellElements = doc.getElementsByTagName('cell')
  for cellElement in cellElements:
    cellElementName = cellElement.getAttribute('name')
    nodeElements = cellElement.getElementsByTagName('node')
    for nodeElement in nodeElements:
      propertyElements = nodeElement.getElementsByTagName('property')
      for propertyElement in propertyElements:
        propertyName = propertyElement.getAttribute('name')
        propertyValue = propertyElement.getAttribute('value')
        if propertyName == 'hostName' and ((propertyValue.find(host_name + ".") == 0 and cellElementName.find(host_name) == 0) or propertyValue == host_name):
          print "Found the cell %s according to the host name of Docs server" % cellElementName
          cell_element = cellElement
          break
  return cell_element

def disableServer(host_name):
  try:
    print "Start to disable Docs server: %s..." % host_name
    
    # Load the DOM tree
    doc = minidom.parse(targetFile)
    
    isDisabled = False
    
    # Find the cell name according to the host name of Docs server
    cell_element = findCellByHostName(doc, host_name)
    if cell_element == None:
      print "Did not find the Docs server: %s, so can not disable it\n" % host_name
      return isDisabled
    # check if targetTree.xml only contains one node.
    cellElements = doc.getElementsByTagName('cell')
    if len(cellElements) == 1:
      print "######## There is only one node in targetTree.xml: %s, so can not disable it. ########" % host_name
      return False    	  
    cell_name = cell_element.getAttribute('name')
    
    # Find the server links those not being disabled
    serverLinks = []
    linkElements = doc.getElementsByTagName('link')
    for linkElement in linkElements:
      link_name = linkElement.getAttribute('name')
      if link_name.find('server/server1') != -1:
        print "Found the server link %s" % link_name
        linkElement.parentNode.removeChild(linkElement)
        if link_name.find(cell_name) == -1:
          serverLinks.append(linkElement)
        else:
          isDisabled = True
          print "Remove the server link %s" % link_name
    
    # Remove the cell
    cellElements = doc.getElementsByTagName('cell')
    for cellElement in cellElements:
      cellElementName = cellElement.getAttribute('name')
      if cellElementName == cell_name:
        cellElement.parentNode.removeChild(cellElement)
        print "Remove the cell %s" % cell_name
    
    # Add the server links those not being removed to target tree xml file
    cellElements = doc.getElementsByTagName('cell')
    if len(cellElements) > 0:
      cellElement = cellElements[0]
      clusterElements = cellElement.getElementsByTagName('cluster')
      clusterElement = clusterElements[0]
      
      targetNode = None
      childNodes = clusterElement.childNodes
      for childNode in childNodes:
        if childNode.nodeType == minidom.Node.COMMENT_NODE and childNode.nodeValue.find('webModule section') != -1:
          targetNode = childNode
          break
      if targetNode == None:
        targetNode = clusterElement.getElementsByTagName('link')[0]
      
      if targetNode != None:
        for serverLink in serverLinks:
          clusterElement.insertBefore(serverLink, targetNode)
      else:
        print 'Error:  Did not find the target node.'
        raise
    else:
      # Warn the user with the current number of docs nodes
      print "Error: No server exists after this operation. Totally there are %s docs nodes" % get_num_docs_nodes()	
    f = open(targetFile, 'w')
    f.write(__toprettyxml(doc))
    f.close()
    
    setPermissions(targetFile, serviceUser, serviceGroup)
    
    if isDisabled:
      print "Finish to disable Docs server: %s!!!\n" % host_name
    else:
      print "Did not find the Docs server %s!!!\n" % host_name
    
    return isDisabled
  except:
    print 'Error:  Failed to disable Docs server.'
    raise

def enableServer(host_name):
  try:
    print "Start to enable Docs server: %s." % host_name
    
    isEnabled = False
    
    org_doc = minidom.parse(originalTargetFile)
    doc = minidom.parse(targetFile)
    
    cellGroupElement = doc.getElementsByTagName('cellGroup')[0]
    
    # Check if the cell exists or not
    cell_element = findCellByHostName(doc, host_name)
    if cell_element != None:
      print "The Docs server %s was enabled already\n" % host_name
      return isEnabled
    
    # Add the cell of specified Docs server into the target tree xml file
    cell_element = findCellByHostName(org_doc, host_name)
    if cell_element == None:
      print "Did not find the Docs server: %s\n" % host_name
      return False
    cell_name = cell_element.getAttribute('name')
    
    # Find out the server link from the original target tree xml file and remove other server links
    orgServerLink = None
    orgLinkElements = org_doc.getElementsByTagName('link')
    for orgLinkElement in orgLinkElements:
      org_link_name = orgLinkElement.getAttribute('name')
      if org_link_name.find('server/server1') != -1:
        orgLinkElement.parentNode.removeChild(orgLinkElement)
      if org_link_name.find('server/server1') != -1 and org_link_name.find(cell_name) != -1:
        isEnabled = True
        orgServerLink = orgLinkElement
        print "Found the server link %s from original target tree xml file" % org_link_name
        break
    
    # Append the cell to target tree xml file
    cellGroupElement.appendChild(cell_element)
    
    # Add the server link of specified Docs server into the target tree xml file
    if orgServerLink != None:
      cellElement = doc.getElementsByTagName('cell')[0]
      clusterElement = cellElement.getElementsByTagName('cluster')[0]
      serverLinks = clusterElement.getElementsByTagName('link')
      
      targetNode = None
      for childNode in clusterElement.childNodes:
        if childNode.nodeType == minidom.Node.COMMENT_NODE and childNode.nodeValue.find('webModule section') != -1:
          targetNode = childNode
          break
      if targetNode == None:
        targetNode = clusterElement.getElementsByTagName('link')[0]
      
      isExist = False
      orgLinkName = orgServerLink.getAttribute('name')
      for serverLink in serverLinks:
        linkName = serverLink.getAttribute('name')
        if linkName == orgLinkName:
          print "The server link %s exists already" % orgLinkName
          isExist = True
      
      if not isExist:
        clusterElement.insertBefore(orgServerLink, targetNode)
        print "Add server link %s into target tree file" % orgLinkName
    
    f = open(targetFile, 'w')
    f.write(__toprettyxml(doc))
    f.close()
    
    setPermissions(targetFile, serviceUser, serviceGroup)
    
    print "Finish to enable Docs server: %s!!!\n" % host_name
    
    return isEnabled
  except:
    print 'Error:  Failed to parse targetTree file.'
    raise

def printClusterInfo():
  try:
    print 'Start to print the Docs server information'
    
    registryParser = RegistryParser()
    wasUsername = registryParser.getSetting('MiddlewareWebSphere','admin_username')
    wasPassword = registryParser.getSetting('MiddlewareWebSphere','admin_password')
    
    setPermissions(reloadScriptPath, serviceUser, serviceGroup)
    
    #cmd = ['sudo -u %s %s/bin/wsadmin.sh' % (serviceUser,wasDir), '-lang', 'jython', '-user', wasUsername, '-password', wasPassword, '-f', reloadScriptPath, 'node', serverName]
    cmd = ['su -c "%s/bin/wsadmin.sh' % (wasDir), '-lang', 'jython', '-user', wasUsername, '-password', wasPassword, '-f', reloadScriptPath, 'node', serverName, "status", '"',serviceUser]
    
    p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    
    isSuccess = False
    for line in p.stdout.readlines():
      if line.strip('\n').find("true") != -1:
        isSuccess = True
    retval = p.wait()
    if not isSuccess:
      print 'Failed to print the Docs servers information: %s' % retval 
    else:
      print 'Finish to print the Docs servers information'
  except:
    print 'Error: Failed to print TargetTree'
    raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))
  
def reloadTargetTree():
  try:
    print 'Start to reload the Docs servers information'
    
    registryParser = RegistryParser()
    wasUsername = registryParser.getSetting('MiddlewareWebSphere','admin_username')
    wasPassword = registryParser.getSetting('MiddlewareWebSphere','admin_password')
    
    setPermissions(reloadScriptPath, serviceUser, serviceGroup)
    
    #cmd = ['sudo -u %s %s/bin/wsadmin.sh' % (serviceUser,wasDir), '-lang', 'jython', '-user', wasUsername, '-password', wasPassword, '-f', reloadScriptPath, 'node', serverName]
    cmd = ['su -c "%s/bin/wsadmin.sh' % (wasDir), '-lang', 'jython', '-user', wasUsername, '-password', wasPassword, '-f', reloadScriptPath, 'node', serverName,'"',serviceUser]
    
    p = subprocess.Popen(' '.join(cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    
    isSuccess = False
    for line in p.stdout.readlines():
      if line.strip('\n').find("true") != -1:
        isSuccess = True
    retval = p.wait()
    if not isSuccess:
      print 'Failed to reload the Docs servers information: %s' % retval 
    else:
      print 'Finish to reload the Docs servers information'
  except:
    print 'Error: Failed to reload TargetTree'
    raise Exception("Exception: %s %s" % (sys.exc_type, sys.exc_value))

def restartService():
  print 'Begin to restart %s service...' % (serviceName)
  try:
    p = subprocess.Popen('/sbin/service %s stop' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr = subprocess.STDOUT)
    output = p.communicate()[0]
    if p.returncode:
      print 'Warning: RC %s while stop service %s.  Ignoring since the WebSphere service status implementation is often inaccurate...' % (p.returncode,serviceName)
    
    p = subprocess.Popen('/sbin/service %s start' % (serviceName), shell=True, stdout=subprocess.PIPE, stderr = subprocess.STDOUT)
    output = p.communicate()[0]
    if p.returncode:
      raise Exception('RC %s while starting service %s' % (p.returncode, serviceName))
  except:
    print 'Error: Unable to restart service %s' % (serviceName)
    raise
  print 'Restart %s service successfully!!!' % (serviceName)
  
def get_num_docs_nodes():
  registryParser = RegistryParser()	
  num_docs_nodes = registryParser.getSetting('Docs','num_docs_nodes')
  return num_docs_nodes

if __name__ == "__main__":
  #arg list: manageServers.py [-disable {host1} {host2}] [-enable {host3} {host4}]
  
  length = len(sys.argv)
  if len(sys.argv) < 2:
    print 'Invalid Arguments for manageServers.py, for example: manageServers.py -disable host1 host2 -enable host3 host4'
    sys.exit()
  
  shouldReloadTree = False
  isRestartService = False  
  isBlockDisable = False
  
  node_count = get_num_docs_nodes()
  print "Totally there are %s docs nodes in this environment." % node_count

  # operationType = 0, do nothing; operationType = 1, disable Docs servers; operationType = 2, enable Docs servers
  operationType = 0
  for index in range(1, length):
    argument = sys.argv[index]
    if argument == "-status":
      printClusterInfo()
    elif argument == "-disable":
      operationType = 1
    elif argument == "-enable":
      operationType = 2
    elif argument == "-restart":
      isRestartService = True
    else:
      if operationType == 1:
        # Disable server
        ret = disableServer(argument)
        if ret == True:
          shouldReloadTree = True
        else:
          shouldReloadTree = False 		  
          isBlockDisable = True
      elif operationType == 2:
        # Enable server
        enableServer(argument)
        shouldReloadTree = True
      else:
        print "Invalid Arguments for manageServers.py, for example: manageServers.py -disable host1 host2 -enable host3 host4"
        sys.exit()
  if shouldReloadTree:
    if isRestartService:
      restartService()
    else:
      reloadTargetTree()
  elif isBlockDisable == True:
    print "######## Failed to execute operation. Please check the log for the root cause. ########"

