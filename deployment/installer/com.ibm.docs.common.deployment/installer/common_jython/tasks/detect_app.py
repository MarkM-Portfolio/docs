# -*- encoding: utf8 -*-
# ***************************************************************** 
#                                                                   
# IBM Confidential                                                  
#                                                                   
# IBM Docs Source Materials                                         
#                                                                   
# (c) Copyright IBM Corporation 2014. All Rights Reserved.          
#                                                                   
# U.S. Government Users Restricted Rights: Use, duplication or      
# disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
#                                                                   
# ***************************************************************** 


def detect_it(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()
  appObj = AdminControl.completeObjectName('type=Application,name=%s,*' % args[0])
  if appObj:
    print 'detected application is runing'
  else:
    print 'detected application is stopped' 

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  app_name
    #  IBMConversion
  """
  if len(sys.argv) < 1:
    print ">>> Errors for arguments number passed to TASK detect_app.py"
    sys.exit()
  detect_it(sys.argv)
