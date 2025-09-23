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
  
  app = args[0]

  applications = wsadminlib.listApplications()
  
  for a in applications:
    if a == app:
      print("yes")
      return

  print("no")

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  application_name 
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK is_application_installed"
    sys.exit()
  is_application_installed(sys.argv)
