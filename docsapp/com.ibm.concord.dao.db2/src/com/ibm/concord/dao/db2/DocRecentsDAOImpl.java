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
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.dao.IDocRecentsDAO;

public class DocRecentsDAOImpl implements IDocRecentsDAO
{
  private static final Logger LOG = Logger.getLogger(DocRecentsDAOImpl.class.getName());

  private static final int RECENTS_CAPACITY = 10;

  private static final String ADD = "insert into \"CONCORDDB\".\"DOC_RECENTS\" (\"USER_ID\", \"REPO_ID\", \"DOC_ID\") values (?, ?, ?)";
  private static final String DELETE = "delete from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? and \"REPO_ID\"=? and \"DOC_ID\"=?";

  private static String GET = null;
  private static final String DB2_GET = "select * from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? order by \"RECENT_RANK\" desc fetch first " + RECENTS_CAPACITY + " rows only";
  private static final String SQLSERVER_GET = "select top " + RECENTS_CAPACITY + " * from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? order by \"RECENT_RANK\" desc";
  private static final String ORACLE_GET = "select * from (select * from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? order by \"RECENT_RANK\" desc) where ROWNUM<=" + RECENTS_CAPACITY + " order by ROWNUM";

  private static String TRIM = null;
  private static final String DB2_TRIM = "delete from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? and \"RECENT_RANK\" not in (select \"RECENT_RANK\" from \"CONCORDDB\".\"DOC_RECENTS\" order by \"RECENT_RANK\" desc fetch first " + RECENTS_CAPACITY + " rows only)";
  private static final String SQLSERVER_TRIM = "delete from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? and \"RECENT_RANK\" not in (select top " + RECENTS_CAPACITY + " \"RECENT_RANK\" from \"CONCORDDB\".\"DOC_RECENTS\" order by \"RECENT_RANK\" desc)";
  private static final String ORACLE_TRIM = "delete from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=? and \"RECENT_RANK\" not in (select \"RECENT_RANK\" from (select \"RECENT_RANK\" from \"CONCORDDB\".\"DOC_RECENTS\" order by \"RECENT_RANK\" desc) where ROWNUM<=" + RECENTS_CAPACITY + ")";
  
  private static final String COUNT = "select count(*) from \"CONCORDDB\".\"DOC_RECENTS\" where \"USER_ID\"=?";
  
  public DocRecentsDAOImpl()
  {
    if ("Oracle".equals(DBConnection.DATABASE_NAME))
    {
      GET = ORACLE_GET;
      TRIM = ORACLE_TRIM;
    }
    else if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME))
    {
      GET = SQLSERVER_GET;
      TRIM = SQLSERVER_TRIM;
    }
    else
    {
      GET = DB2_GET;
      TRIM = DB2_TRIM;
    }
  }

  public boolean add(String userId, String repoId, String docId)
  {
    boolean result = true;
    Connection conn = null;
    PreparedStatement stmt = null;
    if (delete(userId, repoId, docId))
    {
      try
      {
        conn = DBManager.getConnection();
        stmt = conn.prepareStatement(ADD);
        stmt.setString(1, userId);
        stmt.setString(2, repoId);
        stmt.setString(3, docId);
        stmt.execute();
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + ADD, e);
        result = false;
      }
      finally
      {
        DBManager.safeClose(null, stmt, conn);
      }
    }

    return result;
  }

  public boolean delete(String userId, String repoId, String docId)
  {
    boolean result = true;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DELETE);
      stmt.setString(1, userId);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + DELETE, e);
      result = false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }

    return result;
  }

  public boolean trim(String userId)
  {
    boolean result = true;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(TRIM);
      stmt.setString(1, userId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + TRIM, e);
      result = false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }

  public String[] get(String userId)
  {
    Vector<String> result = new Vector<String>();
    Connection conn = null;
    ResultSet resultSet = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(GET);
      stmt.setString(1, userId);
      resultSet = stmt.executeQuery();

      while (resultSet.next())
      {
        String repoId = resultSet.getString("REPO_ID");
        String docId = resultSet.getString("DOC_ID");
        result.add(docId + '@' + repoId);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + GET, e);
    }
    finally
    {
      DBManager.safeClose(resultSet, stmt, conn);
    }
    return result.toArray(new String[result.size()]);
  }

  public int count(String userId)
  {
    int result = 0;
    Connection conn = null;
    ResultSet resultSet = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(COUNT);
      stmt.setString(1, userId);
      resultSet = stmt.executeQuery();

      while (resultSet.next())
      {
        result = resultSet.getInt(1);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + COUNT, e);
    }
    finally
    {
      DBManager.safeClose(resultSet, stmt, conn);
    }
    return result;
  }
}
