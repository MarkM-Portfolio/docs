package com.ibm.concord.dao.db2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import com.ibm.concord.platform.bean.UserDocCacheBean;

import com.ibm.concord.platform.dao.IUserDocCacheDAO;

public class UserDocCacheDAOImpl implements IUserDocCacheDAO
{
  private static final String ADD_USER_DOC_CACHE = "insert into concorddb.user_doc_cache(\"USER_ID\",\"DOC_ID\",\"CACHE_KEY\",\"CACHE_VALUE\") values(?,?,?,?)";
  private static final String SELECT_USER_DOC_CACHE = "select CACHE_VALUE from concorddb.user_doc_cache where USER_ID = ? and DOC_ID=? and CACHE_KEY=?";
  private static final String UPDATE_USER_DOC_CACHE = "update concorddb.user_doc_cache set CACHE_VALUE = ? where USER_ID = ? and DOC_ID=? and CACHE_KEY=?";
  private static final String DELETE_USER_CACHE = "delete from concorddb.user_doc_cache where USER_ID = ?";
  private static final String DELETE_DOC_CACHE = "delete from concorddb.user_doc_cache where DOC_ID = ?";
  
  public boolean add(UserDocCacheBean bean)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_USER_DOC_CACHE);
      stmt.setString(1, bean.getUserId());
      stmt.setString(2, bean.getDocId());
      stmt.setString(3, bean.getCacheKey());  
      stmt.setString(4, bean.getCacheValue());
     
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

  public boolean update(UserDocCacheBean bean)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(UPDATE_USER_DOC_CACHE);
      stmt.setString(1, bean.getCacheValue());
      stmt.setString(2, bean.getUserId());
      stmt.setString(3, bean.getDocId());
      stmt.setString(4, bean.getCacheKey());  
     
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

  public UserDocCacheBean getCacheValue(String user_id, String doc_id, String cache_key)
  {
    UserDocCacheBean bean = null;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(SELECT_USER_DOC_CACHE);
      stmt.setString(1, user_id);
      stmt.setString(2, doc_id);
      stmt.setString(3, cache_key);  
      stmt.execute();
      
      String cache_value = null;
      ResultSet result = stmt.executeQuery();
      if(result.next())
        cache_value = result.getString(1);
      
      if(cache_value!=null)
      {
        bean = new UserDocCacheBean();
        bean.setUserId(user_id);
        bean.setDocId(doc_id);
        bean.setCacheKey(cache_key);
        bean.setCacheValue(cache_value);
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return bean;
  }

  public boolean deleteUserCache(String userId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DELETE_USER_CACHE);
      stmt.setString(1, userId);
     
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

  public boolean deleteDocCache(String docId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DELETE_DOC_CACHE);
      stmt.setString(1, docId);
     
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
}
