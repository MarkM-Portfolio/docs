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

#clusterName = "none" 
def _delete_it(scope_id, tmName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  timerManagerInfo = AdminConfig.list('TimerManagerInfo', scope_id)
  timerManagerInfo = AdminUtilities.convertToList(timerManagerInfo)
  for timerManager in timerManagerInfo:
    timerManagerName = AdminConfig.showAttribute(timerManager, "name")
    if (timerManagerName == tmName ):
      # Work manager already exists,remove it
      AdminConfig.remove(timerManager);
      break
    #endIf
  #endFor
  wsadminlib.save()


def removeTimerManager(args):
  scope, tmName = args

  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])
  print ">>>>>" + scope_full
  scope_id = AdminConfig.getid(scope_full)

  _delete_it(scope_id, tmName)


if __name__ == "__main__":
  # scope + wm_name for sys.argv
  if len(sys.argv) < 2:
    print "Errors for arguments number passed to TASK undo_add_object_cache.py"
    sys.exit()
  removeTimerManager(sys.argv)

