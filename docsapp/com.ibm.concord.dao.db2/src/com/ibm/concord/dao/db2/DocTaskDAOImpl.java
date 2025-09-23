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
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocTaskBean;
import com.ibm.concord.platform.dao.IDocTaskDAO;
import com.ibm.concord.spi.exception.AccessException;

public class DocTaskDAOImpl implements IDocTaskDAO
{
  private static final Logger LOG = Logger.getLogger(DocTaskDAOImpl.class.getName());

  private static final String QUERY_TASK = "SELECT * FROM \"CONCORDDB\".\"TASK\" WHERE \"TASK_ID\" =?";

  private static final String QUERY_TASKS = "SELECT * FROM \"CONCORDDB\".\"TASK\" WHERE \"REPO_ID\" =? and \"URI\" = ?";
  
  private static final String QUERY_TASKS_BYUSER= "SELECT * FROM \"CONCORDDB\".\"TASK\" WHERE \"ASSIGNEE\" =? or \"REVIEWER\" =?";

  private static final String ADD_TASK = "INSERT INTO \"CONCORDDB\".\"TASK\" ( \"TASK_ID\",\"URI\",\"REPO_ID\",\"AUTHOR\",\"TASKSTATE\",\"CREATEDATE\",\"DUEDATE\", \"LASTMODIFY\", \"ASSOCIATION_ID\", \"TASKTITLE\", \"ASSIGNEE\", \"REVIEWER\", \"TASKCONTENT\", \"VERSION_ID\", \"FRAGMENT_ID\",\"CHANGESET\") VALUES (?,?,?,?,?,CURRENT_TIMESTAMP,?,CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?)";

  private static final String UPDATE_TASK = " UPDATE \"CONCORDDB\".\"TASK\" SET  \"TASKSTATE\"=?, \"DUEDATE\"=?, \"LASTMODIFY\"=?, \"ASSOCIATION_ID\"=?, \"TASKTITLE\"=?, \"ASSIGNEE\"=?, \"REVIEWER\"=?, \"TASKCONTENT\"=?, \"VERSION_ID\"=?, \"FRAGMENT_ID\"=?, \"CHANGESET\"=? WHERE \"TASK_ID\" = ? ";

  private static final String REMOVETASKS_BYDOC = "DELETE FROM \"CONCORDDB\".\"TASK\" WHERE \"REPO_ID\" = ? and \"URI\" = ?";

  private static final String REMOVETASKS_BYASSOCIATION = "DELETE FROM \"CONCORDDB\".\"TASK\" WHERE \"ASSOCIATION_ID\" = ?";

  private static final String REMOVE_TASK = "DELETE FROM \"CONCORDDB\".\"TASK\" WHERE \"TASK_ID\" = ?";

  public boolean add(DocTaskBean task) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_TASK);
      stmt.setString(1, task.getTaskid());
      stmt.setString(2, task.getUri());
      stmt.setString(3, task.getRepoid());
      stmt.setString(4, task.getAuthor());
      stmt.setString(5, task.getState());
      stmt.setTimestamp(6, task.getDuedate());
      stmt.setString(7, task.getAssociationid());
      stmt.setString(8, task.getTitle());
      stmt.setString(9, task.getAssignee());
      stmt.setString(10, task.getReviewer());
      stmt.setString(11, task.getContent());
      stmt.setString(12, task.getVersionid());
      stmt.setString(13, task.getFragid());
      stmt.setString(14, task.getChangeset());
      stmt.execute();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("failed to insert a task");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public DocTaskBean getTask(String taskid) throws AccessException
  {

    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocTaskBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_TASK);
      stmt.setString(1, taskid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocTaskBean();

        bean.setTaskid(result.getString("TASK_ID"));
        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setAuthor(result.getString("AUTHOR"));
        bean.setState(result.getString("TASKSTATE"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setLastModify(result.getTimestamp("LASTMODIFY"));
        bean.setAssociationid(result.getString("ASSOCIATION_ID"));
        bean.setTitle(result.getString("TASKTITLE"));
        bean.setAssignee(result.getString("ASSIGNEE"));
        bean.setReviewer(result.getString("REVIEWER"));
        bean.setContent(result.getString("TASKCONTENT"));
        bean.setVersionid(result.getString("VERSION_ID"));
        bean.setFragid(result.getString("FRAGMENT_ID"));
        bean.setChangeset(result.getString("CHANGESET"));

        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_TASK, e);
      throw new AccessException("failed to get task");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }
  
  public List<DocTaskBean> getTasksByOwner(String owner) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocTaskBean> beanList = new ArrayList<DocTaskBean>();
    DocTaskBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_TASKS_BYUSER);
      stmt.setString(1, owner);
      stmt.setString(2, owner);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocTaskBean();

        bean.setTaskid(result.getString("TASK_ID"));
        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setAuthor(result.getString("AUTHOR"));
        bean.setState(result.getString("TASKSTATE"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setLastModify(result.getTimestamp("LASTMODIFY"));
        bean.setAssociationid(result.getString("ASSOCIATION_ID"));
        bean.setTitle(result.getString("TASKTITLE"));
        bean.setAssignee(result.getString("ASSIGNEE"));
        bean.setReviewer(result.getString("REVIEWER"));
        bean.setContent(result.getString("TASKCONTENT"));
        bean.setVersionid(result.getString("VERSION_ID"));
        bean.setFragid(result.getString("FRAGMENT_ID"));
        bean.setChangeset(result.getString("CHANGESET"));

        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_TASKS_BYUSER, e);
      throw new AccessException("failed to get tasks");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }
  
  public List<DocTaskBean> getTasks(String docRepo, String docUri) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocTaskBean> beanList = new ArrayList<DocTaskBean>();
    DocTaskBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_TASKS);
      stmt.setString(1, docRepo);
      stmt.setString(2, docUri);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocTaskBean();

        bean.setTaskid(result.getString("TASK_ID"));
        bean.setUri(result.getString("URI"));
        bean.setRepoid(result.getString("REPO_ID"));
        bean.setAuthor(result.getString("AUTHOR"));
        bean.setState(result.getString("TASKSTATE"));
        bean.setCreateDate(result.getTimestamp("CREATEDATE"));
        bean.setDuedate(result.getTimestamp("DUEDATE"));
        bean.setLastModify(result.getTimestamp("LASTMODIFY"));
        bean.setAssociationid(result.getString("ASSOCIATION_ID"));
        bean.setTitle(result.getString("TASKTITLE"));
        bean.setAssignee(result.getString("ASSIGNEE"));
        bean.setReviewer(result.getString("REVIEWER"));
        bean.setContent(result.getString("TASKCONTENT"));
        bean.setVersionid(result.getString("VERSION_ID"));
        bean.setFragid(result.getString("FRAGMENT_ID"));
        bean.setChangeset(result.getString("CHANGESET"));

        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_TASKS, e);
      throw new AccessException("failed to get tasks");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

  /**
   * Delete tasks associated with the association
   * 
   * @param associationid
   *          , id of association
   * @return
   */
  public boolean deleteByAssociationID(String associationid) throws AccessException
  {

    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVETASKS_BYASSOCIATION);
      stmt.setString(1, associationid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVETASKS_BYASSOCIATION, e);
      throw new AccessException("failed to deleteByAssociationID");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  /**
   * Delete the task by the given task id
   * 
   * @param taskid
   *          , id of task
   */
  public boolean deleteByTaskID(String taskid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_TASK);
      stmt.setString(1, taskid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_TASK, e);
      throw new AccessException("failed to deleteByTaskID");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  /**
   * Delete tasks in a given doc
   * 
   * @param docRep
   *          , doc repository
   * @param docUri
   *          , doc's uri
   */
  public boolean deleteByDocID(String docRepo, String docUri)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVETASKS_BYDOC);
      stmt.setString(1, docRepo);
      stmt.setString(2, docUri);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVETASKS_BYDOC, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean update(DocTaskBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_TASK);
      stmt.setString(1, bean.getState());
      stmt.setTimestamp(2, bean.getDuedate());
      stmt.setTimestamp(3, bean.getLastModify());
      stmt.setString(4, bean.getAssociationid());
      stmt.setString(5, bean.getTitle());
      stmt.setString(6, bean.getAssignee());
      stmt.setString(7, bean.getReviewer());
      stmt.setString(8, bean.getContent());
      stmt.setString(9, bean.getVersionid());
      stmt.setString(10, bean.getFragid());
      stmt.setString(11, bean.getChangeset());
      
      stmt.setString(12, bean.getTaskid());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_TASK, e);
      throw new AccessException("failed to update");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

}
