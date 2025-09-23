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


def is_application_installed(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  
  #app = args[0]
  app_name, scope_name, arg1,arg2 = args[0:4]
  cellName = wsadminlib.getCellName()  
  if cellName:
    if scope_name.lower() == "cluster":
      clusterQuery = "WebSphere:cell=%s,cluster=%s" % (cellName,arg1)
      applications = wsadminlib._splitlines(AdminApp.list(clusterQuery))      
      if app_name in applications:
        print("yes")
        return
    elif scope_name.lower() == "server":
      #applications = wsadminlib._splitlines(AdminApp.list(clusterQuery))
      serverQuery = "WebSphere:cell=%s,node=%s,server=%s" % (cellName,arg2,arg1)      
      applications = wsadminlib._splitlines(AdminApp.list(serverQuery))      
      #applications = wsadminlib.listApplications()  
      if app_name in applications:
        print("yes")
        return
  
  print("no")

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  application_name 
  """
  if len(sys.argv) < 4:
    print ">>> Errors for arguments number passed to TASK is_application_installed"
    sys.exit()
  is_application_installed(sys.argv)
