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
  print ">>>>>>>Object Cache Provider ID is:" + ocProviderID
  attrs = ['-name',ocName,'-jndiName',ocJNDIName]
  AdminTask.createObjectCacheInstance( ocProviderID, attrs)

  wsadminlib.save()
  pass


def create_object_cache(args):

#  scope, ocName_docentry, ocJNDIName_docentry, \
#	ocName_access, ocJNDIName_access,\
#	ocName_rt_session, ocJNDIName_rt_session,\
#	ocName_rtc4web, ocJNDIName_rtc4web,\
#	ocName_concord_editors,ocJNDIName_concord_editors = args
  
  length_arg = len(args)
  scope = args[0]
  cell_name = AdminControl.getCell()
  scope_full = "".join(["/Cell:", cell_name, scope])

  index = 2
  while index < length_arg:
    _create_it(scope_full, args[index-1], args[index])
    index=index+2
    
#  _create_it(scope_full, ocName_docentry, ocJNDIName_docentry)
#  _create_it(scope_full, ocName_access, ocJNDIName_access)
#  _create_it(scope_full, ocName_rt_session, ocJNDIName_rt_session)
#  _create_it(scope_full, ocName_rtc4web, ocJNDIName_rtc4web)
#  _create_it(scope_full, ocName_concord_editors, ocJNDIName_concord_editors)


if __name__ == "__main__":
  import sys
  
  length_arg=len(sys.argv)  
  if length_arg > 0: 
    res = divmod(length_arg,2)
    if res[1]==0:    
      print "Errors for arguments number passed to TASK add_object_cache.py"
      sys.exit()
  create_object_cache(sys.argv)
