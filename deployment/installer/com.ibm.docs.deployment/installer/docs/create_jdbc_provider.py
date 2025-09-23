# -*- encoding: utf8 -*-
# *****************************************************************
#
# HCL Confidential
#
# OCO Source Materials
#
# Copyright HCL Technologies Limited 2020
#
# The source code for this program is not published or otherwise
# divested of its trade secrets, irrespective of what has been
# deposited with the U.S. Copyright Office.
#
# *****************************************************************

import os, shutil
from common import command, CFG, call_wsadmin
import logging as log

# JDBC_PROVIDER_NAME ="HCL Docs DB2 Universal JDBC Driver Provider"
# DOCS_JDBC_PROVIDER_DESC = "Docs DB2 JDBC Provider"

DB_METADATA= {
 "db2" :
   {
    "type" : "DB2",
    "provider_type" : "DB2 Universal JDBC Driver Provider",
    "impl_type" : "Connection pool data source",
    "impl_type_class" : "com.ibm.db2.jcc.DB2ConnectionPoolDataSource",
    "provider_name" : "HCL Docs DB2 Universal JDBC Driver Provider",
    "provider_desc" : "Docs DB2 JDBC Provider",
    "class_path" : "${DOCS_JDBC_DRIVER_HOME}"
   },
 "oracle" :
   {
    "type" : "Oracle",
    "provider_type" : "Oracle JDBC Driver",
    "impl_type" : "Connection pool data source",
    "impl_type_class" : "oracle.jdbc.pool.OracleConnectionPoolDataSource",
    "provider_name" : "HCL Docs Oracle Universal JDBC Driver Provider",
    "provider_desc" : "Docs Oracle JDBC Provider",
    "class_path" : "${DOCS_JDBC_DRIVER_HOME}"
   },
 "sqlserver" :
   {
    "type" : "SQL Server",
    "provider_type" : "Microsoft SQL Server JDBC Driver",
    "impl_type" : "Connection pool data source",
    "impl_type_class" : "com.microsoft.sqlserver.jdbc.SQLServerConnectionPoolDataSource",
    "provider_name" : "Microsoft SQL Server JDBC Driver",
    "provider_desc" : "Microsoft SQL Server JDBC Driver. This provider is configurable in version 6.1.0.15 and later nodes.",
    "class_path" : "${DOCS_MS_JDBC_DRIVER_PATH}/sqljdbc4.jar"
   }
}

class SetupJDBCProvider(command.Command):

  def __init__(self):
    self.scope = CFG.get_scope_full_name()
    #if CFG.get_db_type().lower() == "db2":
    self.db_type = DB_METADATA[CFG.get_db_type().lower()]["type"]
    self.provider_type = DB_METADATA[CFG.get_db_type().lower()]["provider_type"]
    self.impl_type = DB_METADATA[CFG.get_db_type().lower()]["impl_type"]
    self.impl_type_class = DB_METADATA[CFG.get_db_type().lower()]["impl_type_class"]
    self.provider_name = DB_METADATA[CFG.get_db_type().lower()]["provider_name"]
    self.provider_desc = DB_METADATA[CFG.get_db_type().lower()]["provider_desc"]
    self.class_path = DB_METADATA[CFG.get_db_type().lower()]["class_path"]

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    return True

  def remove_jdbc_provider(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./docs/tasks/undo_create_jdbc_provider.py"])
    args.extend([self.provider_name])

    succ, ws_out = call_wsadmin(args)
    return (succ, ws_out)

  def do(self):
    log.info("Start to create JDBC provider for HCL Docs Server")

    succ, ws_out = self.remove_jdbc_provider()
    if not succ:
      return False

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/create_jdbc_provider.py"])

    args.extend([self.scope])
    args.extend([self.db_type])
    args.extend([self.provider_type])
    args.extend([self.impl_type])
    args.extend([self.impl_type_class])
    args.extend([self.provider_name])
    args.extend([self.provider_desc])
    args.extend([self.class_path])
    if CFG.get_db_type().lower() == "sqlserver":
      args.extend(['${DOCS_MS_JDBC_DRIVER_NATIVEPATH}'])


    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    log.info("Create JDBC provider for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to delete JDBC provider for HCL Docs Server")

    succ, ws_out = self.remove_jdbc_provider()
    if not succ:
      return False

    log.info("Delete JDBC provider for HCL Docs Server completed")
    return True
