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
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.concord.platform.bean.DocumentSessionBean;
import com.ibm.concord.platform.dao.IDocumentSessionDAO;
import com.ibm.websphere.ce.cm.DuplicateKeyException;

public class DocumentSessionDAOImpl implements IDocumentSessionDAO
{
  private static final Logger LOG = Logger.getLogger(DocumentSessionDAOImpl.class.getName());
  
  private static final String COL_REPO_ID = "REPOID";
  private static final String COL_DOC_ID = "DOCID";
  private static final String COL_SERVING_SERVER = "SERVINGSERVER";
  private static final String COL_STATUS = "STATUS";

  private static final String INSERT = "INSERT INTO \"CONCORDDB\".\"DOCUMENTSESSION\" (\"REPOID\",\"DOCID\",\"SERVINGSERVER\", \"STATUS\") VALUES (?,?,?,?)";
  private static final String DELETE = "DELETE FROM \"CONCORDDB\".\"DOCUMENTSESSION\" WHERE \"REPOID\"=? AND \"DOCID\"=?";
  private static final String DELETE2 = "DELETE FROM \"CONCORDDB\".\"DOCUMENTSESSION\" WHERE \"REPOID\"=? AND \"DOCID\"=? AND \"SERVINGSERVER\"=?";
  private static final String UPDATE = "UPDATE \"CONCORDDB\".\"DOCUMENTSESSION\" SET \"SERVINGSERVER\"=? WHERE \"REPOID\" = ? AND \"DOCID\" = ?";
  private static final String UPDATE1 = "UPDATE \"CONCORDDB\".\"DOCUMENTSESSION\" SET \"SERVINGSERVER\"=? WHERE \"REPOID\" = ? AND \"DOCID\" = ? AND \"SERVINGSERVER\" = ?";
  private static final String UPDATE2 = "UPDATE \"CONCORDDB\".\"DOCUMENTSESSION\" SET \"SERVINGSERVER\"=? WHERE \"REPOID\" = ? AND \"DOCID\" = ? AND \"SERVINGSERVER\" = ? AND \"STATUS\" = ?";
  private static final String UPDATE3 = "UPDATE \"CONCORDDB\".\"DOCUMENTSESSION\" SET \"STATUS\"=? WHERE \"REPOID\" = ? AND \"DOCID\" = ? AND \"SERVINGSERVER\" = ?";
  private static final String QUERY = "SELECT * FROM \"CONCORDDB\".\"DOCUMENTSESSION\" WHERE \"REPOID\" = ? and \"DOCID\" = ?";
  private static final String QUERY2 = "SELECT * FROM \"CONCORDDB\".\"DOCUMENTSESSION\" WHERE \"SERVINGSERVER\" = ?";
  
  /**
   * Get the connection with database.
   * 
   * @return connection with database
   * @throws SQLException
   */
  private Connection getDBConnection() throws SQLException
  {
    Connection conn = DBManager.getConnection();
    if (conn == null)
    {
      LOG.log(Level.WARNING, "Can not get the connection with database.");
      throw new SQLException();
    }
    return conn;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#add(com.ibm.concord.platform.bean.DocumentSessionBean)
   */
  public boolean add(DocumentSessionBean bean) throws SQLException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(INSERT);
      stmt.setString(1, bean.getRepoId());
      stmt.setString(2, bean.getDocId());
      stmt.setString(3, bean.getServingServer());
      stmt.setInt(4, bean.getStatus());
      stmt.execute();
      result = true;
    }
    catch (DuplicateKeyException e)
    {
      LOG.log(Level.FINE, "Duplicate key exception happens while inserting data into database");
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + INSERT, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + INSERT, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#delete(java.lang.String, java.lang.String)
   */
  public boolean delete(String repoId, String docId) throws SQLException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(DELETE);
      stmt.setString(1, repoId);
      stmt.setString(2, docId);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL: " + DELETE, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL: " + DELETE, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#delete(java.lang.String, java.lang.String, java.lang.String)
   */
  public boolean delete(String repoId, String docId, String serverName) throws SQLException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(DELETE2);
      stmt.setString(1, repoId);
      stmt.setString(2, docId);
      stmt.setString(3, serverName);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL: " + DELETE, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL: " + DELETE, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#update(java.lang.String, java.lang.String, java.lang.String)
   */
  public boolean update(String repoId, String docId, String newServerName) throws SQLException
  {
    boolean result = false;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(UPDATE);
      stmt.setString(1, newServerName);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + UPDATE, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + UPDATE, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#update(java.lang.String, java.lang.String, java.lang.String, java.lang.String)
   */
  public boolean update(String repoId, String docId, String oldServerName, String newServerName) throws SQLException
  {
    boolean result = false;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(UPDATE1);
      stmt.setString(1, newServerName);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
      stmt.setString(4, oldServerName);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + UPDATE1, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + UPDATE1, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#update(java.lang.String, java.lang.String, java.lang.String, int, java.lang.String)
   */
  public boolean update(String repoId, String docId, String serverName, int status, String newServerName) throws SQLException
  {
    boolean result = false;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(UPDATE2);
      stmt.setString(1, newServerName);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
      stmt.setString(4, serverName);
      stmt.setInt(5, status);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + UPDATE2, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + UPDATE2, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#updateStatus(java.lang.String, java.lang.String, java.lang.String, int)
   */
  public boolean updateStatus(String repoId, String docId, String serverName, int newStatus) throws SQLException
  {
    boolean result = false;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(UPDATE3);
      stmt.setInt(1, newStatus);
      stmt.setString(2, repoId);
      stmt.setString(3, docId);
      stmt.setString(4, serverName);
      result = (stmt.executeUpdate() > 0);
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + UPDATE3, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + UPDATE3, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#findById(java.lang.String, java.lang.String)
   */
  public DocumentSessionBean findById(String repoId, String docId) throws SQLException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocumentSessionBean bean = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(QUERY);
      stmt.setString(1, repoId);
      stmt.setString(2, docId);
      result = stmt.executeQuery();
      if (result.next())
      {
        bean = new DocumentSessionBean(result.getString(COL_REPO_ID), result.getString(COL_DOC_ID), result.getString(COL_SERVING_SERVER), result.getInt(COL_STATUS));
      }
    }
    catch (SQLException e)
    {
      LOG.log(Level.WARNING, "SQLException happens when executing SQL:" + QUERY, e);
      throw e;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + QUERY, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.IDocumentSessionDAO#findByServerName(java.lang.String)
   */
  public List<DocumentSessionBean> findByServerName(String serverName) throws SQLException
  {
    List<DocumentSessionBean> beans = new ArrayList<DocumentSessionBean>();
    
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet result = null;
    try
    {
      conn = getDBConnection();
      stmt = conn.prepareStatement(QUERY2);
      stmt.setString(1, serverName);
      result = stmt.executeQuery();
      while (result.next())
      {
        DocumentSessionBean bean = new DocumentSessionBean(result.getString(COL_REPO_ID), 
            result.getString(COL_DOC_ID), result.getString(COL_SERVING_SERVER), result.getInt(COL_STATUS));
        beans.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error happens when executing SQL:" + QUERY2, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beans;
  }
}
