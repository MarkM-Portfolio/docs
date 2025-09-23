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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.entitlement.bean.OrgEBean;
import com.ibm.docs.entitlement.dao.IOrgEntitlementDAO;

public class OrgEntitlementDAOImpl implements IOrgEntitlementDAO
{
  private static final Logger LOG = Logger.getLogger(OrgEntitlementDAOImpl.class.getName());

  private static final String QUERY_ORG_ENTITLEMENT = "SELECT * FROM \"CONCORDDB\".\"ORG_ENTITLEMENT\" WHERE \"ORG_ID\" = ?";

  private static final String ADD_ORG_ENTITLEMENT = "INSERT INTO \"CONCORDDB\".\"ORG_ENTITLEMENT\" ( \"ORG_ID\",\"ORG_NAME\",\"LEVEL_ID\") VALUES (?,?,?)";

  private static final String UPDATE_ORG_ENTITLEMENT = " UPDATE \"CONCORDDB\".\"ORG_ENTITLEMENT\" SET \"LEVEL_ID\"=?  WHERE \"ORG_ID\" = ? ";

  private static final String REMOVE_ORG_ENTITLEMENT = "DELETE FROM \"CONCORDDB\".\"ORG_ENTITLEMENT\" WHERE \"ORG_ID\" = ?";

  private static final String QUERY_ORG_LEVELCOUNT = "SELECT COUNT(\"LEVEL_ID\") FROM \"CONCORDDB\".\"ORG_ENTITLEMENT\" WHERE \"LEVEL_ID\" = ?";

  @SuppressWarnings("deprecation")
  public int getOrgReferenceCount(String levelId) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    int value = 0;
    try
    {
      stmt = conn.prepareStatement(QUERY_ORG_LEVELCOUNT);
      stmt.setString(1, levelId);
      result = stmt.executeQuery();

      if (result.next())
      {
        value = result.getInt(1);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ORG_LEVELCOUNT, e);
      throw new AccessException("Failed to get org reference count by level id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return value;
  }

  @SuppressWarnings("deprecation")
  public OrgEBean get(String orgid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    OrgEBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ORG_ENTITLEMENT);
      stmt.setString(1, orgid);
      result = stmt.executeQuery();

      if (result.next())
      {
        bean = new OrgEBean();

        bean.setOrgid(result.getString("ORG_ID"));
        bean.setOrgName(result.getString("ORG_NAME"));
        bean.setLevelid(result.getString("LEVEL_ID"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ORG_ENTITLEMENT, e);
      throw new AccessException("Failed to get org entitlement info");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  @SuppressWarnings("deprecation")
  public boolean add(OrgEBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_ORG_ENTITLEMENT);
      stmt.setString(1, bean.getOrgid());
      stmt.setString(2, bean.getOrgName());
      stmt.setString(3, bean.getLevelid());

      stmt.execute();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("Failed to add org entitlement info");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @SuppressWarnings("deprecation")
  public boolean update(OrgEBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_ORG_ENTITLEMENT);
      stmt.setString(1, bean.getLevelid());
      stmt.setString(2, bean.getOrgid());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_ORG_ENTITLEMENT, e);
      throw new AccessException("Failed to update org entitlement info");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

  @SuppressWarnings("deprecation")
  public boolean deleteByOrgId(String orgid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_ORG_ENTITLEMENT);
      stmt.setString(1, orgid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_ORG_ENTITLEMENT, e);
      throw new AccessException("Failed to delete org entitlement info");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

}
