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
      
def getNodeId( nodename ):
    """Given a node name, get its config ID"""
    return AdminConfig.getid( '/Cell:%s/Node:%s/' % ( getCellName(), nodename ) )

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

def get_node_variable(args):
  nodename,varname=args
  varValue = getNodeVariable(nodename,varname)
  if varValue:
    print "VariableValue::::"+varValue
  else:
    print "VariableValue::::None"

if __name__ == "__main__":  
  if len(sys.argv) < 2:
    print "Exception: invalid arguments"
    sys.exit()
  #nodename/varname
  get_node_variable(sys.argv)
  