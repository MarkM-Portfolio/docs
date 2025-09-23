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


def stop_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  print "NOT IMPLEMENTED YET"
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name
    #  LotusLiveSymphonyConversion
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK undo_start_app.py"
    sys.exit()
  stop_it(sys.argv)
