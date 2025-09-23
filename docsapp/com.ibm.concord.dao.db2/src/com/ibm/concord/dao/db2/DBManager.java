/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.dao.db2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.ibm.concord.platform.DBConnection;

public final class DBManager
{
  private static final DBManager manager = new DBManager();

  private DBManager()
  {
    init();
  }
  
  public synchronized void init()
  {
    getConnection();
  }

  public static DBManager getInstance()
  {
    return manager;
  }

  public static Connection getConnection()
  {
    return DBConnection.getConnection();
  }

  /**
   * Please use DBUtil.safeClose(...) instead.
   * @deprecated 
   */
  public static void safeClose(ResultSet rs, PreparedStatement ps, Connection conn)
  {
    try
    {
      if (rs != null)
      {
        rs.close();
        rs = null;
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    try
    {
      if (ps != null)
      {
        ps.close();
        ps = null;
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    try
    {
      if (conn != null)
      {
        conn.close();
        conn = null;
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }
}
