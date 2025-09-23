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

def get_clusters(args):
  cellname = getCellName()
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
  
if __name__ == "__main__":  
  if len(sys.argv) < 1:
    print "Exception: invalid arguments"
    sys.exit()
  
  get_clusters(sys.argv)

#ClusterInfo::::app:::cluster::node,server:node,server:node,server;
