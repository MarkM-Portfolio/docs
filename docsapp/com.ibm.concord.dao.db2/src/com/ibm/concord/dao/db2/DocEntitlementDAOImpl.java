/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
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

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.entitlement.bean.DocEBean;
import com.ibm.docs.entitlement.dao.IDocEntitlementDAO;

public class DocEntitlementDAOImpl implements IDocEntitlementDAO
{
  private static final Logger LOG = Logger.getLogger(DocEntitlementDAOImpl.class.getName());

  private static final String QUERY_ENTITLEMENT = "SELECT * FROM \"CONCORDDB\".\"DOC_ENTITLEMENT\" WHERE \"LEVEL_ID\" =?";

  private static final String QUERY_BYUNIQUENAME = "SELECT * FROM \"CONCORDDB\".\"DOC_ENTITLEMENT\" WHERE \"LEVEL_NAME\" =?";

  private static final String ADD_ENTITLEMENT = "INSERT INTO \"CONCORDDB\".\"DOC_ENTITLEMENT\" ( \"LEVEL_ID\",\"LEVEL_NAME\",\"FEATURES\",\"CREATEDATE\") VALUES (?,?,?,CURRENT_TIMESTAMP)";

  private static final String UPDATE_ENTITLEMENT_FEATURES = " UPDATE \"CONCORDDB\".\"DOC_ENTITLEMENT\" SET \"FEATURES\"=?  WHERE \"LEVEL_ID\" = ?";

  private static final String REMOVE_ENTITLEMENT = "DELETE FROM \"CONCORDDB\".\"DOC_ENTITLEMENT\" WHERE \"LEVEL_ID\" = ?";

  private static final String QUERY_BY_USERIDORGID = "SELECT * FROM \"CONCORDDB\".\"DOC_ENTITLEMENT\" \"DOC_ENTITLEMENT\","
      + " \"CONCORDDB\".\"USER_ENTITLEMENT\" \"USER_ENTITLEMENT\" WHERE \"DOC_ENTITLEMENT\".\"LEVEL_ID\" = \"USER_ENTITLEMENT\".\"LEVEL_ID\""
      + " AND \"USER_ENTITLEMENT\".\"USER_ID\" =? AND \"USER_ENTITLEMENT\".\"ORG_ID\" = ?";

  private static final String QUERY_BY_ORGID = "SELECT * FROM \"CONCORDDB\".\"DOC_ENTITLEMENT\" \"DOC_ENTITLEMENT\","
      + " \"CONCORDDB\".\"ORG_ENTITLEMENT\" \"ORG_ENTITLEMENT\" WHERE \"DOC_ENTITLEMENT\".\"LEVEL_ID\" = \"ORG_ENTITLEMENT\".\"LEVEL_ID\""
      + " AND \"ORG_ENTITLEMENT\".\"ORG_ID\" =?";

  @SuppressWarnings("deprecation")
  public DocEBean getByUser(String userid, String orgid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocEBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_BY_USERIDORGID);
      stmt.setString(1, userid);
      stmt.setString(2, orgid);
      result = stmt.executeQuery();

      if (result.next())
      {
        bean = new DocEBean();

        bean.setLevelid(result.getString("LEVEL_ID"));
        bean.setLevelName(result.getString("LEVEL_NAME"));
        bean.setFeatures(result.getString("FEATURES"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BY_USERIDORGID, e);
      throw new AccessException("Failed to get entitlement info by user id and its org id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  @SuppressWarnings("deprecation")
  public DocEBean getByOrg(String orgid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocEBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_BY_ORGID);
      stmt.setString(1, orgid);
      result = stmt.executeQuery();

      if (result.next())
      {
        bean = new DocEBean();

        bean.setLevelid(result.getString("LEVEL_ID"));
        bean.setLevelName(result.getString("LEVEL_NAME"));
        bean.setFeatures(result.getString("FEATURES"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BY_ORGID, e);
      throw new AccessException("Failed to get entitlement info by org id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  @SuppressWarnings("deprecation")
  public DocEBean getByLevelId(String levelid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocEBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ENTITLEMENT);
      stmt.setString(1, levelid);
      result = stmt.executeQuery();

      if (result.next())
      {
        bean = new DocEBean();

        bean.setLevelid(result.getString("LEVEL_ID"));
        bean.setLevelName(result.getString("LEVEL_NAME"));
        bean.setFeatures(result.getString("FEATURES"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ENTITLEMENT, e);
      throw new AccessException("Failed to get entitlement info by level id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  @SuppressWarnings("deprecation")
  public List<DocEBean> getByUniqueName(String levelName) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocEBean> beanList = new ArrayList<DocEBean>();
    try
    {
      stmt = conn.prepareStatement(QUERY_BYUNIQUENAME);
      stmt.setString(1, levelName);
      result = stmt.executeQuery();
      while (result.next())
      {
        DocEBean bean = new DocEBean();

        bean.setLevelid(result.getString("LEVEL_ID"));
        bean.setLevelName(result.getString("LEVEL_NAME"));
        bean.setFeatures(result.getString("FEATURES"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));

        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_BYUNIQUENAME, e);
      throw new AccessException("Failed to get entitlement info by unique name");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

  @SuppressWarnings("deprecation")
  public boolean add(DocEBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_ENTITLEMENT);
      stmt.setString(1, bean.getLevelid());
      stmt.setString(2, bean.getLevelName());
      stmt.setString(3, bean.getFeatures());

      stmt.execute();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("Failed to add an entitlement level record");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @SuppressWarnings("deprecation")
  public boolean update(DocEBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_ENTITLEMENT_FEATURES);
      stmt.setString(1, bean.getFeatures());
      stmt.setString(2, bean.getLevelid());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_ENTITLEMENT_FEATURES, e);
      throw new AccessException("Failed to update an entitlement level record");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @SuppressWarnings("deprecation")
  public boolean deleteByLevelId(String levelid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_ENTITLEMENT);
      stmt.setString(1, levelid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_ENTITLEMENT, e);
      throw new AccessException("Failed to delete an entitlement level record");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

}
