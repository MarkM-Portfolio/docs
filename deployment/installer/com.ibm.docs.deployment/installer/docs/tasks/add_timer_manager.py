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

def _create_it(scope_full, tmName, tmJNDIName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  tmProviderID = AdminConfig.getid(scope_full + 'TimerManagerProvider:TimerManagerProvider/')
  print ">>>>>>>Timer Manager Provider ID is:" + tmProviderID

  jndiNameAttr = ["jndiName", tmJNDIName]
  defTranAttr = ["defTranClass", ""]
  nameAttr = ["name", tmName]
  categoryAttr = ["category", ""]
  descriptionAttr = ["description", ""]
  numAlarmThreadsAttr = ["numAlarmThreads", "1"]
  serviceNamesAttr = ["serviceNames", ""]
  requiredAttrs = [jndiNameAttr, defTranAttr, nameAttr, categoryAttr, descriptionAttr, numAlarmThreadsAttr,serviceNamesAttr]

  AdminConfig.create('TimerManagerInfo', tmProviderID ,requiredAttrs) 
  wsadminlib.save()
  pass


def create_timer_manager(args):

  scope, tmName, tmJNDIName = args
  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])

  existed = 'false'
  scope_id = AdminConfig.getid(scope_full)
  timerManagerInfo = AdminConfig.list('TimerManagerInfo', scope_id)
  timerManagerInfo = AdminUtilities.convertToList(timerManagerInfo)
  for timerManager in timerManagerInfo:
    timerManagerName = AdminConfig.showAttribute(timerManager, "name")
    if (timerManagerName == tmName ):
      existed='true'
      print "Time manager already exists."
      break
      
  if existed == 'false':    
    _create_it(scope_full, tmName, tmJNDIName)
   

if __name__ == "__main__":
  import sys

  if len(sys.argv) < 3:
    print "Errors for arguments number passed to TASK create_timer_manager.py"
    sys.exit()
  create_timer_manager(sys.argv)
  
