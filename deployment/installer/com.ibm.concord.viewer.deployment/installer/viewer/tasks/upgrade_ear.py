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


def upgrade_ear(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  ear_name = args[0]
  wsadminlib.updateApplication(ear_name)

  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name, 
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK update_ear"
    sys.exit()
  upgrade_ear(sys.argv)
