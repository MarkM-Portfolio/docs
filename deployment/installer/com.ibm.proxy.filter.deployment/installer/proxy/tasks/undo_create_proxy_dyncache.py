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
  scope, ocName_docentry = args

  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])
  print(">>>>>" + scope_full)
  scope_id = AdminConfig.getid(scope_full)

  _delete_it(scope_id, ocName_docentry)

if __name__ == "__main__":
  # scope + wm_name for sys.argv
  import sys
  if len(sys.argv) < 2:
    print("Errors for arguments number passed to TASK undo_create_proxy_dynacache.py")
    sys.exit()
  removeObjectCache(sys.argv)

