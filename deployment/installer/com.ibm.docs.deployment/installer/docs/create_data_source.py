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

DB2_JDBC_PROVIDER_NAME ="HCL Docs DB2 Universal JDBC Driver Provider"
ORACLE_JDBC_PROVIDER_NAME = "HCL Docs Oracle Universal JDBC Driver Provider"
SQLSERVER_JDBC_PROVIDER_NAME = "Microsoft SQL Server JDBC Driver"

DB2_DATASOURCE_HELPER_CLASS = 'com.ibm.websphere.rsadapter.DB2UniversalDataStoreHelper'
ORACLE_DATASOURCE_HELPER_CLASS = 'com.ibm.websphere.rsadapter.Oracle11gDataStoreHelper'
SQLSERVER_DATASOURCE_HELPER_CLASS = 'com.ibm.websphere.rsadapter.MicrosoftSQLServerDataStoreHelper '

DB2_DATASOURCE_DESC = 'Docs DB2 DataSource'
ORACLE_DATASOURCE_DESC = 'Docs Oracle DataSource'
SQLSERVER_DATASOURCE_DESC = 'Docs Sql Server DataSource'


JNDI_NAME = 'com/ibm/concord/datasource'
DRIVER_TYPE = '4'
JAAS_ALIAS = 'DocsJAASAuth'
DATASOURCE_NAME = 'docs'

class SetupDataSource(command.Command):

  def __init__(self):
    self.db_type = CFG.get_db_type().lower()
    self.scope = CFG.get_scope_full_name()
    if self.db_type.lower() == "db2":
      self.provider_name = DB2_JDBC_PROVIDER_NAME
      self.ds_helper_class = DB2_DATASOURCE_HELPER_CLASS
      self.ds_desc = DB2_DATASOURCE_DESC
    elif self.db_type.lower() == "oracle":
      self.provider_name = ORACLE_JDBC_PROVIDER_NAME
      self.ds_helper_class = ORACLE_DATASOURCE_HELPER_CLASS
      self.ds_desc = ORACLE_DATASOURCE_DESC
    elif self.db_type.lower() == "sqlserver":
      self.provider_name = SQLSERVER_JDBC_PROVIDER_NAME
      self.ds_helper_class = SQLSERVER_DATASOURCE_HELPER_CLASS
      self.ds_desc = SQLSERVER_DATASOURCE_DESC
    else:
      log.error("Please set correctly database types in cfg.properties")
      raise

    self.ds_name = DATASOURCE_NAME
    self.jndi_name = JNDI_NAME
    self.db_name = CFG.get_db_name()
    self.auth_alias = JAAS_ALIAS
    self.db_host = CFG.db_hostname
    self.driver_type = DRIVER_TYPE
    self.db_port = CFG.db_port

  def readCfg(self, cfg=None):
    """read and setup config parameters"""
    self.datasource_max_connections = cfg['connection_pool']['max_connections']
    return True

  def set_connection_pool(self):
    args = CFG.get_was_cmd_line()
    args.extend(["-f",  "./docs/tasks/set_datasource_connection_pool.py"])
    args.append(self.ds_name)
    args.append('maxConnections=' + str(self.datasource_max_connections))

    succ, ws_out = call_wsadmin(args)

    if not succ:
      return False
    else:
      return True

  def do(self):
    log.info("Start to create DataSource for HCL Docs Server")

    args = CFG.get_was_cmd_line()
    # wasadmin command line arguments
    args.extend(["-f",  "./docs/tasks/create_data_source.py"])

    args.extend([self.db_type])
    args.extend([self.scope])
    args.extend([self.provider_name])
    args.extend([self.ds_name])
    args.extend([self.jndi_name])
    args.extend([self.ds_helper_class])
    args.extend([self.db_name])
    args.extend([self.auth_alias])
    args.extend([self.ds_desc])
    args.extend([self.db_host])
    args.extend([self.driver_type])
    args.extend([self.db_port])

    succ, ws_out = call_wsadmin(args)
    if not succ:
      return False

    succ = self.set_connection_pool()

    if not succ:
      return False

    log.info("Create DataSource for HCL Docs Server completed")
    return True

  def undo(self):
    log.info("Start to delete DataSource for HCL Docs Server")

    log.info("DataSource will be removed implicitly by removing the JDBC provider")

    log.info("Delete DataSource for HCL Docs Server completed")
    return True
