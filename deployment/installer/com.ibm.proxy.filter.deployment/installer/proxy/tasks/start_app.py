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


def start_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  wsadminlib.startApplication(args[0])
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name
    #  IBMConversion
  """
  if len(sys.argv) < 1:
    print(">>> Errors for arguments number passed to TASK start_app.py")
    sys.exit()
  start_it(sys.argv)
