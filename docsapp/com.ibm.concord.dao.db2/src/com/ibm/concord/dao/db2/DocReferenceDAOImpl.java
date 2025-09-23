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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.docs.directory.beans.UserBean;

public class DocReferenceDAOImpl implements IDocReferenceDAO
{
  private static final Logger LOG = Logger.getLogger(DocReferenceDAOImpl.class.getName());
  
  private static final String QUERY_BY = "SELECT * FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"PARENT_REPO\" =? and \"PARENT_URI\" = ? and \"CHILD_REPO\" = ? and \"CHILD_URI\" = ?";

  private static final String QUERY_BY_PARENT = "SELECT * FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"PARENT_REPO\" =? and \"PARENT_URI\" = ?";

  private static final String QUERY_BY_CHILD = "SELECT * FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"CHILD_REPO\" =? and \"CHILD_URI\" = ?";
  
  private static final String ADD_DOCREF = "INSERT INTO \"CONCORDDB\".\"DOC_REFERENCE\" ( \"PARENT_REPO\",\"PARENT_URI\",\"CHILD_REPO\",\"CHILD_URI\",\"ORGID\",\"CREATEDBY\",\"CREATIONDATE\", \"TASK_ID\", \"SUBMIT_TIME\", \"CANCEL_TIME\") VALUES (?,?,?,?,?,?,?,?,?,?)";

  private static final String UPDATE_DOCREF = " UPDATE \"CONCORDDB\".\"DOC_REFERENCE\" SET \"TASK_ID\"=?, \"SUBMIT_TIME\"=?, \"CANCEL_TIME\"=? WHERE \"PARENT_REPO\" = ? and \"PARENT_URI\" = ? and \"CHILD_REPO\" = ? and \"CHILD_URI\" = ?";

  private static final String REMOVE_BY = "DELETE FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"PARENT_REPO\" = ? and \"PARENT_URI\" = ? and \"CHILD_REPO\" = ? and \"CHILD_URI\" = ?";
  
  private static final String REMOVE_BY_PARENT = "DELETE FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"PARENT_REPO\" = ? and \"PARENT_URI\" = ?";

  private static final String REMOVE_BY_CHILD = "DELETE FROM \"CONCORDDB\".\"DOC_REFERENCE\" WHERE \"CHILD_REPO\" = ? and \"CHILD_URI\" = ?";
  
  public boolean add(UserBean user, DocReferenceBean docRefBean)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_DOCREF);
      stmt.setString(1, docRefBean.getParentRepository());
      stmt.setString(2, docRefBean.getParentUri());
      stmt.setString(3, docRefBean.getChildRepository());
      stmt.setString(4, docRefBean.getChildUri());
      stmt.setString(5, user.getOrgId());
      stmt.setString(6, user.getId());
      stmt.setTimestamp(7, new Timestamp(System.currentTimeMillis()));
      stmt.setString(8, docRefBean.getTaskid());
      stmt.setTimestamp(9, docRefBean.getSubmittime());
      stmt.setTimestamp(10, docRefBean.getCanceltime());
      stmt.execute();
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + ADD_DOCREF, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
  public boolean update(DocReferenceBean bean)
  {
    // TODO Auto-generated method stub
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_DOCREF);
      stmt.setString(1, bean.getTaskid());// task_id
      stmt.setTimestamp(2, bean.getSubmittime());// submittime
      stmt.setTimestamp(3, bean.getCanceltime());// submittime
      stmt.setString(4, bean.getParentRepository());
      stmt.setString(5, bean.getParentUri());
      stmt.setString(6, bean.getChildRepository());
      stmt.setString(7, bean.getChildUri());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCREF, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }
  public boolean deleteByChildDocument(String childRepo, String childUri)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_BY_CHILD);
      stmt.setString(1, childRepo);
      stmt.setString(2, childUri);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_CHILD, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean deleteByParentDocument(String parentRepo, String parentUri)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_BY_PARENT);
      stmt.setString(1, parentRepo);
      stmt.setString(2, parentUri);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_PARENT, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean delete(String parentRepo, String parentUri, String childRepo, String childUri)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_BY);
      stmt.setString(1, parentRepo);
      stmt.setString(2, parentUri);
      stmt.setString(3, childRepo);
      stmt.setString(4, childUri);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
  
  public DocReferenceBean getBy(String parentRepo, String parentUri, String childRepo, String childUri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocReferenceBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_BY);
      stmt.setString(1, parentRepo);
      stmt.setString(2, parentUri);
      stmt.setString(3, childRepo);
      stmt.setString(4, childUri);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        bean = new DocReferenceBean();

        bean.setParentRepository(result.getString("PARENT_REPO"));
        bean.setParentUri(result.getString("PARENT_URI"));
        bean.setChildRepository(result.getString("CHILD_REPO"));
        bean.setChildUri(result.getString("CHILD_URI"));
        bean.setCreatorOrgId(result.getString("ORGID"));
        bean.setCreatorUserId(result.getString("CREATEDBY"));
        bean.setCreationDate(result.getTimestamp("CREATIONDATE"));
        bean.setTaskid(result.getString("TASK_ID"));
        bean.setSubmittime(result.getTimestamp("SUBMIT_TIME"));
        bean.setCanceltime(result.getTimestamp("CANCEL_TIME"));
        
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BY, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  public List<DocReferenceBean> getByChild(String childRepo, String childUri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocReferenceBean> beans = new ArrayList<DocReferenceBean>(1);
    try
    {
      stmt = conn.prepareStatement(QUERY_BY_CHILD);
      stmt.setString(1, childRepo);
      stmt.setString(2, childUri);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        DocReferenceBean bean = new DocReferenceBean();

        bean.setParentRepository(result.getString("PARENT_REPO"));
        bean.setParentUri(result.getString("PARENT_URI"));
        bean.setChildRepository(result.getString("CHILD_REPO"));
        bean.setChildUri(result.getString("CHILD_URI"));
        bean.setCreatorOrgId(result.getString("ORGID"));
        bean.setCreatorUserId(result.getString("CREATEDBY"));
        bean.setCreationDate(result.getTimestamp("CREATIONDATE"));
        bean.setTaskid(result.getString("TASK_ID"));
        bean.setSubmittime(result.getTimestamp("SUBMIT_TIME"));
        bean.setCanceltime(result.getTimestamp("CANCEL_TIME"));
        
        beans.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BY_CHILD, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beans;
  }

  public List<DocReferenceBean> getByParent(String parentRepo, String parentUri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocReferenceBean> beans = new ArrayList<DocReferenceBean>(1);
    try
    {
      stmt = conn.prepareStatement(QUERY_BY_PARENT);
      stmt.setString(1, parentRepo);
      stmt.setString(2, parentUri);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        DocReferenceBean bean = new DocReferenceBean();

        bean.setParentRepository(result.getString("PARENT_REPO"));
        bean.setParentUri(result.getString("PARENT_URI"));
        bean.setChildRepository(result.getString("CHILD_REPO"));
        bean.setChildUri(result.getString("CHILD_URI"));
        bean.setCreatorOrgId(result.getString("ORGID"));
        bean.setCreatorUserId(result.getString("CREATEDBY"));
        bean.setCreationDate(result.getTimestamp("CREATIONDATE"));
        bean.setTaskid(result.getString("TASK_ID"));
        bean.setSubmittime(result.getTimestamp("SUBMIT_TIME"));
        bean.setCanceltime(result.getTimestamp("CANCEL_TIME"));
        
        beans.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BY_PARENT, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beans;
  }

}
