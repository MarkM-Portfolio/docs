import socket
def _splitlist(s):
    """Given a string of the form [item item item], return a list of strings, one per item.
    WARNING: does not yet work right when an item has spaces.  I believe in that case we'll be
    given a string like '[item1 "item2 with spaces" item3]'.
    """
    if s[0] != '[' or s[-1] != ']':
        raise "Invalid string: %s" % s
    return s[1:-1].split(' ')

def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv

def getObjectsOfType(typename, scope = None):
    """Return a python list of objectids of all objects of the given type in the given scope
    (another object ID, e.g. a node's object id to limit the response to objects in that node)
    Leaving scope default to None gets everything in the Cell with that type.
    ALWAYS RETURNS A LIST EVEN IF ONLY ONE OBJECT.
    """
    m = "getObjectsOfType:"
    if scope:
        #sop(m, "AdminConfig.list(%s, %s)" % ( repr(typename), repr(scope) ) )
        return _splitlines(AdminConfig.list(typename, scope))
    else:
        #sop(m, "AdminConfig.list(%s)" % ( repr(typename) ) )
        return _splitlines(AdminConfig.list(typename))

def getCellName():
    """Return the name of the cell we're connected to"""
    # AdminControl.getCell() is simpler, but only
    # available if we're connected to a running server.
    cellObjects = getObjectsOfType('Cell')  # should only be one
    cellname = getObjectAttribute(cellObjects[0], 'name')
    return cellname

def getObjectByNodeAndName( nodename, typename, objectname ):
    """Get the config object ID of an object based on its node, type, and name"""
    # This version of getObjectByName distinguishes by node,
    # which should disambiguate some things...
    node_id = getNodeId(nodename)
    all = _splitlines(AdminConfig.list( typename, node_id ))
    result = None
    for obj in all:
        name = AdminConfig.showAttribute( obj, 'name' )
        if name == objectname:
            if result != None:
                raise "FOUND more than one %s with name %s" % ( typename, objectname )
            result = obj
    return result

def getServerId(nodename,servername):
    """Return the config id for a server or proxy.  Could be an app server or proxy server, etc"""
    id = getObjectByNodeAndName(nodename, "Server", servername) # app server
    if id == None:
        id = getObjectByNodeAndName(nodename, "ProxyServer", servername)
    return id
    
def getNodeId( nodename ):
    """Given a node name, get its config ID"""
    return AdminConfig.getid( '/Cell:%s/Node:%s/' % ( getCellName(), nodename ) )

def getEndPoint( nodename, servername, endPointName):
    """Find an endpoint on a given server with the given endpoint name and return endPoint object config ID"""
    node_id = getNodeId(nodename)
    if node_id == None:
        raise "Could not find node: name=%s" % nodename
    server_id = getServerId(nodename, servername)
    if server_id == None:
        raise "Could not find server: node=%s name=%s" % (nodename,servername)
    serverEntries = _splitlines(AdminConfig.list( 'ServerEntry', node_id ))

    serverName = AdminConfig.showAttribute( server_id, "name" )

    for serverEntry in serverEntries:
        #print "serverEntry: %s" % serverEntry
        sName = AdminConfig.showAttribute( serverEntry, "serverName" )
        #print "looking at server %s" % sName
        if sName == serverName:
            specialEndPoints = AdminConfig.showAttribute( serverEntry, "specialEndpoints" )
            # that returned a string like [ep1 ep2 ep3], sigh - strip the
            # [] and split on ' '
            specialEndPoints = specialEndPoints[1:len( specialEndPoints )-1].split( " " )
            #print "specialEndPoints=%s" % repr(specialEndPoints)

            for specialEndPoint in specialEndPoints:
                endPointNm = AdminConfig.showAttribute( specialEndPoint, "endPointName" )
                #print "endPointNm=%s" % endPointNm
                if endPointNm == endPointName:
                    #print "serverEntry = %s" % serverEntry
                    return AdminConfig.showAttribute( specialEndPoint, "endPoint" )
    # Don't complain - caller might anticipate this and handle it
    #print "COULD NOT FIND END POINT '%s' on server %s" % ( endPointName, serverName )
    return None
    
def nodeHasServerOfType( nodename, servertype ):
    node_id = getNodeId(nodename)
    serverEntries = _splitlines(AdminConfig.list( 'ServerEntry', node_id ))
    for serverEntry in serverEntries:
        sType = AdminConfig.showAttribute( serverEntry, "serverType" )
        if sType == servertype:
            return 1
    return 0

def nodeIsDmgr( nodename ):
    """Return true if the node is the deployment manager"""
    return nodeHasServerOfType( nodename, 'DEPLOYMENT_MANAGER' )
    
def getObjectAttribute(objectid, attributename):
    """Return the value of the named attribute of the config object with the given ID.
    If there's no such attribute, returns None.
    If the attribute value looks like a list, converts it to a real python list.
    TODO: handle nested "lists"
    """
    #sop("getObjectAttribute:","AdminConfig.showAttribute(%s, %s)" % ( repr(objectid), repr(attributename) ))
    result = AdminConfig.showAttribute(objectid, attributename)
    if result != None and result.startswith("[") and result.endswith("]"):
        # List looks like "[value1 value2 value3]"
        result = _splitlist(result)
    return result

def getNodeName(node_id):
    """Get the name of the node with the given config object ID"""
    return getObjectAttribute(node_id, 'name')

def listServersOfType(typename):
    """return a list of servers of a given type as a list of lists.
    E.g. [['nodename','proxyname'], ['nodename','proxyname']].
    Typical usage:
    for (nodename,servername) in listServersOfType('PROXY_SERVER'):
        callSomething(nodename,servername)
    Set typename=None to return all servers.
        """
    # Go through one node at a time - can't figure out any way to
    # find out what node a server is in from the Server or ServerEntry
    # object
    result = []
    node_ids = _splitlines(AdminConfig.list( 'Node' ))
    cellname = getCellName()
    for node_id in node_ids:
        nodename = getNodeName(node_id)
        serverEntries = _splitlines(AdminConfig.list( 'ServerEntry', node_id ))
        for serverEntry in serverEntries:
            sName = AdminConfig.showAttribute( serverEntry, "serverName" )
            sType = AdminConfig.showAttribute( serverEntry, "serverType" )
            if typename == None or sType == typename:
                result.append([nodename, sName])
    return result
    
def getNodeVariable(nodename, varname):
    """Return the value of a variable for the node -- or None if no such variable or not set"""
    vmaps = _splitlines(AdminConfig.list('VariableMap', getNodeId(nodename)))
    if 0 < len(vmaps):  # Tolerate nodes with no such maps, for example, IHS nodes.
        map_id = vmaps[-1] # get last one
        entries = AdminConfig.showAttribute(map_id, 'entries')
        # this is a string '[(entry) (entry)]'
        entries = entries[1:-1].split(' ')
        for e in entries:
            name = AdminConfig.showAttribute(e,'symbolicName')
            value = AdminConfig.showAttribute(e,'value')
            if name == varname:
                return value
    return None
    
def getWasInstallRoot(nodename):
    """Return the absolute path of the given node's WebSphere installation"""
    return getNodeVariable(nodename, "WAS_INSTALL_ROOT")
    
def nodeIsIHS( nodename ):
    """Returns true if the node is IHS."""
    # Note: This method queries whether variable WAS_INSTALL_ROOT is defined.
    # This is a weak technique for identifying an IHS node.
    # Hopefully a more robust mechanism can be found in the future.
    return None == getWasInstallRoot(nodename)
    
def listAppServerNodes():
    """Returns a list of nodes excluding dmgr and IHS nodes"""
    m = "listAppServerNodes:"
    node_ids = _splitlines(AdminConfig.list( 'Node' ))
    result = []
    for node_id in node_ids:
        nodename = getNodeName(node_id)
        if not nodeIsDmgr(nodename) and not nodeIsIHS(nodename):
            result.append(nodename)
    if 0 == len(result):
        sop(m,"Warning. No non-manager/non-IHS nodes are defined!!!")
    return result

def getNodeHostname(nodename):
    """Get the hostname of the named node"""
    return AdminConfig.showAttribute(getNodeId(nodename),'hostName')

def listServerClusters():
    """Return list of names of server clusters"""
    cluster_ids = _splitlines(AdminConfig.list( 'ServerCluster' ))
    cellname = getCellName()
    result = []
    for cluster_id in cluster_ids:
        result.append(AdminConfig.showAttribute(cluster_id,"name"))
    return result

def listServersInCluster(clusterName):
    """Return a list of all servers (members) that are in the specified cluster"""
    #m = "listServersInCluster:"
    #sop(m,"clusterName = %s" % clusterName)
    clusterinfo=[]
    clusterId = AdminConfig.getid("/ServerCluster:" + clusterName + "/")
    clusterMembers = _splitlines(AdminConfig.list("ClusterMember", clusterId ))
    for clusterMember in clusterMembers:
      nodeName = AdminConfig.showAttribute( clusterMember, "nodeName" )
      serverName = AdminConfig.showAttribute( clusterMember, "memberName" )
      clusterinfo.extend([','.join([nodeName,serverName])])
        
    return clusterinfo
    
def get_deployment_evn_info(args):  
  #check whether dmgr env and get dmgr SOAP port
  dmgrServers = listServersOfType('DEPLOYMENT_MANAGER')
  if len(dmgrServers)==0:
    print "dmgrNode::::"+"false"
  else:
    print "dmgrNode::::"+"true"
  for (dmgrNodename,dmgrServername) in dmgrServers:
    soapEPs=getEndPoint( dmgrNodename, dmgrServername, 'SOAP_CONNECTOR_ADDRESS')
    print "SOAP::::"+ AdminConfig.showAttribute(soapEPs,'port')
  
  #get node host info
  node_ids = _splitlines(AdminConfig.list( 'Node' ))
  appNodesStr=''
  for node_id in node_ids:
    nodename = getNodeName(node_id)
    user_install_root = getNodeVariable(nodename, "USER_INSTALL_ROOT")
    was_install_root = getNodeVariable(nodename, "WAS_INSTALL_ROOT")
    nodeType=None    
    if nodeIsDmgr(nodename):
      nodeType = 'DEPLOYMENT_MANAGER'
    elif nodeIsIHS(nodename):
      nodeType = 'WEB_SERVER'
      user_install_root = " "
      was_install_root = " "
      webServers = listServersOfType('WEB_SERVER')      
      for (wNodename,wServername) in webServers:
        if nodename==wNodename:
          was_install_root = "::".join([was_install_root,wServername])
          break;
    else:
      nodeType = 'APPLICATION_SERVER'
      webServers = listServersOfType('WEB_SERVER')      
      for (wNodename,wServername) in webServers:
        if nodename==wNodename:
          websrv_hostname = getNodeHostname(nodename)
          websrv_ostype = AdminTask.getNodePlatformOS('[-nodeName %s]' % nodename)
          websrv_node_host = '::'.join([websrv_hostname,websrv_ostype,'WEB_SERVER',nodename,' ',' ',wServername])
          if appNodesStr=='':
            appNodesStr = ''.join([appNodesStr,websrv_node_host])
          else:
            appNodesStr = ';'.join([appNodesStr,websrv_node_host])
          
          break
      
    hostname = getNodeHostname(nodename)
    ostype = AdminTask.getNodePlatformOS('[-nodeName %s]' % nodename)        
    node_host = '::'.join([hostname,ostype,nodeType,nodename,user_install_root,was_install_root])
    if appNodesStr=='':
      appNodesStr = ''.join([appNodesStr,node_host])
    else:
      appNodesStr = ';'.join([appNodesStr,node_host])

  if len(node_ids)>0:
    print "NODE_HOST::::"+appNodesStr

  #get cluster info for given apps
  cellname = getCellName()
  #get cellname
  print "CellName::::"+cellname
  returnValue="ClusterInfo::::"
  nCount = 1;
  for app in args:
    clusters = listServerClusters()
    for cluster in clusters:      
      clusterQuery = "WebSphere:cell=%s,cluster=%s" % (cellname,cluster)      
      applications = _splitlines(AdminApp.list(clusterQuery))
      if app in applications:
        clusterServers = listServersInCluster(cluster)
        servers = None
        if len(clusterServers) > 0:
          servers = ':'.join(clusterServers)
        if nCount==1:
          returnValue = returnValue + app + ":::" + cluster          
        else:
          returnValue = returnValue + ";" + app + ":::" + cluster
        if servers:
          returnValue = returnValue + "::" + servers
        nCount=nCount + 1
        break
  if nCount > 1:
    print returnValue
  
  #get local host info
  hostname = socket.gethostname()
  #node_ids = _splitlines(AdminConfig.list( 'Node' ))
  appNodesStr=''
  for node_id in node_ids:
    nodename = getNodeName(node_id)
    nodeType=None
    if not nodeIsIHS(nodename):
      nodehostname = getNodeHostname(nodename)
      if socket.gethostbyname(hostname)== socket.gethostbyname(nodehostname):
        print "LOCAL_HOST::::"+nodehostname
        break;
  
  #detect whether IC is deployed in the same cell
  SameCell4IC = None
  clusterQuery = "WebSphere:cell=%s" % (cellname)      
  applications = _splitlines(AdminApp.list(clusterQuery))
  if 'Files' in applications:
    SameCell4IC = 'true'
    print "SameCellWithIC::::" + 'true'
  else:
    print "SameCellWithIC::::" + 'false'      
  
  if not SameCell4IC:
    "ICServices::::" + 'Files:false'
    "ICServices::::" + 'Common:false'
    "ICServices::::" + 'News:false'
    return
    
  #detect whether IC services are available, such as Files,Common,News
  appFiles = AdminControl.completeObjectName('type=Application,name=%s,*' % 'Files')
  appCommon = AdminControl.completeObjectName('type=Application,name=%s,*' % 'Common')
  appNews = AdminControl.completeObjectName('type=Application,name=%s,*' % 'News')
  icServices = "ICServices::::"
  if appFiles:
    icServices = icServices + 'Files:true'    
  else:
    icServices = icServices + 'Files:false'  

  if appCommon:
    icServices = icServices + ';' + 'Common:true'    
  else:
    icServices = icServices + ';' + 'Common:false'
  
  if appNews:
    icServices = icServices + ';' + 'News:true'    
  else:
    icServices = icServices + ';' + 'News:false'
  
  print icServices

if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  #app list
  get_deployment_evn_info(sys.argv)

#dmgrNode::::false/true
#SOAP::::8879
#NODE_HOST::::hostname::ostype::nodetype::nodename::USER_INSTALL_ROOT::WAS_INSTALL_ROOT;
#CellName::::cellname
#ClusterInfo::::app:::cluster::node,server:node,server:node,server;
#LOCAL_HOST::::nodehostname
#SameCellWithIC::::true/false
#ICServices::::Files:false/true;Common:false/true;News:false/true