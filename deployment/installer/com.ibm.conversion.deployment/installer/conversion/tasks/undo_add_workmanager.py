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


def uninstall_work_manager(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  print "Entry. Uninstall Conversion Working Manager"
  scope, wm_name= args
  server_id = AdminConfig.getid(scope)
  wm_list = AdminConfig.list('WorkManagerInfo', server_id)
  wm_list = AdminUtilities.convertToList(wm_list)
  for entry in wm_list:
    e_name = AdminConfig.showAttribute(entry, "name")
    if (e_name == wm_name):
       # Work manager already exists,remove it
      AdminConfig.remove(entry);
      break
    #endIf
  #endFor
  
  wsadminlib.save()

if __name__ == "__main__":
  # scope + wm_name for sys.argv
  if len(sys.argv) < 2:
    print "Errors for arguments number passed to TASK undo_add_workmanager"
    sys.exit()
  uninstall_work_manager(sys.argv)

