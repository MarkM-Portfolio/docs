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

import os, shutil
from common import command, call_wsadmin, CFG
import logging as log


DB_METADATA= {
 "db2" :
   {
     "description" : 'JAAS Alias for Docs DB2 DataSource'
   },
 "oracle" : 
   {
     "description" : 'JAAS Alias for Docs Oracle DataSource'
   },
 "sqlserver" : 
   {
     "description" : 'JAAS Alias for Docs Sql Server DataSource'
   }
}

class SetupJDBCJAAS(command.Command):

  def __init__(self):
    self.jaas_alias = 'DocsJAASAuth' 
    self.alias_desc = DB_METADATA[CFG.get_db_type().lower()]["description"]

  def readCfg(self, cfg=None):
    return True

  def do_upgrade(self):
    log.info("Start to upgrade JAAS alias for data source")

    self.user_id = CFG.get_db_adminid() 
    self.user_pw = CFG.get_db_adminpw() 
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./common_jython/tasks/upgrade_jaas_alias.py"])

    args.extend([self.user_id])
    args.extend([self.user_pw])
    args.extend([self.jaas_alias])
    args.extend([self.alias_desc])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    log.info("Upgrade JAAS alias for data source completed")
    return True    
  
  def undo_upgrade(self):
    log.info("NO UNDO required for UPGRADE J2C authentication alias")
    return True
    
    
  def do(self):
    log.info("Start to create JAAS alias for data source")

    self.user_id = CFG.get_db_adminid() 
    self.user_pw = CFG.get_db_adminpw() 

    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./common_jython/tasks/create_jaas_alias.py"])

    args.extend([self.user_id])
    args.extend([self.user_pw])
    args.extend([self.jaas_alias])
    args.extend([self.alias_desc])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    log.info("Create JAAS alias for data source completed")
    return True

  def undo(self):
    log.info("Start to remove JAAS alias for data source")
    
    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./common_jython/tasks/undo_create_jaas_alias.py"])
    args.extend([self.jaas_alias])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False
      
    log.info("Remove JAAS alias for data source completed")
    return True
