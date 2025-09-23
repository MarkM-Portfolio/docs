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


def query_remove_shared_lib_reference(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  libname, app_name = args
  #get app get reference shared library  
  deployment = AdminConfig.getid('/Deployment:'+app_name+'/')
  #get attribute of this app
  print "deployment: "
  print deployment
  appDeploy = AdminConfig.showAttribute(deployment, 'deployedObject')
  print "appDeploy: "
  print appDeploy
  #get classloader of app
  clazzLoader = AdminConfig.showAttribute(appDeploy, 'classloader')
  print "clazzLoader: "
  print clazzLoader
  # Remove shared library reference
  sharedLibRef = AdminConfig.list('LibraryRef', clazzLoader)
  print "sharedLibRef: "
  print sharedLibRef
  if sharedLibRef:
    sharedLib = AdminConfig.showAttribute(sharedLibRef,'libraryName')  
    if libname == sharedLib:
      AdminConfig.remove(sharedLibRef)
      print libname
      wsadminlib.save()    
  
  """
  for sharedLibRef in sharedLibRefs:
    print "sharedLibRef: "
    print sharedLibRef
    sharedLib = AdminConfig.showAttribute(sharedLibRef,'libraryName')
    print "sharedLib: "
    print sharedLib
    if libname == sharedLib:
    	AdminConfig.remove(sharedLibRef)
    	print libname
    	break
  """
if __name__ == "__main__":
  import sys
  #print ">>>>", str(sys.argv)
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_associate_shared_lib.py"
    sys.exit()
  query_remove_shared_lib_reference(sys.argv)
