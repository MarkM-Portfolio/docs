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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.directory.members.UserProperty;

public class SubscriberDAOImpl implements ISubscriberDAO
{
  private static final Logger LOG = Logger.getLogger(SubscriberDAOImpl.class.getName());
  
  private static final String QUERY_SUBSCRIBER = "SELECT * FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE \"ID\"=? AND \"TYPE\"=?";
  private static final String QUERY_SUBSCRIBER_FOR_CUSTOMER = "SELECT * FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE \"ID\"=? AND \"TYPE\"=? AND \"CUSTOMER_ID\"=?";
  private static final String QUERY_SUBSCRIBER_BYCRITERIA = "SELECT * FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE ";
  private static final String QUERY_CUSTOMER = "SELECT \"ID\" FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE \"CUSTOMER_ID\"=?";
  private static final String QUERY_EXACT = "SELECT \"ID\" FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE ";
  private static final String QUERY_SUBSTRING = "SELECT \"ID\" FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE ";
  private static final String QUERY_SUBSCRIBER_COUNT = "SELECT COUNT(\"ID\") FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE \"CUSTOMER_ID\"=?";
  private static final String INSERT = "INSERT INTO \"CONCORDDB\".\"SUBSCRIBER\" (\"ID\",\"CUSTOMER_ID\",\"TYPE\",\"LOCALE\",\"DISPLAY_NAME\",\"EMAIL\",\"STATE\",\"ENTITLEMENT\") VALUES (?,?,?,?,?,?,?,?)";
  private static final String DELETE = "DELETE FROM \"CONCORDDB\".\"SUBSCRIBER\" WHERE \"ID\"=? AND \"TYPE\"=?";
  private static final String UPDATE = "UPDATE \"CONCORDDB\".\"SUBSCRIBER\" SET \"CUSTOMER_ID\"=?, \"TYPE\"=?, \"LOCALE\"=?, \"DISPLAY_NAME\"=?, \"EMAIL\"=?, \"STATE\"=?, \"ENTITLEMENT\"=? WHERE \"ID\" = ? AND \"TYPE\"=?";
  private static final String UPDATE_NO_ENTITLEMENT = "UPDATE \"CONCORDDB\".\"SUBSCRIBER\" SET \"CUSTOMER_ID\"=?, \"TYPE\"=?, \"LOCALE\"=?, \"DISPLAY_NAME\"=?, \"EMAIL\"=?, \"STATE\"=? WHERE \"ID\" = ? AND \"TYPE\"=?";
  private static final String UPDATE_ENTITLEMENT = "UPDATE \"CONCORDDB\".\"SUBSCRIBER\" SET \"ENTITLEMENT\"=? WHERE \"ID\" = ? AND \"TYPE\"=?";

  public SubscriberDAOImpl()
  {
    ;
  }

  private Connection dbConn = null;
  public SubscriberDAOImpl(Connection dbConn)
  {
    this.dbConn = dbConn;
  }

  public Map<String, String> getById(String subscriberId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    HashMap<String, String> properties = new HashMap<String, String>();
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(QUERY_SUBSCRIBER);
      stmt.setString(1, subscriberId);
      stmt.setInt(2, Subscriber.TYPE_USER);
      ResultSet result = stmt.executeQuery();

      while (result.next())
      {
        String value = result.getString(COL_CUSTOMER_ID);
        properties.put(UserProperty.PROP_CUSTOMERID.toString(), value);

        value = result.getString(COL_DISPLAY_NAME);
        properties.put(UserProperty.PROP_DISPLAYNAME.toString(), value);

        value = result.getString(COL_LOCALE);
        properties.put(UserProperty.PROP_LOCALE.toString(), value);

        value = result.getString(COL_EMAIL);
        properties.put(UserProperty.PROP_EMAIL.toString(), value);

        value = result.getString(COL_STATE);
        properties.put(UserProperty.PROP_STATE.toString(), value);

        value = result.getString(COL_ENTITLEMENT);
        properties.put(UserProperty.PROP_ENTITLEMENT.toString(), value);

        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_SUBSCRIBER, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }

    return properties;
  }

  public List<String> getByCustomerId(String customerId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ArrayList<String> subscribers = new ArrayList<String>();

    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(QUERY_CUSTOMER);
      stmt.setString(1, customerId);
      ResultSet result = stmt.executeQuery();

      while (result.next())
      {
        String subscriberId = result.getString(COL_SUBSCRIBER_ID);
        subscribers.add(subscriberId);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_CUSTOMER, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }

    return subscribers;
  }

  public List<String> searchByColumnExactMatch(String column, String value)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ArrayList<String> subscribers = new ArrayList<String>();

    String sqlStr = QUERY_EXACT.concat(column).concat("=?");

    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(sqlStr);
      stmt.setString(1, value);
      ResultSet result = stmt.executeQuery();

      while (result.next())
      {
        String subscriberId = result.getString(COL_SUBSCRIBER_ID);
        subscribers.add(subscriberId);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + sqlStr, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }

    return subscribers;
  }

  public List<String> searchByColumnSubString(String column, String value)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ArrayList<String> subscribers = new ArrayList<String>();

    String sqlStr = QUERY_SUBSTRING.concat(column).concat(" LIKE ?");

    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(sqlStr);
      stmt.setString(1, "%" + value + "%");
      ResultSet result = stmt.executeQuery();

      while (result.next())
      {
        String subscriberId = result.getString(COL_SUBSCRIBER_ID);
        subscribers.add(subscriberId);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + sqlStr, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }

    return subscribers;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#getSubscriber(java.lang.String, int)
   */
  public Subscriber getSubscriber(String subscriberId, int type)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(QUERY_SUBSCRIBER);
      stmt.setString(1, subscriberId);
      stmt.setInt(2, type);
      
      ResultSet result = stmt.executeQuery();
      if (result.next())
      {
        String id = result.getString(COL_SUBSCRIBER_ID);
        Subscriber subscriber = new Subscriber(id);
        subscriber.setCustomerId(result.getString(COL_CUSTOMER_ID));
        subscriber.setType(result.getInt(COL_TYPE));
        subscriber.setLocale(result.getString(COL_LOCALE));
        subscriber.setDisplayName(result.getString(COL_DISPLAY_NAME));
        subscriber.setEmail(result.getString(COL_EMAIL));
        subscriber.setState(result.getString(COL_STATE));
        subscriber.setEntitlement(result.getString(COL_ENTITLEMENT));
        return subscriber;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + QUERY_SUBSCRIBER, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return null;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#getSubscriber(java.lang.String, int, java.lang.String)
   */
  public Subscriber getSubscriber(String subscriberId, int type, String customerId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(QUERY_SUBSCRIBER_FOR_CUSTOMER);
      stmt.setString(1, subscriberId);
      stmt.setInt(2, type);
      stmt.setString(3, customerId);
      
      ResultSet result = stmt.executeQuery();
      if (result.next())
      {
        String id = result.getString(COL_SUBSCRIBER_ID);
        Subscriber subscriber = new Subscriber(id);
        subscriber.setCustomerId(result.getString(COL_CUSTOMER_ID));
        subscriber.setType(result.getInt(COL_TYPE));
        subscriber.setLocale(result.getString(COL_LOCALE));
        subscriber.setDisplayName(result.getString(COL_DISPLAY_NAME));
        subscriber.setEmail(result.getString(COL_EMAIL));
        subscriber.setState(result.getString(COL_STATE));
        subscriber.setEntitlement(result.getString(COL_ENTITLEMENT));
        return subscriber;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + QUERY_SUBSCRIBER_FOR_CUSTOMER, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return null;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#getSubscriberByIDsTypes(java.util.List, java.util.List)
   */
  public Map<String, Subscriber> getSubscriberByIDsTypes(List<String> idList, List<Integer> typeList)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    Map<String, Subscriber> subscriberMap = new HashMap<String, Subscriber>();
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      
      int idListSize = idList != null ? idList.size() : 0;
      int typeListSize = typeList != null ? typeList.size() : 0;
      int countPerPage = 40;
      int pages = idListSize / countPerPage + 1;
      for (int page = 0; page < pages; page++)
      {
        int start = page * countPerPage;
        int size = (start + countPerPage) < idListSize ? countPerPage : (idListSize - start);
        if (size <= 0)
        {
          break;
        }
        
        StringBuffer sqlBuffer = new StringBuffer(QUERY_SUBSCRIBER_BYCRITERIA);
        
        for (int index = 0; index < size; index++)
        {
          sqlBuffer.append("(\"ID\"=? AND \"TYPE\"=?) OR ");
        }
        String sql = sqlBuffer.toString();
        sql = sql.endsWith(" OR ") ?  sql.substring(0, sql.length() - " OR ".length()) : sql;
        stmt = conn.prepareStatement(sql);
        
        for (int index = 0; index < size; index++)
        {
          int realIndex = index + start;
          stmt.setString(2 * index + 1, idList.get(realIndex));
          stmt.setInt(2 * index + 2, typeListSize > realIndex ? typeList.get(realIndex) : -1);
        }
        
        ResultSet result = stmt.executeQuery();
        while (result.next())
        {
          String id = result.getString(COL_SUBSCRIBER_ID);
          Subscriber subscriber = new Subscriber(id);
          subscriber.setCustomerId(result.getString(COL_CUSTOMER_ID));
          subscriber.setType(result.getInt(COL_TYPE));
          subscriber.setLocale(result.getString(COL_LOCALE));
          subscriber.setDisplayName(result.getString(COL_DISPLAY_NAME));
          subscriber.setEmail(result.getString(COL_EMAIL));
          subscriber.setState(result.getString(COL_STATE));
          subscriber.setEntitlement(result.getString(COL_ENTITLEMENT));
          
          // The key of the map is: id + "_" + type.
          StringBuffer buffer = new StringBuffer();
          buffer.append(subscriber.getId());
          buffer.append("_");
          buffer.append(subscriber.getType());
          subscriberMap.put(buffer.toString(), subscriber);
        }
        
        stmt.close();
        stmt = null;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + QUERY_SUBSCRIBER_BYCRITERIA, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return subscriberMap;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#getSubscriberCountByCustID(java.lang.String)
   */
  public int getSubscriberCountByCustID(String customerId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    int count = 0;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(QUERY_SUBSCRIBER_COUNT);
      stmt.setString(1, customerId);
      ResultSet result = stmt.executeQuery();
      
      if (result.next())
      {
        count = result.getInt(1);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + QUERY_SUBSCRIBER_COUNT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    
    return count;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#addSubscriber(com.ibm.concord.platform.entitlement.Subscriber)
   */
  public boolean addSubscriber(Subscriber subscriber)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(INSERT);
      stmt.setString(1, subscriber.getId());
      stmt.setString(2, subscriber.getCustomerId());
      stmt.setInt(3, subscriber.getType());
      stmt.setString(4, subscriber.getLocale());
      stmt.setString(5, subscriber.getDisplayName());
      stmt.setString(6, subscriber.getEmail());
      stmt.setString(7, subscriber.getState());
      stmt.setString(8, subscriber.getEntitlement());
      stmt.execute();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + INSERT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#removeSubscriber(java.lang.String, int)
   */
  public boolean removeSubscriber(String subscriberId, int type)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(DELETE);
      stmt.setString(1, subscriberId);
      stmt.setInt(2, type);
      result = (stmt.executeUpdate() >= 0);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + DELETE, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#updateSubscriber(com.ibm.concord.platform.bean.Subscriber)
   */
  public boolean updateSubscriber(Subscriber subscriber)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    String sqlString = null;
    boolean result = false;
    try
    {
      if (subscriber.getEntitlement() == null)
      {
        sqlString = UPDATE_NO_ENTITLEMENT;
        conn = dbConn == null ? DBManager.getConnection() : dbConn;
        stmt = conn.prepareStatement(sqlString);
        stmt.setString(1, subscriber.getCustomerId());
        stmt.setInt(2, subscriber.getType());
        stmt.setString(3, subscriber.getLocale());
        stmt.setString(4, subscriber.getDisplayName());
        stmt.setString(5, subscriber.getEmail());
        stmt.setString(6, subscriber.getState());
        stmt.setString(7, subscriber.getId());
        stmt.setInt(8, subscriber.getType());
        result = (stmt.executeUpdate() > 0);
      }
      else
      {
        sqlString = UPDATE;
        conn = dbConn == null ? DBManager.getConnection() : dbConn;
        stmt = conn.prepareStatement(sqlString);
        stmt.setString(1, subscriber.getCustomerId());
        stmt.setInt(2, subscriber.getType());
        stmt.setString(3, subscriber.getLocale());
        stmt.setString(4, subscriber.getDisplayName());
        stmt.setString(5, subscriber.getEmail());
        stmt.setString(6, subscriber.getState());
        stmt.setString(7, subscriber.getEntitlement());
        stmt.setString(8, subscriber.getId());
        stmt.setInt(9, subscriber.getType());
        result = (stmt.executeUpdate() > 0);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + sqlString, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.platform.dao.ISubscriberDAO#updateSubscriberEntitlement(com.ibm.concord.platform.bean.Subscriber)
   */
  public boolean updateSubscriberEntitlement(Subscriber subscriber)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    boolean result = false;
    try
    {
      conn = dbConn == null ? DBManager.getConnection() : dbConn;
      stmt = conn.prepareStatement(UPDATE_ENTITLEMENT);
      stmt.setString(1, subscriber.getEntitlement());
      stmt.setString(2, subscriber.getId());
      stmt.setInt(3, subscriber.getType());
      result = (stmt.executeUpdate() > 0);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error when executing SQL: " + UPDATE_ENTITLEMENT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }
}
