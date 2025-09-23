/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;

public class DBConnection
{
  private static final Logger LOG = Logger.getLogger(DBConnection.class.getName());
  private static final String JNDI_DATASOURCE = "java:comp/env/com/ibm/concord/datasource";
  private static DataSource ds;
  public static String DATABASE_NAME;
  
  public static void initDataSource()
  {
    try
    {
      Context ctx = new InitialContext();
      ds = (DataSource) ctx.lookup(JNDI_DATASOURCE);
      Connection conn = getConnection();
      DATABASE_NAME = conn.getMetaData().getDatabaseProductName();
      if (conn != null)
      {
        conn.close();
      }
    }
    catch (Exception e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.DATABASE_INIT_ERROR, "Database initialization error");
    }
  }
  
  public static Connection getConnection()
  {
    Connection conn = null;
    try
    {
      conn = ds.getConnection();
    }
    catch (SQLException e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.DATABASE_CONNECTION_ERROR, "Can not get database connections");
    }
    return conn;
  }
}
