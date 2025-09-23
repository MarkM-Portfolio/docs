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
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocTaskHistoryBean;
import com.ibm.concord.platform.dao.IDocTaskHistoryDAO;
import com.ibm.concord.spi.exception.AccessException;

public class DocTaskHistoryDAOImpl implements IDocTaskHistoryDAO
{
  private static final Logger LOG = Logger.getLogger(DocTaskHistoryDAOImpl.class.getName());

  private static final String QUERY_TASKHISTORIES = "SELECT * FROM \"CONCORDDB\".\"TASKHISTORY\" WHERE \"TASK_ID\" =?";

  private static final String ADD_TASKHISTORY = "INSERT INTO \"CONCORDDB\".\"TASKHISTORY\" ( \"HISTORY_ID\",\"TASK_ID\",\"CREATOR\",\"CHANGESET\",\"ACTIONTYPE\",\"ACTIONTIMESTAMP\") VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)";

  private static final String REMOVE_TASKHISTORIES = "DELETE FROM \"CONCORDDB\".\"TASKHISTORY\" WHERE \"TASK_ID\" = ?";
  
  public boolean addTaskHistory(DocTaskHistoryBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_TASKHISTORY);
      stmt.setString(1, bean.getHistoryid());
      stmt.setString(2, bean.getTaskid());
      stmt.setString(3, bean.getCreator());
      stmt.setString(4, bean.getChangeset());
      stmt.setString(5, bean.getActiontype());
      stmt.execute();
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("failed to insert one task history");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean deleteTaskHistories(String taskid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_TASKHISTORIES);
      stmt.setString(1, taskid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_TASKHISTORIES, e);
      throw new AccessException("failed to delete task histories");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
  
  public List<DocTaskHistoryBean> getTaskHistories(String taskid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocTaskHistoryBean> beanList = new ArrayList<DocTaskHistoryBean>();
    DocTaskHistoryBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_TASKHISTORIES);
      stmt.setString(1, taskid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocTaskHistoryBean();
        
        bean.setHistoryid(result.getString("HISTORY_ID"));
        bean.setTaskid(result.getString("TASK_ID"));
        bean.setCreator(result.getString("CREATOR"));
        bean.setChangeset(result.getString("CHANGESET"));
        bean.setActiontype(result.getString("ACTIONTYPE"));
        bean.setActiontimestamp(result.getTimestamp("ACTIONTIMESTAMP"));

        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_TASKHISTORIES, e);
      throw new AccessException("failed to get task histories");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

}
