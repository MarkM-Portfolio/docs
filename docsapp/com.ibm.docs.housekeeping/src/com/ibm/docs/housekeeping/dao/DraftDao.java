/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.util.ErrorCode;
import com.ibm.json.java.JSONObject;

public class DraftDao
{
  private static final Logger LOGGER = Logger.getLogger(DraftDao.class.getName());

  private static final int MIGRATED_STATUS = -1;

  // If no upload draft, snapshot and draft, delete the empty draft folders and useless record in docs_history
  private static final String DELETE = "DELETE FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\"=? AND \"URI\"=?";

  // Query the count of records needs to be migrated
  private static final String COUNT_MIGRATION = "SELECT COUNT(*) FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"STATUS\" IS NULL";

  public static final String QUERY_MIGRATION_BY_ORG = "SELECT REPO_ID, URI FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"ORG_ID\"=? AND \"STATUS\" IS NULL";

  // For recent drafts, we need to update docs_history if the draft has not been migrated
  private static final String UPDATE_MIGRATION = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"SLAST_VISIT\"=?, \"UPLOAD_CREATED\"=?, \"STATUS\"=? WHERE \"REPO_ID\"=? AND \"URI\"=?";

  // The DLAST_VISIT value is well calculated due to snapshot housekeeping strategy
  public static final String DRAFT_CACHE_HK = "SELECT REPO_ID, URI FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"ORG_ID\"=? AND \"STATUS\" =1 AND \"DLAST_VISIT\" <?"
      + " UNION SELECT REPO_ID, URI FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"ORG_ID\"=? AND \"DLAST_VISIT\" IS NULL AND \"STATUS\" =1 AND \"SLAST_VISIT\" <?"
      + " UNION SELECT REPO_ID, URI FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"ORG_ID\"=? AND \"DLAST_VISIT\" IS NULL AND \"SLAST_VISIT\" IS NULL AND \"STATUS\" =1 AND \"UPLOAD_CREATED\" <?";

  public static final String UPDATE_STATUS_4_CACHE = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"STATUS\"=? WHERE \"REPO_ID\"=? AND \"URI\"=?";

  public boolean updateCacheStatus(String repoId, String uri) throws ConcordException
  {
    Connection conn = DBConnection.getConnection();
    if (conn == null)
    {
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to get DB connection");
      throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
    }
    PreparedStatement stmt = null;
    try
    {
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITTED);
      stmt = conn.prepareStatement(UPDATE_STATUS_4_CACHE);
      stmt.setInt(1, IDocHistoryDAO.CLEANED_CACHE_STATUS);
      stmt.setString(2, repoId);
      stmt.setString(3, uri);

      return stmt.executeUpdate() > 0;
    }
    catch (SQLException e)
    {
      if (conn != null)
      {
        try
        {
          conn.rollback();
        }
        catch (SQLException e1)
        {
          LOGGER.log(Level.WARNING, "Failed to rollback ", e1);
        }
      }
      final String errorMsg = "Failed to update doc_history status for cache housekeeping.";
      LOGGER.log(Level.WARNING, errorMsg, e);
      JSONObject data = new JSONObject();
      data.put("errorMsg", errorMsg);
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
  }

  public boolean updateMigrationStatus(String repoId, String uri, long sLastVisit, long uploadCreated) throws ConcordException
  {
    Connection conn = DBConnection.getConnection();
    if (conn == null)
    {
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to get DB connection");
      throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
    }
    PreparedStatement stmt = null;
    try
    {
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITTED);
      stmt = conn.prepareStatement(UPDATE_MIGRATION);
      if (sLastVisit > 0)
      {
        stmt.setTimestamp(1, new Timestamp(sLastVisit));
      }
      else
      {
        stmt.setTimestamp(1, null);
      }
      if (uploadCreated > 0)
      {
        stmt.setTimestamp(2, new Timestamp(uploadCreated));
      }
      else
      {
        stmt.setTimestamp(2, null);
      }
      stmt.setInt(3, MIGRATED_STATUS);
      stmt.setString(4, repoId);
      stmt.setString(5, uri);

      return stmt.executeUpdate() > 0;

    }
    catch (SQLException e)
    {
      if (conn != null)
      {
        try
        {
          conn.rollback();
        }
        catch (SQLException e1)
        {
          LOGGER.log(Level.WARNING, "Failed to rollback ", e1);
        }
      }
      final String errorMsg = "Failed to query the migration count for housekeeping.";
      LOGGER.log(Level.WARNING, errorMsg, e);
      JSONObject data = new JSONObject();
      data.put("errorMsg", errorMsg);
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
  }

  /**
   * 
   * @return the migration count for housekeeping
   * @throws ConcordException
   *           concord exception
   */
  public int getMigrationCount() throws ConcordException
  {
    Connection conn = DBConnection.getConnection();
    if (conn == null)
    {
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to get DB connection");
      throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
    }
    PreparedStatement stmt = null;
    ResultSet results = null;
    try
    {
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITTED);
      stmt = conn.prepareStatement(COUNT_MIGRATION);
      results = stmt.executeQuery();
      if (results.next())
      {
        return results.getInt(1);
      }
      else
      {
        return -1;
      }
    }
    catch (SQLException e)
    {
      if (conn != null)
      {
        try
        {
          conn.rollback();
        }
        catch (SQLException e1)
        {
          LOGGER.log(Level.WARNING, "Failed to rollback ", e1);
        }
      }
      final String errorMsg = "Failed to query the migration count for housekeeping.";
      LOGGER.log(Level.WARNING, errorMsg, e);
      JSONObject data = new JSONObject();
      data.put("errorMsg", errorMsg);
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
  }

  public boolean delete(String repoId, String docId) throws ConcordException
  {
    Connection conn = DBConnection.getConnection();
    if (conn == null)
    {
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to get DB connection");
      throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
    }
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(DELETE);
      stmt.setString(1, repoId);
      stmt.setString(2, docId);
      return stmt.executeUpdate() > 0;
    }
    catch (SQLException e)
    {
      if (conn != null)
      {
        try
        {
          conn.rollback();
        }
        catch (SQLException e1)
        {
          LOGGER.log(Level.WARNING, "Failed to rollback ", e1);
        }
      }
      final String errorMsg = "Failed to delete draft records ";
      LOGGER.log(Level.WARNING, errorMsg + docId, e);
      JSONObject data = new JSONObject();
      data.put("errorMsg", errorMsg);
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
  }
}
