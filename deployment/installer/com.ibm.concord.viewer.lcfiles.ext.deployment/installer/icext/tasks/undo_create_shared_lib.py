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

def _splitlines(s):
  rv = [s]
  if '\r' in s:
    rv = s.split('\r\n')
  elif '\n' in s:
    rv = s.split('\n')
  if rv[-1] == '':
    rv = rv[:-1]
  return rv
  
def deleteSharedLibraryReference(sharedLibraryName, appName):
  print "Entry. Deleting shared library reference of %s in Application %s " % (sharedLibraryName,appName)

  #get app get reference shared library
  deployment = AdminConfig.getid('/Deployment:'+appName+'/')
  #get attribute of this app
  appDeploy = AdminConfig.showAttribute(deployment, 'deployedObject')
  #get classloader of app
  clazzLoader = AdminConfig.showAttribute(appDeploy, 'classloader')
  # Remove shared library reference
  sharedLibRefs = _splitlines(AdminConfig.list('LibraryRef', clazzLoader))
  for sharedLibRef in sharedLibRefs:
    sharedLibRefName = AdminConfig.showAttribute(sharedLibRef, 'libraryName')
    if sharedLibRefName == sharedLibraryName:
      AdminConfig.remove(sharedLibRef)
      print "Delete sharedlib: %s " % sharedLibRef

def undo_create_shared_lib(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  lib_name, app_name = args
  
  deleteSharedLibraryReference(lib_name, app_name)
  wsadminlib.deleteSharedLibrary(lib_name)
  wsadminlib.save()
  
  print "Delete shared library successfully"

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, servername, nodename, clustername, 
  """
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_create_shared_lib.py"
    sys.exit()
  undo_create_shared_lib(sys.argv)
