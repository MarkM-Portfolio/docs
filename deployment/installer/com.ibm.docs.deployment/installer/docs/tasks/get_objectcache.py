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


def getObjectCache(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  #print ">>>>>>>>", str(args)
  cell_name = AdminControl.getCell()
  
  length_arg = len(args)
  scope = args[0]
  
#  scope,ocName_docentry, \
#	ocName_access, \
#	ocName_rt_session, \
#	ocName_rtc4web,\
#	ocName_concord_editors = args
	  
  scope_full = "".join(["/Cell:", cell_name, scope])
  #oisName = args[1]
  
  jndi_name_list= []
  if length_arg > 1:  	
    jndi_name_list.extend(args[1:length_arg])
  
  provider_id = AdminConfig.getid(scope_full + \
        'CacheProvider:/')  	
  objectcacheinstances = AdminConfig.list('ObjectCacheInstance', provider_id).splitlines()
  
  existings = []
  for ois in objectcacheinstances:    
    if AdminConfig.showAttribute(ois, 'jndiName') in jndi_name_list:
      existings.append(AdminConfig.showAttribute(ois, 'jndiName'))    	      
      attr = AdminConfig.show(ois).splitlines()
      print "ObjectCache is existing: ",attr
    #return 
  if len(existings)==0: 
    print "No ObjectCache found"
  

if __name__ == "__main__":
  import sys
  """
    #  required parameters
    #  scope, oisName
  """
  length_arg=len(sys.argv)  
  if length_arg < 1:  
    print "Errors for arguments number passed to TASK get_objectcache.py"
    sys.exit()
  getObjectCache(sys.argv)