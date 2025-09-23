# ***************************************************************** 
#                                                                   
# Licensed Materials - Property of IBM.                                               
#                                                                   
# IBM Docs Source Materials                                              
#                                                                   
# (c) Copyright IBM Corporation 2012. All Rights Reserved.                                        
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or 
# disclosure restricted by GSA ADP Schedule Contract with 
# IBM Corp.              
#                                                                   
# ***************************************************************** 

# -*- encoding: utf8 -*-

def unstall_ear(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  wsadminlib.deleteApplicationByName(args[0])
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  ear_name
    #  IBMConversion
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK undo_install_ear"
    sys.exit()
  unstall_ear(sys.argv)
