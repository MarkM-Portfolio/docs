(False,True)=(0,1)
import time

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

def getNodeId( nodename ):
    """Given a node name, get its config ID"""
    return AdminConfig.getid( '/Cell:%s/Node:%s/' % ( getCellName(), nodename ) )
    
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

def getNodeName(node_id):
    """Get the name of the node with the given config object ID"""
    return getObjectAttribute(node_id, 'name')
    
def listNodes():
    """Return list of node names, excluding the dmgr node.
       Beware, this list will include any existing IHS nodes."""
    m = "listNodes:"
    node_ids = _splitlines(AdminConfig.list( 'Node' ))
    result = []
    for node_id in node_ids:
        nodename = getNodeName(node_id)
        if not nodeIsDmgr(nodename):
            result.append(nodename)
    #if 0 == len(result):
    #    sop(m,"Warning. No non-manager nodes are defined!!!")
    return result
    
def whatEnv():
    """Returns 'nd' if connected to a dmgr, 'base' if connected to
    an unmanaged server, and 'other' if connected to something else
    (which shouldn't happen but could)"""
    m = "whatEnv:"

    # Simpler version - should work whether connected or not
    servers = getObjectsOfType('Server')
    for server in servers:
        servertype = getObjectAttribute(server, 'serverType')
        if servertype == 'DEPLOYMENT_MANAGER':
            return 'nd'  # we have a deployment manager
    return 'base'  # no deployment manager, must be base

def nodeIsUnmanaged( nodename ):
    """Return true if the node is an unmanaged node."""
    return not nodeHasServerOfType( nodename, 'NODE_AGENT' )
        
def syncall():
    """Sync config to all nodes - return 0 on success, non-zero on error"""
    m = "wsadminlib.syncall"

    if whatEnv() == 'base':
        #sop(m,"WebSphere Base, not syncing")
        return 0

    #sop(m, "Start")

    returncode = 0

    nodenames = listNodes()
    for nodename in nodenames:
        # Note: listNodes() doesn't include the dmgr node - if it did, we'd
        # have to skip it
        # We do, however, have to skip unmanaged nodes.  These will show up
        # when there is a web server defined on a remote machine.
        if not nodeIsDmgr( nodename ) and not nodeIsUnmanaged( nodename ):
            #sop(m,"Sync config to node %s" % nodename)
            Sync1 = AdminControl.completeObjectName( "type=NodeSync,node=%s,*" % nodename )
            if Sync1:
                rc = AdminControl.invoke( Sync1, 'sync' )
                if rc != 'true':  # failed
                    #sop(m,"Sync of node %s FAILED" % nodename)
                    returncode = 1
            else:
                #sop(m,"WARNING: was unable to get sync object for node %s - is node agent running?" % nodename)
                returncode = 2
    #if returncode != 0:
    #    sop(m,"Syncall FAILED")
    #sop(m,"Done")
    return returncode

def saveAndSync():
    """Save config changes and sync them - return 0 on sync success, non-zero on failure"""
    m = "save:"
    #sop(m, "AdminConfig.queryChanges()")
    changes = _splitlines(AdminConfig.queryChanges())
    #for change in changes:
        #sop(m, "  "+change)
    rc = 0;
    #sop(m, "AdminConfig.getSaveMode()")
    mode = AdminConfig.getSaveMode()
    #sop(m, "  "+mode)
    #sop(m, "AdminConfig.save()")
    AdminConfig.save()
    #sop(m, "  Save complete!")
    rc = syncall()
    return rc

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

def createCluster( is_proxy, cellname, clustername):
    """Create a new cluster without a cluster member. Return its id.
    If createReplicationDomain is True, create a replication domain for it."""
    m = "createCluster:"
    #sop(m,"Entry. cellname=%s clustername=%s createReplicationDomain=%s" % ( cellname, clustername, createReplicationDomain ))
    if is_proxy == 1:
      return AdminTask.createCluster('[-clusterConfig [-clusterName %s -clusterType PROXY_SERVER]]' % clustername)
    else:    
      return AdminTask.createCluster('[-clusterConfig [-clusterName %s]]' % clustername)

def createServerInCluster( is_proxy, clustername, nodename, servername, server_no):
    """Create a new server in a cluster, return its id.
    Turn on session replication if sessionReplication is True"""
    m = "createServerInCluster:"
    #sop(m,"Entry. clustername=%s nodename=%s servername=%s sessionReplication=%s" % ( clustername, nodename, servername, sessionReplication ))
    if is_proxy == 1:
      #sop(m,'Calling AdminTask.createClusterMember([-clusterName %s -memberConfig[-memberNode %s -memberName %s -memberWeight 2 -replicatorEntry true]])' % (clustername,nodename,servername))
      print "Proxy Server Name:"
      print servername
      print "Proxy Server number:"
      print server_no
      if server_no == 1:
        return AdminTask.createClusterMember('[-clusterName %s -memberConfig [-memberNode %s -memberName %s -genUniquePorts true] -firstMember [-templateName proxy_server_foundation -nodeGroup DefaultNodeGroup -coreGroup DefaultCoreGroup]]' % (clustername,nodename,servername))
      else:
        return AdminTask.createClusterMember('[-clusterName %s -memberConfig [-memberNode %s -memberName %s -genUniquePorts true]]' % (clustername,nodename,servername))
    else:
      #sop(m,'Calling AdminTask.createClusterMember([-clusterName %s -memberConfig[-memberNode %s -memberName %s -memberWeight 2]])' % (clustername,nodename,servername))
      return AdminTask.createClusterMember('[-clusterName %s -memberConfig[-memberNode %s -memberName %s -memberWeight 2]]' % (clustername,nodename,servername))

def getObjectByName( typename, objectname ):
    """Get an object of a given type and name - WARNING: the object should be unique in the cell; if not, use getObjectByNodeAndName instead."""
    all = _splitlines(AdminConfig.list( typename ))
    result = None
    for obj in all:
        name = AdminConfig.showAttribute( obj, 'name' )
        if name == objectname:
            if result != None:
                raise "FOUND more than one %s with name %s" % ( typename, objectname )
            result = obj
    return result

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
        
def getServerClusterByName( name ):
    """Return the config object id for the named server cluster
    TODO: get rid of either this or getClusterId"""
    return getObjectByName( 'ServerCluster', name )

def stopCluster( clustername ):
    """Stop the named server cluster"""
    m = "stopCluster:"
    #sop(m,"Stop cluster %s" % clustername)
    cellname = getCellName()    # e.g. 'poir1Cell01'
    cluster = AdminControl.completeObjectName( 'cell=%s,type=Cluster,name=%s,*' % ( cellname, clustername ) )
    state = AdminControl.getAttribute( cluster, 'state' )
    if state != 'websphere.cluster.partial.stop' and state != 'websphere.cluster.stopped':
        AdminControl.invoke( cluster, 'stop' )
    # Wait for it to stop
    maxwait = 300  # wait about 5 minutes at most
    count = 0
    #sop(m,"wait for cluster %s to stop" % clustername)
    while state != 'websphere.cluster.stopped':
        time.sleep( 30 )
        state = AdminControl.getAttribute( cluster, 'state' )
        #sop(m,"state of %s: %s" % ( clustername, state ))
        count += 1
        if count > ( maxwait / 30 ):
            #sop(m,"Giving up")
            break
            
def deleteServerClusterByName( name ):
    """Delete the named server cluster"""
    m = "deleteServerClusterByName:"
    sid = getServerClusterByName( name )
    if not sid:
        raise m + " Could not find cluster %s to delete" % name
    stopCluster( name )
    #sop(m,"remove cluster: %s" % name)
    AdminConfig.remove( sid )
        
def create_server(args):
  type,clustername,nodename,servername = args
  cellname=getCellName()
  if cellname:
    if getServerId(nodename,servername):
      print "ExistedServer::::"+servername
    else:
      ret = createServerInCluster(false, clustername,nodename,servername, 1)
      if ret:
        print "CreatedServer::::"+servername
      else:
        print "CreatedServer::::None"
  else:
    print "CreatedServer::::None"
  
  saveAndSync()
  
def create_cluster(args):
  type,clustername=args
  cellname=getCellName()
  if cellname:
    if getServerClusterByName(clustername):
      print "ExistedCluster::::"+clustername
    else:
      ret = createCluster(cellname,clustername)
      if ret:
        print "CreatedCluster::::"+clustername
      else:
        print "CreatedCluster::::None"
  else:
    print "CreatedCluster::::None"
  
  saveAndSync()

def create_cluster_server(args):
  type,clusterserver=args
  is_proxy = 0
  cellname=getCellName()
  #clustername::::nodename::servername:::nodename::servername;clustername::::nodename::servername:::nodename::servername;
  print clusterserver
  clustersInfo = clusterserver.split(';')
  print clustersInfo
  if clustersInfo[0] != "__None__":
    for c in clustersInfo[0].split(":"):
      if getServerClusterByName(c):
        deleteServerClusterByName(c)

  clustersInfo = clustersInfo[1:]

  for clusterInfo in clustersInfo:
    cluster = clusterInfo.split('::::')
    print cluster
    if cluster[0] == '__is_proxy__':
      is_proxy = 1
      cluster = cluster[1:]
    else:
      is_proxy = 0
    if cellname and len(cluster) > 0:
      if getServerClusterByName(cluster[0]):
        print "ExistedCluster::::"+cluster[0]
        deleteServerClusterByName(cluster[0])
      #else:
      ret = createCluster(is_proxy, cellname,cluster[0])
      print cluster[0]
      print ret
      if ret:
        print "CreatedCluster::::"+cluster[0]
      else:
        print "CreatedCluster::::None"
      
      nodes_servers = cluster[1].split(':::')
      print nodes_servers
      server_no = 0
      for node_server in nodes_servers:
        server_no = server_no + 1
        nodeServer = node_server.split('::')
        print nodeServer
        if getServerId(nodeServer[0],nodeServer[1]):
          print "ExistedServer::::"+nodeServer[1]
        else:
          ret = createServerInCluster(is_proxy, cluster[0],nodeServer[0],nodeServer[1], server_no)
          if ret:
            print "CreatedServer::::"+nodeServer[1]
          else:
            print "CreatedServer::::None"
      
    else:
      print "CreatedCluster::::None"
  
  saveAndSync()

def create_node(args):
  print "Action::::None"

if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  
  type = sys.argv[0]
  if type.lower() == 'clusterserver':
    create_cluster_server(sys.argv)
  elif type.lower()== 'cluster':
    create_cluster(sys.argv)
  elif type.lower()== 'server':
    create_server(sys.argv)
  elif type.lower()== 'node':
    create_server(sys.argv)
  else:
    print "Action::::None"
  
  