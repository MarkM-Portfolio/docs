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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.entitlement.bean.UserEBean;
import com.ibm.docs.entitlement.dao.IUserEntitlementDAO;

public class UserEntilementDAOImpl implements IUserEntitlementDAO
{
  private static final Logger LOG = Logger.getLogger(UserEntilementDAOImpl.class.getName());

  private static final String QUERY_USERS = "SELECT * FROM \"CONCORDDB\".\"USER_ENTITLEMENT\" WHERE \"ORG_ID\" =?";

  private static final String QUERY_USER_ENTITLEMENT = "SELECT * FROM \"CONCORDDB\".\"USER_ENTITLEMENT\" WHERE \"USER_ID\" =? AND \"ORG_ID\" =?";

  private static final String ADD_USER_ENTITLEMENT = "INSERT INTO \"CONCORDDB\".\"USER_ENTITLEMENT\" ( \"USER_ID\",\"ORG_ID\",\"LEVEL_ID\") VALUES (?,?,?)";

  private static final String UPDATE_USER_ENTITLEMENT = " UPDATE \"CONCORDDB\".\"USER_ENTITLEMENT\" SET \"LEVEL_ID\"=?  WHERE \"USER_ID\" =? AND \"ORG_ID\" = ?";

  private static final String REMOVE_USER_ENTITLEMENT = "DELETE FROM \"CONCORDDB\".\"USER_ENTITLEMENT\" WHERE \"USER_ID\" =? AND \"ORG_ID\" = ?";

  private static final String QUERY_USER_LEVELCOUNT = "SELECT COUNT(\"LEVEL_ID\") FROM \"CONCORDDB\".\"USER_ENTITLEMENT\" WHERE \"LEVEL_ID\" =?";

  @SuppressWarnings("deprecation")
  public String[] getUsers(String orgid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    ArrayList<String> list = new ArrayList<String>();
    try
    {
      stmt = conn.prepareStatement(QUERY_USERS);
      stmt.setString(1, orgid);
      result = stmt.executeQuery();

      while (result.next())
      {
        list.add(result.getString("USER_ID"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_USERS, e);
      throw new AccessException("Failed to get user reference count by level id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    int size = list.size();
    String[] array = (String[]) list.toArray(new String[size]);
    return array;
  }

  @SuppressWarnings("deprecation")
  public int getUserReferenceCount(String levelId) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    int value = 0;
    try
    {
      stmt = conn.prepareStatement(QUERY_USER_LEVELCOUNT);
      stmt.setString(1, levelId);
      result = stmt.executeQuery();

      if (result.next())
      {
        value = result.getInt(1);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_USER_LEVELCOUNT, e);
      throw new AccessException("Failed to get user reference count by level id");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return value;
  }

  @SuppressWarnings("deprecation")
  public UserEBean get(String userid, String orgid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    UserEBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_USER_ENTITLEMENT);
      stmt.setString(1, userid);
      stmt.setString(2, orgid);
      result = stmt.executeQuery();

      if (result.next())
      {
        bean = new UserEBean();

        bean.setUserid(result.getString("USER_ID"));
        bean.setOrgid(result.getString("ORG_ID"));
        bean.setLevelid(result.getString("LEVEL_ID"));
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_USER_ENTITLEMENT, e);
      throw new AccessException("Failed to get user entitlement info");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  @SuppressWarnings("deprecation")
  public boolean add(UserEBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_USER_ENTITLEMENT);
      stmt.setString(1, bean.getUserid());
      stmt.setString(2, bean.getOrgid());
      stmt.setString(3, bean.getLevelid());

      stmt.execute();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("Failed to add user entitlement info");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @SuppressWarnings("deprecation")
  public boolean update(UserEBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_USER_ENTITLEMENT);
      stmt.setString(1, bean.getLevelid());
      stmt.setString(2, bean.getUserid());
      stmt.setString(3, bean.getOrgid());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_USER_ENTITLEMENT, e);
      throw new AccessException("Failed to update user entitlement info");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

  @SuppressWarnings("deprecation")
  public boolean deleteByUserIdOrgId(String userid, String orgid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_USER_ENTITLEMENT);
      stmt.setString(1, userid);
      stmt.setString(2, orgid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_USER_ENTITLEMENT, e);
      throw new AccessException("Failed to delete user entitlement info by user id and its org id");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
}
