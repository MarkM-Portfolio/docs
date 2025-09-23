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

import com.ibm.concord.platform.bean.DocMessageBean;
import com.ibm.concord.platform.dao.IDocMessageDAO;
import com.ibm.concord.spi.exception.AccessException;

public class DocMessageDAOImpl implements IDocMessageDAO
{
  private static final Logger LOG = Logger.getLogger(DocMessageDAOImpl.class.getName());

  private static final String ADD_MESSAGE = "INSERT INTO \"CONCORDDB\".\"MESSAGE\" ( \"URI\",\"REPO_ID\",\"USER_ID\",\"MESSAGE_TYPE\",\"BYTESMESSAGE\",\"MSGTIMESTAMP\", \"EXPIRATION\", \"DUEDATE\", \"CHANGESET\") VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?)";

  private static final String UPDATE_MESSAGE = " UPDATE \"CONCORDDB\".\"MESSAGE\" SET  \"BYTESMESSAGE\"=?, \"EXPIRATION\"=?, \"DUEDATE\"=?, \"CHANGESET\"=? WHERE \"URI\" = ? and \"REPO_ID\" = ? and \"USER_ID\" = ? and \"MESSAGE_TYPE\" = ?";

  private static final String QUERY_MESSAGE_BYUSER = "SELECT * FROM \"CONCORDDB\".\"MESSAGE\" WHERE \"USER_ID\" =?";

  private static final String QUERY_MESSAGE = "SELECT * FROM \"CONCORDDB\".\"MESSAGE\" WHERE \"URI\" =? and \"REPO_ID\" = ? and \"USER_ID\" =? and \"MESSAGE_TYPE\" = ?";
  
  private static final String REMOVE_MESSAGE = "DELETE FROM \"CONCORDDB\".\"MESSAGE\" WHERE \"URI\" =? and \"REPO_ID\" = ? and \"USER_ID\" =? and \"MESSAGE_TYPE\" = ?";

  public boolean addMessage(DocMessageBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_MESSAGE);
      stmt.setString(1, bean.getUri());
      stmt.setString(2, bean.getRepoid());
      stmt.setString(3, bean.getUserid());
      stmt.setString(4, bean.getMessageType());
      stmt.setString(5, bean.getBytesMessage());
      stmt.setTimestamp(6, bean.getExpiration());
      stmt.setTimestamp(7, bean.getDuedate());
      stmt.setString(8, bean.getChangeset());
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("failed to add a message");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean updateMessage(DocMessageBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_MESSAGE);
      stmt.setString(1, bean.getBytesMessage());
      stmt.setTimestamp(2, bean.getExpiration());
      stmt.setTimestamp(3, bean.getDuedate());
      stmt.setString(4, bean.getChangeset());
      stmt.setString(5, bean.getUri());
      stmt.setString(6, bean.getRepoid());
      stmt.setString(7, bean.getUserid());
      stmt.setString(8, bean.getMessageType());
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_MESSAGE, e);
      throw new AccessException("failed to update");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

  public DocMessageBean getMessage(String docUri, String docRepo, String userid, String type) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocMessageBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_MESSAGE);
      stmt.setString(1, docUri);
      stmt.setString(2, docRepo);
      stmt.setString(3, userid);
      stmt.setString(4, type);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocMessageBean();

        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setUserid(result.getString("USER_ID"));
        bean.setMessageType(result.getString("MESSAGE_TYPE"));
        bean.setBytesMessage(result.getString("BYTESMESSAGE"));
        bean.setMsgTimestamp(result.getTimestamp("MSGTIMESTAMP"));
        bean.setExpiration(result.getTimestamp("EXPIRATION"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setChangeset(result.getString("CHANGESET"));

        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_MESSAGE, e);
      throw new AccessException("failed to get message");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  public List<DocMessageBean> getMessageByUser(String userid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocMessageBean> beanList = new ArrayList<DocMessageBean>();
    DocMessageBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_MESSAGE_BYUSER);
      stmt.setString(1, userid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocMessageBean();

        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setUserid(result.getString("USER_ID"));
        bean.setMessageType(result.getString("MESSAGE_TYPE"));
        bean.setBytesMessage(result.getString("BYTESMESSAGE"));
        bean.setMsgTimestamp(result.getTimestamp("MSGTIMESTAMP"));
        bean.setExpiration(result.getTimestamp("EXPIRATION"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setChangeset(result.getString("CHANGESET"));

        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_MESSAGE_BYUSER, e);
      throw new AccessException("failed to get messages");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

  public boolean deleteMessage(String docUri, String docRepo, String userid, String type) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_MESSAGE);
      stmt.setString(1, docUri);
      stmt.setString(2, docRepo);
      stmt.setString(3, userid);
      stmt.setString(4, type);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_MESSAGE, e);
      return false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public List<DocMessageBean> getMessageByDuedate(String userid, Timestamp duedate) throws AccessException
  {
    if(userid == null || duedate == null){
      throw new IllegalArgumentException("userid or duedate can't be null");
    }
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocMessageBean> beanList = new ArrayList<DocMessageBean>();
    DocMessageBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_MESSAGE_BYUSER);
      stmt.setString(1, userid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocMessageBean();

        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setUserid(result.getString("USER_ID"));
        bean.setMessageType(result.getString("MESSAGE_TYPE"));
        bean.setBytesMessage(result.getString("BYTESMESSAGE"));
        bean.setMsgTimestamp(result.getTimestamp("MSGTIMESTAMP"));
        bean.setExpiration(result.getTimestamp("EXPIRATION"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setChangeset(result.getString("CHANGESET"));
        
        if(bean.getDuedate().getTime() < duedate.getTime())
          beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_MESSAGE_BYUSER, e);
      throw new AccessException("failed to get messages");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

  public List<DocMessageBean> getMessageByDate(String userid, Timestamp date) throws AccessException
  {
    if(userid == null || date == null){
      throw new IllegalArgumentException("userid or duedate can't be null");
    }
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocMessageBean> beanList = new ArrayList<DocMessageBean>();
    DocMessageBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_MESSAGE_BYUSER);
      stmt.setString(1, userid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocMessageBean();

        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setUserid(result.getString("USER_ID"));
        bean.setMessageType(result.getString("MESSAGE_TYPE"));
        bean.setBytesMessage(result.getString("BYTESMESSAGE"));
        bean.setMsgTimestamp(result.getTimestamp("MSGTIMESTAMP"));
        bean.setExpiration(result.getTimestamp("EXPIRATION"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setChangeset(result.getString("CHANGESET"));
        
        if(bean.getMsgTimestamp().getTime() < date.getTime())
          beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_MESSAGE_BYUSER, e);
      throw new AccessException("failed to get messages");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

}
