# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 



def loadTargetTree(args):  
  nodeName, serverName = args[0:2]  
  print 'reloadClusterInformation on mbean StaticClusterMgr...'
  mbean = AdminControl.queryNames('*:*,type=StaticClusterMgr,process=%s' % serverName)
  print AdminControl.invoke(mbean, 'reloadClusterInformation', '')

def printClusterInfo(args):  
  nodeName, serverName = args[0:2]  
  print 'printAllClusterInformation on mbean StaticClusterMgr...'
  mbean = AdminControl.queryNames('*:*,type=StaticClusterMgr,process=%s' % serverName)
  print AdminControl.invoke(mbean, 'printAllClusterInformation', '')

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  nodeName,serverName
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to loadTargetTree."
    sys.exit()
  
  action = ''
  if len(sys.argv) >= 3:
    action = sys.argv[2]
    
  if action == 'status':
    printClusterInfo(sys.argv)
  else:
    loadTargetTree(sys.argv)
  
