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


def _create_it(scope_full, ocName, ocJNDIName):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  ocProviderID = AdminConfig.getid(scope_full + 'CacheProvider:/')
  print(">>>>>>>Object Cache Provider ID is:" + ocProviderID)
  attrs = ['-name',ocName,'-jndiName',ocJNDIName]
  AdminTask.createObjectCacheInstance( ocProviderID, attrs)

  wsadminlib.save()
  pass


def create_object_cache(args):

  scope, ocName_docentry, ocJNDIName_docentry = args

  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])

  _create_it(scope_full, ocName_docentry, ocJNDIName_docentry)


if __name__ == "__main__":
  import sys

  if len(sys.argv) < 3:
    print("Errors for arguments number passed to TASK create_proxy_dyncache.py")
    sys.exit()
  create_object_cache(sys.argv)
