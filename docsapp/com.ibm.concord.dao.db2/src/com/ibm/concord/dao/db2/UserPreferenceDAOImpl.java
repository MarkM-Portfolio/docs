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

import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.HashMap;

import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.bean.UserPreferenceBean;
import com.ibm.concord.platform.dao.IUserPreferenceDAO;

public class UserPreferenceDAOImpl implements IUserPreferenceDAO
{
  private static final String ADDUSERPREFERENCE = "INSERT INTO \"CONCORDDB\".\"USERPREFERENCE\" (\"USER_ID\",\"PROP_KEY\", \"PROP_VALUE\", \"ORGID\", \"PREFERENCE\") VALUES(?,?,?,?,?)";

  private static final String QUERYUSERPREFERENCE = "SELECT * FROM \"CONCORDDB\".\"USERPREFERENCE\" WHERE \"USER_ID\"=? AND \"PROP_KEY\"=?";

  private static final String UPDATEPREFERENCE = "UPDATE \"CONCORDDB\".\"USERPREFERENCE\" SET \"PREFERENCE\"=? , \"PROP_VALUE\"=? WHERE \"USER_ID\"=? AND \"PROP_KEY\"=?";

  private static final String DELETEPREFERENCE = "DELETE FROM \"CONCORDDB\".\"USERPREFERENCE\" WHERE \"USER_ID\"=? AND \"PROP_KEY\"=?";

  private static final String DELETE_ALL_PREFERENCE = "DELETE FROM \"CONCORDDB\".\"USERPREFERENCE\" WHERE \"USER_ID\"=?";
  
  private static final String QUERYUSERALLPREFERENCE = "SELECT * FROM \"CONCORDDB\".\"USERPREFERENCE\" WHERE \"USER_ID\"=?";

  public boolean add(UserPreferenceBean user)
  {
    if (user == null || user.getUserId() == null)
    {
      return false;
    }
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADDUSERPREFERENCE);
      stmt.setString(1, user.getUserId());
      stmt.setString(2, user.getProp_key());
      if(user.getProp_value() != null){
        stmt.setString(3, user.getProp_value());  
      }else {
        stmt.setString(3, "");
      }
      if(user.getOrg_id() != null){
        stmt.setString(4, user.getOrg_id());  
      }else {
        stmt.setString(4, "");
      }
      if (user.getPreference() != null)
      {
        stmt.setBytes(5, user.getPreference());
      }
      else
      {
        stmt.setNull(5, Types.BLOB);
      }
      stmt.execute();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public HashMap<String,UserPreferenceBean> getAllById(String userid)
  {
    if (userid == null)
    {
      return null;
    }
    UserPreferenceBean user = null;
    Connection conn = null;
    PreparedStatement stmt = null;
    HashMap<String,UserPreferenceBean> map = new HashMap<String,UserPreferenceBean>();
    String propertyKey = null;
    
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(QUERYUSERALLPREFERENCE);
      stmt.setString(1, userid);
      ResultSet result = stmt.executeQuery();
      while(result.next())
      {
        user = new UserPreferenceBean();
        user.setUserId(result.getString("USER_ID"));
        propertyKey = result.getString("PROP_KEY");
        user.setProp_key(propertyKey);
        user.setProp_value(result.getString("PROP_VALUE"));
        user.setOrg_id(result.getString("ORGID"));
        
        if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME))
        {
          byte[] bytes = result.getBytes("PREFERENCE");     
          user.setPreference(bytes);
        }
        else
        {
          Blob preference = result.getBlob("PREFERENCE");          
          if (preference != null)
          {
            byte[] bytes = preference.getBytes(1L, (int) preference.length());
            user.setPreference(bytes);
          }
          else
          {
            user.setPreference(null);
          }
        }
        
        map.put(propertyKey, user);
      }
      result.close();      
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return map;
  }
  public UserPreferenceBean getById(String userid, String prop_key)
  {
    if (userid == null)
    {
      return null;
    }
    UserPreferenceBean user = null;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(QUERYUSERPREFERENCE);
      stmt.setString(1, userid);
      stmt.setString(2, prop_key);
      ResultSet result = stmt.executeQuery();
      while (result.next())
      {
        user = new UserPreferenceBean();
        user.setUserId(result.getString("USER_ID"));
        user.setProp_key(result.getString("PROP_KEY"));
        user.setOrg_id(result.getString("ORGID"));
        user.setProp_value(result.getString("PROP_VALUE"));
        
        if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME)){
          byte[] bytes = result.getBytes("PREFERENCE");     
          user.setPreference(bytes);
        }
        else
        {
          Blob preference = result.getBlob("PREFERENCE");
          if (preference != null)
          {
            byte[] bytes = preference.getBytes(1L, (int) preference.length());
            user.setPreference(bytes);
          }
          else
          {
            user.setPreference(null);
          }
        }
      }
      result.close();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return null;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return user;
  }

  public boolean update(UserPreferenceBean user)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    if (user == null || user.getUserId() == null || user.getProp_key() == null)
    {
      return false;
    }
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(UPDATEPREFERENCE);
      stmt.setBytes(1, user.getPreference());
      stmt.setString(2, user.getProp_value());
      stmt.setString(3, user.getUserId());
      stmt.setString(4, user.getProp_key());
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean delete(UserPreferenceBean user)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    if (user == null || user.getUserId() == null || user.getProp_key() == null)
    {
      return false;
    }
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DELETEPREFERENCE);
      stmt.setString(1, user.getUserId());
      stmt.setString(2, user.getProp_key());
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean delete(String userid)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    if (userid == null)
    {
      return false;
    }
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DELETE_ALL_PREFERENCE);
      stmt.setString(1, userid);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      e.printStackTrace();
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }
}
