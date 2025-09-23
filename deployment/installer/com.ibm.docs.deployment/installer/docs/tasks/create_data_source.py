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


def setupDataSource(args):
  from util import wsadminlib
  wsadminlib.enableDebugMessages()

  db_type, scope, provider_name, ds_name, jndi_name, ds_helper_class, \
    db_name, auth_alias, ds_desc, db_host, driver_type, db_port = args
  
  # JDBC should be set to Cell level
  # fixme, the scope is not neccsary to pass as parameter now, remove it later
  scope = wsadminlib.getCellId()

  desc=['description',ds_desc]
  alias=['componentManagedAuthenticationAlias',auth_alias]
  dbhost=['serverName',db_host]
  dbtype=['driverType', driver_type]
  dbport=['portNumber', db_port]
  attrs = []
  attrs=[alias,desc]
  #jdbc:oracle:thin:@9.110.83.109:1521:idocs
  resourceAttrs=[]
  if db_type.lower() == "db2":
    resourceAttrs=[dbhost,dbtype,dbport]
  elif db_type.lower() == "oracle":
    ora_jdbc_url = "jdbc:oracle:thin:@%s:%s:%s" % (dbhost[1], dbport[1], db_name)
    db_name = ora_jdbc_url
    resourceAttrs=[]
  elif db_type.lower() == "sqlserver":
    attrs += [['containerManagedPersistence', 'true']]
    resourceAttrs=[ ['serverName', dbhost[1]], ['portNumber', dbport[1]]]
  
  AdminJDBC.createDataSourceAtScope(scope, provider_name, ds_name, jndi_name, \
    ds_helper_class, db_name, attrs, resourceAttrs)
  
  wsadminlib.save()

if __name__ == "__main__":
  import sys
  if len(sys.argv) < 11:
    print "Invalid arguments"
    sys.exit()
  setupDataSource(sys.argv)
