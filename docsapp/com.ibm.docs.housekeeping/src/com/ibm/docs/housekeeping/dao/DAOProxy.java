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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.HouseKeepingThreadManager;
import com.ibm.docs.housekeeping.bean.DBColumn;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingType;
import com.ibm.docs.housekeeping.util.ErrorCode;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;
import com.ibm.json.java.JSONObject;

public class DAOProxy
{
  private static final Logger LOGGER = Logger.getLogger(DAOProxy.class.getName());

  private static final int FETCH_SIZE = 10000;

  private static final int JOB_SIZE = 2000;

  private static final int MIGRATION_JOB_SIZE = 2000;

  private static final int hkTimeInterval = 1000 * 60 * 3; // 3 minutes

  private String sql;

  private HouseKeepingType type;

  private HouseKeepingThreadManager manager;

  public DAOProxy(String sql, HouseKeepingType type)
  {
    this.sql = sql;
    this.type = type;
    manager = HouseKeepingThreadManager.getInstance();
  }

  /**
   * This is for big org policy migration case.
   * 
   * @param orgList
   *          organization list
   * @param filterList
   *          filter list for specific organization
   * @throws ConcordException
   */
  public void getData4Migration(String orgId, List<String> filterList) throws ConcordException
  {
    List<String> policyOrgList = new ArrayList<String>();
    policyOrgList.add(orgId);
    this.getData4Migration(orgId, filterList);
  }

  /**
   * This is for default policy migration case.
   * 
   * @param orgList
   *          organization list
   * @param filterList
   *          filter list for specific organization
   * @throws ConcordException
   */
  public void getData4Migration(List<String> orgList, List<String> filterList) throws ConcordException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet results = null;
    long index = 0;
    String orgId = null;
    boolean autoCommitDefault = true;
    try
    {
      conn = DBConnection.getConnection();
      if (conn == null)
      {
        JSONObject data = new JSONObject();
        data.put("errorMsg", "Failed to get DB connection");
        throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
      }
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITTED);
      autoCommitDefault = conn.getAutoCommit();
      conn.setAutoCommit(false);
      stmt = conn.prepareStatement(sql, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
      stmt.setFetchSize(FETCH_SIZE);
      // Start migration
      List<HouseKeepingData> theList = new ArrayList<HouseKeepingData>(MIGRATION_JOB_SIZE);
      Iterator<String> orgIt = orgList.iterator();
      while (orgIt.hasNext())
      {
        orgId = orgIt.next();
        stmt.clearParameters();
        stmt.setString(1, orgId);
        results = stmt.executeQuery();
        while (results.next())
        {
          String docId = results.getString(DBColumn.URI.toString());
          if (!HouseKeepingUtil.isAssignedDocId(docId, filterList))
          {
            continue;
          }
          String repoId = results.getString(DBColumn.REPO_ID.toString());
          HouseKeepingData data = new HouseKeepingData(repoId, orgId, docId);
          theList.add(data);
          index++;
          if (index % MIGRATION_JOB_SIZE == 0)
          {
            try
            {
              LOGGER.log(Level.INFO, "There are {0} tasks in working Queue", new Object[] { manager.getThreadPool().getQueue().size() });
              LOGGER.log(Level.INFO, "There are {0} active threads in working Queue", new Object[] { manager.getActiveCount() });
              if (manager.getActiveCount() > manager.getThreadPoolCoreSize() * 2)
              {
                LOGGER.log(Level.INFO,
                    "The data fetching is temporarily blocked {0} milli-seconds because working threads are increasing...",
                    new Object[] { hkTimeInterval });
                Thread.sleep(hkTimeInterval);
              }
            }
            catch (InterruptedException e)
            {
              LOGGER.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
              throw new ConcordException(ErrorCode.THREAD_HANG_ERROR_CODE, null, e);
            }
            manager.submitTask(theList, type);
            theList = new ArrayList<HouseKeepingData>(MIGRATION_JOB_SIZE);
          }
        }
        try
        {
          if (results != null)
          {
            results.close();
            results = null;
          }
        }
        catch (Exception e)
        {
          LOGGER.log(Level.WARNING, "Failed to close resultset ", e);
        }
      }
      // The last group of meta data for house keeping
      if (theList.size() != 0)
      {
        manager.submitTask(theList, type);
      }
      conn.commit();
    }
    catch (Exception e)
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
      LOGGER.log(Level.WARNING, "Failed to get all DOC_HISTORY data for {0}", new Object[] { orgId });
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to query data from DOC_HISTORY for housekeeping.");
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      if (conn != null)
      {
        try
        {
          conn.setAutoCommit(autoCommitDefault);
        }
        catch (Exception e)
        {
          LOGGER.log(Level.WARNING, "Failed to setAutoCommit to true", e);
        }
        DBUtil.safeClose(results, stmt, conn);
      }
    }
  }

  /**
   * This is for big org policy housekeeping case.
   * 
   * @param orgId
   *          organization id
   * @param filterList
   *          filter list
   * @param calendar
   *          compared calendar
   * @throws ConcordException
   */
  public void getData4HouseKeeping(String orgId, List<String> filterList, Calendar calendar) throws ConcordException
  {
    List<String> policyOrgList = new ArrayList<String>();
    policyOrgList.add(orgId);
    this.getData4HouseKeeping(policyOrgList, filterList, calendar);
  }

  /**
   * 
   * @param orgId
   *          organization id
   * @param filterList
   *          filter list
   * @param calendar
   *          compared calendar
   * @throws ConcordException
   */
  public void getData4HouseKeeping(List<String> orgList, List<String> filterList, Calendar calendar) throws ConcordException
  {
    if (calendar == null)
    {
      new IllegalArgumentException("Calendar used for comparision can not be empty.");
    }
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet results = null;
    String orgId = null;
    long index = 0;
    boolean autoCommitDefault = true;
    try
    {
      conn = DBConnection.getConnection();
      if (conn == null)
      {
        JSONObject data = new JSONObject();
        data.put("errorMsg", "Failed to get DB connection");
        throw new ConcordException(ErrorCode.CONN_NOT_AVAILABLE, data, null);
      }
      conn.setTransactionIsolation(Connection.TRANSACTION_READ_UNCOMMITTED);
      autoCommitDefault = conn.getAutoCommit();
      conn.setAutoCommit(false);
      stmt = conn.prepareStatement(sql, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
      stmt.setFetchSize(FETCH_SIZE);

      Timestamp theTime = new Timestamp(calendar.getTimeInMillis());
      // Start housekeeping
      List<HouseKeepingData> theList = new ArrayList<HouseKeepingData>(JOB_SIZE);
      Iterator<String> orgIt = orgList.iterator();
      while (orgIt.hasNext())
      {
        orgId = orgIt.next();
        stmt.clearParameters();
        switch (type)
          {
            case CACHE :
              stmt.setString(1, orgId);
              stmt.setTimestamp(2, theTime);
              stmt.setString(3, orgId);
              stmt.setTimestamp(4, theTime);
              stmt.setString(5, orgId);
              stmt.setTimestamp(6, theTime);
              break;
            default:
              stmt.setTimestamp(1, theTime);
              stmt.setString(2, orgId);
              break;
          }
        results = stmt.executeQuery();
        while (results.next())
        {
          String docId = results.getString(DBColumn.URI.toString());
          if (!HouseKeepingUtil.isAssignedDocId(docId, filterList))
          {
            continue;
          }
          String repoId = results.getString(DBColumn.REPO_ID.toString());
          HouseKeepingData data = new HouseKeepingData(repoId, orgId, docId);
          switch (type)
            {
              case SNAPSHOT :
                data.setSnapshotLastVisit((results.getTimestamp(DBColumn.SLAST_VISIT.toString()) != null) ? AtomDate.valueOf(
                    results.getTimestamp(DBColumn.SLAST_VISIT.toString()).getTime()).getDate() : null);
                break;
              case UPLOAD :
                data.setUploadCreated((results.getTimestamp(DBColumn.UPLOAD_CREATED.toString()) != null) ? AtomDate.valueOf(
                    results.getTimestamp(DBColumn.UPLOAD_CREATED.toString()).getTime()).getDate() : null);
                break;
              default:
                break;
            }
          theList.add(data);
          index++;
          if (index % JOB_SIZE == 0)
          {
            try
            {
              LOGGER.log(Level.INFO, "There are {0} tasks in working Queue", new Object[] { manager.getThreadPool().getQueue().size() });
              if (manager.getActiveCount() > manager.getThreadPoolCoreSize() * 2)
              {
                LOGGER.log(Level.INFO, "The data fetching is temporarily blocked ten seconds because working Queue is full now.");
                Thread.sleep(hkTimeInterval);
              }
            }
            catch (InterruptedException e)
            {
              LOGGER.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
              throw new ConcordException(ErrorCode.THREAD_HANG_ERROR_CODE, null, e);
            }
            manager.submitTask(theList, type);
            theList = new ArrayList<HouseKeepingData>(JOB_SIZE);
          }
        }
        try
        {
          if (results != null)
          {
            results.close();
            results = null;
          }
        }
        catch (Exception e)
        {
          LOGGER.log(Level.WARNING, "Failed to close resultset ", e);
        }
      }
      // The last group of meta data for house keeping
      if (theList.size() != 0)
      {
        manager.submitTask(theList, type);
      }
      conn.commit();
    }
    catch (Exception e)
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
      LOGGER.log(Level.WARNING, "Failed to get all DOC_HISTORY data for {0}", new Object[] { orgId });
      JSONObject data = new JSONObject();
      data.put("errorMsg", "Failed to query data from DOC_HISTORY for housekeeping.");
      throw new ConcordException(ErrorCode.SQL_ERROR, data, e);
    }
    finally
    {
      if (conn != null)
      {
        try
        {
          conn.setAutoCommit(autoCommitDefault);
        }
        catch (Exception e)
        {
          LOGGER.log(Level.WARNING, "Failed to setAutoCommit to true", e);
        }
        DBUtil.safeClose(results, stmt, conn);
      }
    }
  }
}
