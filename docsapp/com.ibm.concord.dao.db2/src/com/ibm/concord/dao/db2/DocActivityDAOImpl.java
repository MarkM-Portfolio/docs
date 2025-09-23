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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocActivityBean;
import com.ibm.concord.platform.dao.IDocActivityDAO;

public class DocActivityDAOImpl implements IDocActivityDAO
{
  private static final Logger LOG = Logger.getLogger(DocActivityDAOImpl.class.getName());

  private static final String QUERY_DOCACT = "SELECT * FROM \"CONCORDDB\".\"DOC_ACTIVITY\" WHERE \"REPO_ID\" =? and \"URI\" = ?";

  private static final String ADD_DOCACTL = "INSERT INTO \"CONCORDDB\".\"DOC_ACTIVITY\" ( \"REPO_ID\",\"URI\",\"ACTIVITY_ID\",\"ORGID\",\"CREATEDBY\",\"CREATIONDATE\") VALUES (?,?,?,?,?,?)";

  private static final String UPDATE_DOCACT = " UPDATE \"CONCORDDB\".\"DOC_ACTIVITY\" SET \"ACTIVITY_ID\"=? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String REMOVE_BY_ACTID = "DELETE FROM \"CONCORDDB\".\"DOC_ACTIVITY\" WHERE \"ACTIVITY_ID\" = ? ";

  private static final String REMOVE_BY_REPO_URI = "DELETE FROM \"CONCORDDB\".\"DOC_ACTIVITY\" WHERE \"REPO_ID\" = ? and \"URI\" = ?";

  public boolean add(DocActivityBean bean)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_DOCACTL);
      stmt.setString(1, bean.getRepo_id());
      stmt.setString(2, bean.getUri());
      stmt.setString(3, bean.getActivity_id());
      stmt.setString(4, bean.getOrgid());
      stmt.setString(5, bean.getCreatedby());
      stmt.setTimestamp(6, bean.getCreationdate());
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + ADD_DOCACTL, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean deleteByActId(String act_id)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(REMOVE_BY_ACTID);
      stmt.setString(1, act_id);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_ACTID, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean deleteByRepoAndUri(String repo, String uri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(REMOVE_BY_REPO_URI);
      stmt.setString(1, repo);
      stmt.setString(2, uri);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_REPO_URI, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public DocActivityBean getByRepoAndUri(String repo, String uri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocActivityBean actlink = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_DOCACT);
      stmt.setString(1, repo);
      stmt.setString(2, uri);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        actlink = new DocActivityBean();

        actlink.setRepo_id(result.getString("REPO_ID"));
        actlink.setUri(result.getString("URI"));
        actlink.setActivity_id(result.getString("ACTIVITY_ID"));
        actlink.setOrgid(result.getString("ORGID"));
        actlink.setCreatedby(result.getString("CREATEDBY"));
        actlink.setCreationdate(result.getTimestamp("CREATIONDATE"));

        break;
      }
    }
    catch (Exception e)
    {
      // throw SQLException("error when executing SQL:" + QUERY_DOCS);
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_DOCACT, e);
      return null;
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return actlink;
  }

  public boolean update(String repo, String uri, String act_id)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_DOCACT);
      stmt.setString(1, act_id);
      stmt.setString(2, repo);
      stmt.setString(3, uri);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCACT, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

}
