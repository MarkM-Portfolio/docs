/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.dao.db2.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DBUtil
{
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
