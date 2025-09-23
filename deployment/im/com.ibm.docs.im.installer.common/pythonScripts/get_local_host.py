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

hostname = socket.gethostname()
node_ids = _splitlines(AdminConfig.list( 'Node' ))
appNodesStr=''
for node_id in node_ids:
  nodename = getNodeName(node_id)
  nodeType=None
  if not nodeIsIHS(nodename):
    nodehostname = getNodeHostname(nodename)
    if socket.gethostbyname(hostname)== socket.gethostbyname(nodehostname):
      print "LOCAL_HOST::::"+nodehostname
      break;

  