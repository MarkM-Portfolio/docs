/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.dao.db2;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.bean.RevisionBean;
import com.ibm.concord.platform.dao.IRevisionDAO;
import com.ibm.concord.platform.revision.IRevision;
import com.ibm.json.java.JSONArray;

public class DocRevisionDAOImpl implements IRevisionDAO
{
  private static final Logger LOG = Logger.getLogger(DocRevisionDAOImpl.class.getName());
  
  private static final String COLUMN_REPOID = "REPO_ID";
  
  private static final String COLUMN_DOCID = "DOC_ID";
  
  private static final String COLUMN_MAJOR_NO = "MAJOR_NO";
  
  private static final String COLUMN_MINOR_NO = "MINOR_NO";
  
  private static final String COLUMN_REV_TYPE = "REV_TYPE";
  
  private static final String COLUMN_MODIFIERS = "MODIFIERS";
  
  private static final String COLUMN_PUBLISH_DATE = "PUBLISH_DATE";
  
  private static final String COLUMN_REFERENCE = "REFERENCE";
  
  private static final String QUERY_REVISION = "SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? and \"MAJOR_NO\" = ? and \"MINOR_NO\" = ?";
  
  private static final String QUERY_REVISIONS_BY_DOC = "SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? order by \"MAJOR_NO\", \"MINOR_NO\"";
  
  private static final String QUERY_MAJOR_REVISIONS_BY_DOC = "SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? and \"MINOR_NO\" = 0 order by \"MAJOR_NO\"";
  
  private static final String QUERY_REVISIONS_BY_DOC_MAJOR = "SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? and \"MAJOR_NO\" = ?  and \"MINOR_NO\" != 0 order by \"MINOR_NO\"";
  
  private static String QUERY_LAST_REVISION_BY_DOC = null;
  private static final String DB2_QUERY_LAST_REVISION_BY_DOC = "SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? order by \"MAJOR_NO\" DESC, \"MINOR_NO\" DESC fetch first 1 rows only";//db2 only
  private static final String SQLSERVER_QUERY_LAST_REVISION_BY_DOC = "SELECT TOP 1 * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\" =? and \"DOC_ID\" = ? order by \"MAJOR_NO\" DESC, \"MINOR_NO\" DESC";//sqlserver only
  private static final String ORACLE_QUERY_LAST_REVISION_BY_DOC = "SELECT * FROM (SELECT * FROM \"CONCORDDB\".\"DOC_REVISION\" WHERE \"REPO_ID\"=? and \"DOC_ID\"=? order by \"MAJOR_NO\" DESC, \"MINOR_NO\" DESC) WHERE ROWNUM=1"; // oracle only
  
  private static final String ADD_REVISION = "INSERT INTO \"CONCORDDB\".\"DOC_REVISION\" (\"REPO_ID\", \"DOC_ID\", \"MAJOR_NO\", \"MINOR_NO\", \"REV_TYPE\", \"MODIFIERS\", \"PUBLISH_DATE\", \"LAST_MODIFIED\", \"REFERENCE\") VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?)";
  
  public DocRevisionDAOImpl()
  {
    if ("Oracle".equals(DBConnection.DATABASE_NAME))
    {
      QUERY_LAST_REVISION_BY_DOC = ORACLE_QUERY_LAST_REVISION_BY_DOC;
    }
    else if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME))
    {
      QUERY_LAST_REVISION_BY_DOC = SQLSERVER_QUERY_LAST_REVISION_BY_DOC;
    }    
    else
    {
      QUERY_LAST_REVISION_BY_DOC = DB2_QUERY_LAST_REVISION_BY_DOC;
    }
  }
  
  public IRevision getRevision(String repoId, String docUri, String revisionNo)
  {
    String[] s = revisionNo.split("\\.");
    int minorNo = 0;
    int majorNo = 0;
    
    majorNo = Integer.parseInt(s[0]);
    if (s.length > 1)
      minorNo = Integer.parseInt(s[1]);
      
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    IRevision bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_REVISION);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      stmt.setInt(3, majorNo);
      stmt.setInt(4, minorNo);
      
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = parseRevision(result);
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_REVISION, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  public IRevision getLastRevision(String repoId, String docUri)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    ResultSet result = null;
    IRevision bean = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(QUERY_LAST_REVISION_BY_DOC);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = parseRevision(result);
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_LAST_REVISION_BY_DOC, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;  
 }

  public List<IRevision> getAllRevision(String repoId, String docUri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<IRevision> revisions = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_REVISIONS_BY_DOC);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      
      result = stmt.executeQuery();
      revisions = new ArrayList<IRevision>();
      while (result.next())
      {
        try
        {
          IRevision bean = parseRevision(result);
          revisions.add(bean);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Error to parse revision " + result.toString(), e);
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_REVISIONS_BY_DOC, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return revisions;  
  }

  public List<IRevision> getAllRevision(String repoId, String docUri, boolean includeMinor)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<IRevision> revisions = new ArrayList<IRevision>();
    String sql = null;
    try
    {
      if (includeMinor)
        sql = QUERY_REVISIONS_BY_DOC;
      else
        sql = QUERY_MAJOR_REVISIONS_BY_DOC;
      stmt = conn.prepareStatement(sql);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      
      result = stmt.executeQuery();

      while (result.next())
      {
        try
        {
          IRevision bean = parseRevision(result);
          revisions.add(bean);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Error to parse revision " + result.toString(), e);
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + sql, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return revisions;  
 }


  public List<IRevision> getAllMinorRevision(String repoId, String docUri, int majorNo)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<IRevision> revisions = new ArrayList<IRevision>();
    try
    {
      stmt = conn.prepareStatement(QUERY_REVISIONS_BY_DOC_MAJOR);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      stmt.setInt(3, majorNo);
      
      result = stmt.executeQuery();

      while (result.next())
      {
        try
        {
          IRevision bean = parseRevision(result);
          revisions.add(bean);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Error to parse revision " + result.toString(), e);
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_REVISIONS_BY_DOC_MAJOR, e);
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return revisions;  
 }

  public boolean addRevision(IRevision revision)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    boolean bSucc = false;
    try
    {
      stmt = conn.prepareStatement(ADD_REVISION);
      stmt.setString(1, revision.getRepository());
      stmt.setString(2, revision.getDocUri());
      stmt.setInt(3, revision.getMajorRevisionNo());
      stmt.setInt(4, revision.getMinorRevisionNo());
      stmt.setString(5, revision.getType());
      
      stmt.setString(6, revision.getModifiers().serialize());
      stmt.setTimestamp(7, new Timestamp(revision.getPublishTime().getTimeInMillis()));
      stmt.setString(8, revision.getReferenceRevision());
      
      stmt.execute();
      bSucc = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + ADD_REVISION, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return bSucc;
  }
  
  private IRevision parseRevision(ResultSet result) throws SQLException
  {
    String repoId = result.getString(COLUMN_REPOID);
    String docUri = result.getString(COLUMN_DOCID);
    int majorNo = result.getInt(COLUMN_MAJOR_NO);
    int minorNo = result.getInt(COLUMN_MINOR_NO);
    String type = result.getString(COLUMN_REV_TYPE);
    String reference = result.getString(COLUMN_REFERENCE);
    String sModifier = result.getString(COLUMN_MODIFIERS);
    JSONArray modifiers = null;
    try
    {
      modifiers = JSONArray.parse(sModifier);
    }
    catch (IOException e)
    {
      LOG.warning("Failed to parse modifier " + sModifier);
    }
    
    Timestamp publishTimeStamp = result.getTimestamp(COLUMN_PUBLISH_DATE);    
    Calendar publishTime = Calendar.getInstance();
    publishTime.setTimeInMillis(publishTimeStamp.getTime());

    RevisionBean revision = new RevisionBean(repoId, docUri, majorNo, minorNo, type, reference, publishTime, modifiers);
    return revision;

  }
}
