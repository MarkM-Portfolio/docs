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


def setupJDBC(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  scope, db_type, provider_type, impl_type, impl_type_class, \
    provider_name, provider_desc, class_path = args[:8]

  # JDBC should be set to Cell level
  # fixme, the scope is not neccsary to pass as parameter now, remove it later
  scope = wsadminlib.getCellId()
  desc = ['description',provider_desc]
  impclass=['implementationClassName', impl_type_class]
  classpath = ['classpath', class_path]
  attrs=[desc, impclass, classpath]
  if db_type == 'SQL Server':
    attrs += [['nativePath', args[8]]]
  AdminJDBC.createJDBCProviderAtScope(scope, db_type, provider_type, impl_type, provider_name, attrs)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  setupJDBC(sys.argv)
