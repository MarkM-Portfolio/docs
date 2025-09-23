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


#clusterName = "none" 
def _delete_it(scope_id, ocName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  objCacheInfo = AdminConfig.list('ObjectCacheInstance', scope_id)
  objCacheInfo = AdminUtilities.convertToList(objCacheInfo)
  for objCacheInfoEntry in objCacheInfo:
    objCacheNameOfEntry = AdminConfig.showAttribute(objCacheInfoEntry, "name")
    if (objCacheNameOfEntry == ocName ):
      # Work manager already exists,remove it
      AdminConfig.remove(objCacheInfoEntry);
      break
    #endIf
  #endFor
  wsadminlib.save()


def removeObjectCache(args):
#  scope, ocName_docentry, \
#	ocName_access, \
#	ocName_rt_session, \
#	ocName_rtc4web = args
  lengtharg = len(args)
  if lengtharg < 1:
    return
  scope = args[0]
  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])
  print ">>>>>" + scope_full
  scope_id = AdminConfig.getid(scope_full)
  index = 1
  while index < lengtharg:
    _delete_it(scope_id, args[index])
    index = index + 1

if __name__ == "__main__":
  # scope + wm_name for sys.argv
  if len(sys.argv) < 1:
    print "Errors for arguments number passed to TASK undo_add_object_cache.py"
    sys.exit()
  removeObjectCache(sys.argv)

