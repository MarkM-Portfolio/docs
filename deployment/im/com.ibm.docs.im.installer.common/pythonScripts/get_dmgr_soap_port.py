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

dmgrServers = listServersOfType('DEPLOYMENT_MANAGER')
if len(dmgrServers)==0:
  print "dmgrNode::::"+"false"
else:
  print "dmgrNode::::"+"true"
  for (dmgrNodename,dmgrServername) in dmgrServers:
    soapEPs=getEndPoint( dmgrNodename, dmgrServername, 'SOAP_CONNECTOR_ADDRESS')
    print "SOAP::::"+ AdminConfig.showAttribute(soapEPs,'port')
    