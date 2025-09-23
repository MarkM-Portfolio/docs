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


def deleteSharedLibraryReference(sharedLibraryName,appName):
  print "Entry. Deleting shared library reference of %s in Application %s "\
       % (sharedLibraryName,appName)

  #get app get reference shared library
  deployment = AdminConfig.getid('/Deployment:'+appName+'/')
  #get attribute of this app
  appDeploy = AdminConfig.showAttribute(deployment, 'deployedObject')
  #get classloader of app
  clazzLoader = AdminConfig.showAttribute(appDeploy, 'classloader')
  # Remove shared library reference
  sharedLibRef = AdminConfig.list('LibraryRef', clazzLoader)
  AdminConfig.remove(sharedLibRef)

def delete_shared_lib_ref(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  libname, app_name = args
  deleteSharedLibraryReference(libname, app_name)
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  #print ">>>>", str(sys.argv)
  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_associate_shared_lib.py"
    sys.exit()
  delete_shared_lib_ref(sys.argv)
