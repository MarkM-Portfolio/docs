package com.ibm.concord.dao.db2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.directory.dao.ICustomerCredentialDAO;

public class CustomerCredentialDAOImpl implements ICustomerCredentialDAO
{
  private static final Logger LOG = Logger.getLogger(CustomerCredentialDAOImpl.class.getName());
  
  private static final String ADD_ITEM = "INSERT INTO \"CONCORDDB\".\"CUSTOMER_CREDENTIAL\" ( \"CUSTOMER_ID\",\"KEY\",\"VALUE\") VALUES (?,?,?)";
  
  private static final String UPDATE_ITEM = " UPDATE \"CONCORDDB\".\"CUSTOMER_CREDENTIAL\" SET \"VALUE\"=? WHERE \"CUSTOMER_ID\" = ? and \"KEY\" = ? ";
  
  private static final String QUERY_ITEM = "SELECT * FROM \"CONCORDDB\".\"CUSTOMER_CREDENTIAL\" WHERE \"CUSTOMER_ID\" =? and \"KEY\" = ?";
  
  private static final String REMOVE_BY_ID = "DELETE FROM \"CONCORDDB\".\"CUSTOMER_CREDENTIAL\" WHERE \"CUSTOMER_ID\" = ? ";
  
  private static final String REMOVE_BY_ID_KEY = "DELETE FROM \"CONCORDDB\".\"CUSTOMER_CREDENTIAL\" WHERE \"CUSTOMER_ID\" = ? and \"KEY\" = ?";
      
  @Override
  public boolean add(String customerId, String key, String value)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_ITEM);
      stmt.setString(1, customerId);
      stmt.setString(2, key);
      stmt.setString(3, value);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + ADD_ITEM, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @Override
  public boolean update(String customerId, String key, String value)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_ITEM);
      stmt.setString(1, value);
      stmt.setString(2, customerId);
      stmt.setString(3, key);      
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_ITEM, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @Override
  public String get(String customerId, String key)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    String value = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ITEM);
      stmt.setString(1, customerId);
      stmt.setString(2, key);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        value = result.getString("VALUE");
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ITEM, e);
      return null;
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return value;
  }

  @Override
  public boolean deleteByCustomer(String customerId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(REMOVE_BY_ID);
      stmt.setString(1, customerId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_ID, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  @Override
  public boolean deleteByCustomerByKey(String customerId, String key)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(REMOVE_BY_ID_KEY);
      stmt.setString(1, customerId);
      stmt.setString(2, key);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_BY_ID_KEY, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
}
