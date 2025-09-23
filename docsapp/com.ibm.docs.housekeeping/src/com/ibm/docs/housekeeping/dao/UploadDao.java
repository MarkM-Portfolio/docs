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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.util.ErrorCode;
import com.ibm.json.java.JSONObject;

public class UploadDao
{
  private static final Logger LOGGER = Logger.getLogger(UploadDao.class.getName());

  // The SLAST_VISIT value is well calculated due to snapshot housekeeping strategy
  public static final String UPLOAD_HK = "SELECT REPO_ID, URI, UPLOAD_CREATED FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"UPLOAD_CREATED\"<? AND \"ORG_ID\"=? AND \"STATUS\" != -1";

  // Delete UPLOAD_CREATED value after housekeeping
  private static final String UPDATE_UPLOAD_CREATED = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"UPLOAD_CREATED\"=? WHERE \"REPO_ID\"=? AND \"URI\"=?";

  public UploadDao()
  {

  }

  /**
   * 
   * @param repoId
   *          repo id
   * @param docId
   *          doc id
   * @return whether the update operation is successful or not
   * @throws ConcordException
   *           concord exception
   */
  public boolean updateUploadCreated(String repoId, String docId) throws ConcordException
  {
    Connection conn = DBConnection.getConnection();
    if (conn == null)
    {
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to get DB connection");
      throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
    }
    ResultSet results = null;
    PreparedStatement stmt = null;
    try
    {
      // Consider of the concurrent case, the timestamp is used for upgrade
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
      stmt = conn.prepareStatement(UPDATE_UPLOAD_CREATED);
      stmt.setString(1, null);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
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
      LOGGER.log(Level.WARNING, "Failed to update upload created timestamp for " + docId, e);
      throw new ConcordException(ErrorCode.SQL_ERROR, new JSONObject(), e);
    }
    finally
    {
      if (conn != null)
      {
        DBUtil.safeClose(results, stmt, conn);
      }
    }
  }

}
