package com.ibm.concord.dao.db2;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.common.oauth.IOAuthTokenListener;
import com.ibm.docs.common.oauth.OAuthToken;

public class OAuthTokenDAOImpl implements IOAuthTokenListener
{
  private static final Logger LOG = Logger.getLogger(OAuthTokenDAOImpl.class.getName());
  
  private static final String ADD_ITEM = "INSERT INTO \"CONCORDDB\".\"CUSTOMER_OAUTHTOKEN\" ( \"REPOID\",\"USERID\",\"DOCID\",\"ACCESSTOKEN\",\"REFRESHTOKEN\", \"EXPIRETIME\") VALUES (?,?,?,?,?,?)";
  
  // private static final String UPDATE_ITEM = "UPDATE \"CONCORDDB\".\"CUSTOMER_OAUTHTOKEN\" SET (\"ACCESSTOKEN\",\"REFRESHTOKEN\",\"EXPIRETIME\") = (?,?,?)  WHERE \"REPOID\" = ? and \"USERID\" = ? and \"DOCID\" = ?";
  
  private static final String UPDATE_ITEM = "UPDATE \"CONCORDDB\".\"CUSTOMER_OAUTHTOKEN\" SET \"ACCESSTOKEN\" = ?, \"REFRESHTOKEN\" = ?, \"EXPIRETIME\" = ?  WHERE \"REPOID\" = ? and \"USERID\" = ? and \"DOCID\" = ?";
  
  private static final String QUERY_ITEM = "SELECT * FROM \"CONCORDDB\".\"CUSTOMER_OAUTHTOKEN\" WHERE \"REPOID\" = ? and \"USERID\" = ? and \"DOCID\" = ?";
  
  private static final String DELETE_ITEM = "DELETE FROM \"CONCORDDB\".\"CUSTOMER_OAUTHTOKEN\" WHERE \"REPOID\" = ? and \"USERID\" = ? and \"DOCID\" = ?";
  
  @Override
  public OAuthToken getOAuth2Token(String user, String repoId, String fileId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    String accessToken = null;
    String refreshToken = null;
    Timestamp expireTime = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ITEM);
      stmt.setString(1, repoId);
      stmt.setString(2, user);
      stmt.setString(3, fileId);
      result = stmt.executeQuery();
    
      while (result.next())
      {
        accessToken = result.getString("ACCESSTOKEN");
        refreshToken = result.getString("REFRESHTOKEN");
        expireTime = result.getTimestamp("EXPIRETIME");
        return new OAuthToken(user, repoId, fileId, accessToken, refreshToken, expireTime.getTime());
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL ${0} with repoId ${1} fileId ${2} user ${3} with error {4}", new Object[]{ QUERY_ITEM, repoId, fileId, user, e});
      return null;
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return null;
  }

  @Override
  public boolean updateOAuth2Token(OAuthToken token)
  {
    if (token == null) {
      LOG.log(Level.WARNING, "The OAuthToken is not allowed to be null when update db.");
      return false;
    }
    String user = token.getUser();
    String repoId = token.getRepoId();
    String fileId = token.getFileId();
    if (getOAuth2Token(user, repoId, fileId) == null) 
    {
      // add
      Connection conn = null;
      PreparedStatement stmt = null;
      try
      {
        conn = DBManager.getConnection();
        stmt = conn.prepareStatement(ADD_ITEM);
        stmt.setString(1, repoId);
        stmt.setString(2, user);
        stmt.setString(3, fileId);
        stmt.setString(4, token.getAccessToken());
        stmt.setString(5, token.getRefreshToken());
        stmt.setTimestamp(6, new Timestamp(token.getExpirationTimestamp()));
        stmt.execute();
        return true;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when executing SQL ${0} with repoId ${1} fileId ${2} user ${3} with error {4}", new Object[]{ ADD_ITEM, repoId, fileId, user, e});
        return false;
      }
      finally
      {
        DBManager.safeClose(null, stmt, conn);
      }
    } else 
    {
      // update
      Connection conn = null;
      PreparedStatement stmt = null;
      try
      {
        conn = DBManager.getConnection();
        stmt = conn.prepareStatement(UPDATE_ITEM);
        stmt.setString(1, token.getAccessToken());
        stmt.setString(2, token.getRefreshToken());
        stmt.setTimestamp(3, new Timestamp(token.getExpirationTimestamp()));
        stmt.setString(4, repoId);
        stmt.setString(5, user);
        stmt.setString(6, fileId);
        stmt.executeUpdate();
        return true;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when executing SQL ${0} with repoId ${1} fileId ${2} user ${3} with error {4}", new Object[]{ UPDATE_ITEM, repoId, fileId, user, e});
        return false;
      }
      finally
      {
        DBManager.safeClose(null, stmt, conn);
      }
    }
  }
  
  public boolean deleteOAuth2Token(String user, String repoId, String fileId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(DELETE_ITEM);
      stmt.setString(1, repoId);
      stmt.setString(2, user);
      stmt.setString(3, fileId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL ${0} with repoId ${1} fileId ${2} user ${3} with error {4}", new Object[]{ DELETE_ITEM, repoId, fileId, user, e});
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

}
