import sys
from optparse import OptionParser
import urllib2
import platform

if platform.system() == "Windows":
  sys.path.append('/LotusLive/Lib/')
  sys.path.append('Lotus/Live/Lib/nfs')
  from registryLib_win import *
  from zooKeeperLib_win import *
else:
  sys.path.append('/opt/ll/lib/registry')
  from registryLib import *
  sys.path.append('/opt/ll/lib/apache/zookeeper')
  from zooKeeperLib import *

def getDocsStatus(docsServerName, side=None):
  print 'Retrieving status for docs server %s in side %s' % (docsServerName, topology)
  try:
    if (docsServerName == 'all'):
      membersPath = '/%s/data/docs/data/%s/members' % (baseTopology, topology)
      children = zooKeeperClient.getChildNodes(membersPath)
      for node in children:
        getDocsStatus(node, side)
    else:
      statusPath = '/%s/data/docs/data/%s/members/%s/status' % (baseTopology, topology, docsServerName)
      print 'Status path %s : %s' % (statusPath, zooKeeperClient.getData(statusPath))
  except:
    print 'Error happens!'
    raise
    
def setDocsStatus(docsServerName, status, side=None):
  print 'Try to %s docs server %s' % (status, docsServerName)
  try:
    if (docsServerName == 'all'):
      membersPath = '/%s/data/docs/data/%s/members' % (baseTopology, topology)
      children = zooKeeperClient.getChildNodes(membersPath)
      for node in children:
        setDocsStatus(node, status, side)
    else :
      serverPath = '/%s/data/docs/data/%s/members/%s' % (baseTopology, topology, docsServerName)
      statusPath = '/%s/data/docs/data/%s/members/%s/status' % (baseTopology, topology, docsServerName)
      
      print 'Status path is %s' % (statusPath)
      pathExist = zooKeeperClient.pathExists(serverPath)
      if pathExist == 'True':
        zooKeeperClient.setData(statusPath, status)
        if (status == 'inactivating') :
          print 'Wait docs server %s status update' % (docsServerName) 
          while True:
            time.sleep(5)
            print 'Query docs server status...'
            statusData = zooKeeperClient.getData(statusPath)
            if (statusData == 'inactive'):
              # TODO set nodejs inactive
              print 'Successfully Inactive %s!' % (docsServerName)
              return
        statusResult = zooKeeperClient.getData(statusPath)
        if (statusResult == status):
          print 'Successfully %s %s' % (status, docsServerName)
      else:
        print 'Failed! Return directly because path does not exist'
        return 
  except:
    print 'Error happens!'
    raise

def getSideStatus(side):
  print 'Retrieving status for side %s' % (side)
  try:
    statusPath = '/%s/data/docs/data/%s/status' % (baseTopology, topology)
    print 'Status path %s: %s' % (statusPath, zooKeeperClient.getData(statusPath))
  except:
    print 'Error happens!'
    raise
  
def setSideStatus(side, status):
  print 'try to %s side %s' % (status, side)
  try:
    statusPath = '/%s/data/docs/data/%s/status' % (baseTopology, topology)
    print 'Status path is %s' % (statusPath)
    zooKeeperClient.setData(statusPath, status)
    if (status == 'upgrading'):
      print 'Wait side %s status update' % (side)
      while True:
        time.sleep(5)
        print 'Query side status...'
        statusData = zooKeeperClient.getData(statusPath)
        if (statusData == 'inactive'):
          print 'Successfully Inactive side %s' % (side)
          return
    statusResult = zooKeeperClient.getData(statusPath)
    if (statusResult == status):
      print 'Successfully %s side %s' % (status, side)
  except:
    print 'Error happens!'
    raise
  
if __name__ == "__main__":

  print 'Usage'
  print '========================================================================'
  print 'python manageZkNodes.py --action active/inactive/inactivating --node docs1b/all --side B'
  print 'python manageZkNodes.py --action active/inactive/upgrading --side B'
  print 'python manageZkNodes.py --status --node docs1a/all --side A'
  print 'python manageZkNodes.py --status --side A'
  print '========================================================================'
  
  zooKeeperClient = ZooKeeperClient()
  registryParser = RegistryParser()
  
  length = len(sys.argv)
  parser = OptionParser()
  parser.add_option("--action", dest="action", help="Specify the action to the target node.  Example: active, inactive, inactivating, upgrading")
  parser.add_option("--side", dest="side", help="Manage the whole side.  Example:  'B'")
  parser.add_option("--node", dest="node", help="Manage the node.  Example:  'docs1b'")
  parser.add_option("--status", dest="status", action="store_true", help="Check the status.")

  (options, args) = parser.parse_args()   
  
  baseTopology = registryParser.getBaseTopologyName()
  topology = registryParser.getTopologyName()
  side = registryParser.getSide()
  if  ((side == '' or side == None) and options.side ):
    print 'Registry.xml does not define side, you should not pass side option'
    sys.exit(1)
  if options.side :
    side = options.side.upper()
    topology = baseTopology + side
    
  if (side != '' and not re.match("^[A-Z]$", side)):
    print "Side must be a value from a-z."
    sys.exit(2)
    
  try:
    if options.status:
      if options.node:
        getDocsStatus(options.node, side)
      else:
        if options.side:
          getSideStatus(side)
        else:
          print 'Invalid parameters'  
          sys.exit(3)
    if options.action:
      if options.node :
        setDocsStatus(options.node, options.action, side)
      else:
        if options.side :
          setSideStatus(side, options.action)
        else:
          print 'Invalid parameters'
          sys.exit(3)
  except:
    sys.exit(4)
    print 'Failed!'
    
  print 'Successful!'
