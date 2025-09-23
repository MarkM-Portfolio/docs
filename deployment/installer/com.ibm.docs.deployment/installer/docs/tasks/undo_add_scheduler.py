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


def undo_add_scheduler(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  scope, schedName = args
  scopeId = AdminConfig.getid(scope)
  schedList = AdminConfig.list("SchedulerConfiguration", scopeId)
  schedList = AdminUtilities.convertToList(schedList)
  for entry in schedList:
    name = AdminConfig.showAttribute(entry, "name")
    if (name == schedName):
      AdminConfig.remove(entry)
      break
    #endIf
  #endFor

  wsadminlib.save()

if __name__ == "__main__":
  import sys

  if len(sys.argv) < 2:
    print ">>> Errors for arguments number passed to TASK undo_add_scheduler.py"
    sys.exit()
  undo_add_scheduler(sys.argv)
