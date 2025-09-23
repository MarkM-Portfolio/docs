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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.dao.db2.util.DBUtil;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.IDocHistoryDAO;

public class DocHistoryDAOImpl implements IDocHistoryDAO
{
  private static final Logger LOG = Logger.getLogger(DocHistoryDAOImpl.class.getName());

  private static final String ADD_DOCHISTORY = "INSERT INTO \"CONCORDDB\".\"DOC_HISTORY\" ( \"REPO_ID\",\"URI\",\"LAST_MODIFIED\",\"ORG_ID\", \"DOC_ID\", \"VERSION_SERIES_ID\", \"LIBRARY_ID\", \"COMMUNITY_ID\", \"AUTO_PUBLISH\", \"AUTO_PUBLISH_AT\", \"DLAST_VISIT\", \"SLAST_VISIT\", \"UPLOAD_CREATED\", \"STATUS\") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

  private static final String QUERY_DOCHISTORY = "SELECT * FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"URI\" = ?";

  private static final String QUERY_DOCHISTORY_BY_DOCID = "SELECT * FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"DOC_ID\" = ?";

  private static final String QUERY_DOCHISTORY_BY_VERSIONSERIES_BY_LIB = "SELECT * FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"LIBRARY_ID\" = ? and \"VERSION_SERIES_ID\" = ?";

  private static final String QUERY_DOCHISTORY_BY_VERSIONSERIES = "SELECT * FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"VERSION_SERIES_ID\" = ?";

  private static final String DELETE_DOCHISTORY = "DELETE FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"URI\" = ?";

  private static final String DELETE_DOCHISTORY_BY_DOCID = "DELETE FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"DOC_ID\" = ?";

  private static final String DELETE_DOCHISTORY_BY_VERSIONSERIES_BY_LIB = "DELETE FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"VERSION_SERIES_ID\" = ?";

  private static final String DELETE_DOCHISTORY_BY_VERSIONSERIES = "DELETE FROM \"CONCORDDB\".\"DOC_HISTORY\" WHERE \"REPO_ID\" = ? and \"LIBRARY_ID\" = ? and \"VERSION_SERIES_ID\" = ?";

  private static final String UPDATE_DOCHISTORY = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_EXT = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ?, \"AUTO_PUBLISH_AT\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_AUTOPUBLISH = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"AUTO_PUBLISH\" = ?, \"ORG_ID\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_AUTOPUBLISH_AT = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"AUTO_PUBLISH_AT\" = ?, \"ORG_ID\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DLAST_VISIT = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"DLAST_VISIT\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_SLAST_VISIT = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"SLAST_VISIT\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY2 = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ?,  \"UPLOAD_CREATED\" = ?, \"STATUS\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_EXT2 = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ?, \"AUTO_PUBLISH_AT\" = ?, \"UPLOAD_CREATED\" = ?, \"STATUS\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_CACHE_STATUS = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ?, \"STATUS\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  private static final String UPDATE_DOCHISTORY_EXT_CACHE_STATUS = "UPDATE \"CONCORDDB\".\"DOC_HISTORY\" SET \"LAST_MODIFIED\" = ?, \"ORG_ID\" = ?, \"AUTO_PUBLISH_AT\" = ?, \"STATUS\" = ? WHERE \"REPO_ID\" = ? and \"URI\" = ? ";

  public boolean add(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_DOCHISTORY);
      stmt.setString(1, dhb.getRepoId());
      stmt.setString(2, dhb.getDocUri());
      stmt.setLong(3, dhb.getLastModified());
      stmt.setString(4, dhb.getOrgId());
      stmt.setString(5, dhb.getDocId());
      stmt.setString(6, dhb.getVersionSeriesId());
      stmt.setString(7, dhb.getLibraryId());
      stmt.setString(8, dhb.getCommunityId());
      stmt.setBoolean(9, dhb.getAutoPublish());
      stmt.setLong(10, dhb.getLastAutoPublished());
      stmt.setTimestamp(11, (dhb.getDLastVisit() != null) ? new Timestamp(dhb.getDLastVisit().getTime()) : null);
      stmt.setTimestamp(12, (dhb.getSLastVisit() != null) ? new Timestamp(dhb.getSLastVisit().getTime()) : null);
      stmt.setTimestamp(13, (dhb.getUploadCreated() != null) ? new Timestamp(dhb.getUploadCreated().getTime()) : null);
      stmt.setInt(14, dhb.getStatus());
      stmt.execute();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + ADD_DOCHISTORY, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }

    return result;
  }

  public boolean delete(String repoId, String docUri)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(DELETE_DOCHISTORY);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + DELETE_DOCHISTORY, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public boolean delete(String repoId, String docId, boolean isDocUri)
  {
    if (isDocUri)
    {
      return this.delete(repoId, docId);
    }
    else
    {
      boolean result = false;
      Connection conn = DBManager.getConnection();
      PreparedStatement stmt = null;
      try
      {
        stmt = conn.prepareStatement(DELETE_DOCHISTORY_BY_DOCID);
        stmt.setString(1, repoId);
        stmt.setString(2, docId);
        stmt.executeUpdate();
        result = true;
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + DELETE_DOCHISTORY_BY_DOCID, e);
      }
      finally
      {
        DBUtil.safeClose(null, stmt, conn);
      }
      return result;
    }
  }

  public boolean delete(String repoId, String libraryId, String versionSeriesId)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      if (libraryId == null)
      {
        stmt = conn.prepareStatement(DELETE_DOCHISTORY_BY_VERSIONSERIES);
        stmt.setString(1, repoId);
        stmt.setString(2, versionSeriesId);
      }
      else
      {
        stmt = conn.prepareStatement(DELETE_DOCHISTORY_BY_VERSIONSERIES_BY_LIB);
        stmt.setString(1, repoId);
        stmt.setString(2, libraryId);
        stmt.setString(3, versionSeriesId);
      }
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      if (libraryId == null)
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + DELETE_DOCHISTORY_BY_VERSIONSERIES, e);
      }
      else
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + DELETE_DOCHISTORY_BY_VERSIONSERIES_BY_LIB, e);
      }
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public DocHistoryBean get(String repoId, String docUri)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocHistoryBean docHistory = null;
    String stmtString = null;
    try
    {
      stmtString = QUERY_DOCHISTORY;
      stmt = conn.prepareStatement(stmtString);
      stmt.setString(1, repoId);
      stmt.setString(2, docUri);
      result = stmt.executeQuery();

      while (result.next())
      {
        docHistory = new DocHistoryBean(result.getString("REPO_ID"), result.getString("URI"));
        docHistory.setLastModified(result.getLong("LAST_MODIFIED"));
        docHistory.setOrgId(result.getString("ORG_ID"));
        docHistory.setDocId(result.getString("DOC_ID"));
        docHistory.setVersionSeriesId(result.getString("VERSION_SERIES_ID"));
        docHistory.setLibraryId(result.getString("LIBRARY_ID"));
        docHistory.setCommunityId(result.getString("COMMUNITY_ID"));
        docHistory.setAutoPublish(result.getBoolean("AUTO_PUBLISH"));
        docHistory.setLastAutoPublished(result.getLong("AUTO_PUBLISH_AT"));
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + stmtString, e);
    }
    finally
    {
      DBUtil.safeClose(result, stmt, conn);
    }
    return docHistory;
  }

  public DocHistoryBean get(String repoId, String docId, boolean isDocUri)
  {
    if (isDocUri)
    {
      return this.get(repoId, docId);
    }
    else
    {
      Connection conn = DBManager.getConnection();
      PreparedStatement stmt = null;
      ResultSet result = null;
      DocHistoryBean docHistory = null;
      String stmtString = null;
      try
      {
        stmtString = QUERY_DOCHISTORY_BY_DOCID;
        stmt = conn.prepareStatement(stmtString);
        stmt.setString(1, repoId);
        stmt.setString(2, docId);
        result = stmt.executeQuery();

        while (result.next())
        {
          docHistory = new DocHistoryBean(result.getString("REPO_ID"), result.getString("URI"));
          docHistory.setLastModified(result.getLong("LAST_MODIFIED"));
          docHistory.setOrgId(result.getString("ORG_ID"));
          docHistory.setDocId(result.getString("DOC_ID"));
          docHistory.setVersionSeriesId(result.getString("VERSION_SERIES_ID"));
          docHistory.setLibraryId(result.getString("LIBRARY_ID"));
          docHistory.setCommunityId(result.getString("COMMUNITY_ID"));
          docHistory.setAutoPublish(result.getBoolean("AUTO_PUBLISH"));
          docHistory.setLastAutoPublished(result.getLong("AUTO_PUBLISH_AT"));
          break;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + stmtString, e);
      }
      finally
      {
        DBUtil.safeClose(result, stmt, conn);
      }
      return docHistory;
    }
  }

  /**
   * The method is to update draft's last visit timestamp.
   */
  public boolean updateDraftLastVisit(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_DLAST_VISIT);
      stmt.setTimestamp(1, new Timestamp(dhb.getDLastVisit().getTime()));
      stmt.setString(2, dhb.getRepoId());
      stmt.setString(3, dhb.getDocUri());
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DLAST_VISIT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  /**
   * The method is to update snapshot's last visit timestamp.
   */
  public boolean updateSnapshotLastVisit(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_SLAST_VISIT);
      stmt.setTimestamp(1, new Timestamp(dhb.getSLastVisit().getTime()));
      stmt.setString(2, dhb.getRepoId());
      stmt.setString(3, dhb.getDocUri());
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_SLAST_VISIT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  /**
   * The method is to update doc_history with upload created time and its status
   */
  public boolean update4Upload(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      long published = dhb.getLastAutoPublished();
      if (published != -1)
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY_EXT2);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setLong(3, published);
        stmt.setTimestamp(4, (dhb.getUploadCreated() != null) ? new Timestamp(dhb.getUploadCreated().getTime()) : null);
        stmt.setInt(5, dhb.getStatus());
        stmt.setString(6, dhb.getRepoId());
        stmt.setString(7, dhb.getDocUri());
      }
      else
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY2);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setTimestamp(3, (dhb.getUploadCreated() != null) ? new Timestamp(dhb.getUploadCreated().getTime()) : null);
        stmt.setInt(4, dhb.getStatus());
        stmt.setString(5, dhb.getRepoId());
        stmt.setString(6, dhb.getDocUri());
      }
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCHISTORY, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  /**
   * The method is to update with cache status
   */
  public boolean updateWithCacheStatus(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      long published = dhb.getLastAutoPublished();
      if (published != -1)
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY_EXT_CACHE_STATUS);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setLong(3, published);
        stmt.setInt(4, dhb.getStatus());
        stmt.setString(5, dhb.getRepoId());
        stmt.setString(6, dhb.getDocUri());
      }
      else
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY_CACHE_STATUS);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setInt(3, dhb.getStatus());
        stmt.setString(4, dhb.getRepoId());
        stmt.setString(5, dhb.getDocUri());
      }

      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCHISTORY_CACHE_STATUS, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public boolean update(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      long published = dhb.getLastAutoPublished();
      if (published != -1)
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY_EXT);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setLong(3, published);
        stmt.setString(4, dhb.getRepoId());
        stmt.setString(5, dhb.getDocUri());
      }
      else
      {
        stmt = conn.prepareStatement(UPDATE_DOCHISTORY);
        stmt.setLong(1, dhb.getLastModified());
        stmt.setString(2, dhb.getOrgId());
        stmt.setString(3, dhb.getRepoId());
        stmt.setString(4, dhb.getDocUri());
      }

      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCHISTORY, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public boolean updateAutoPublish(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_DOCHISTORY_AUTOPUBLISH);
      stmt.setBoolean(1, dhb.getAutoPublish());
      stmt.setString(2, dhb.getOrgId());
      stmt.setString(3, dhb.getRepoId());
      stmt.setString(4, dhb.getDocUri());
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCHISTORY_AUTOPUBLISH, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public boolean updateAutoPublishAt(DocHistoryBean dhb)
  {
    boolean result = false;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_DOCHISTORY_AUTOPUBLISH_AT);
      stmt.setLong(1, dhb.getLastAutoPublished());
      stmt.setString(2, dhb.getOrgId());
      stmt.setString(3, dhb.getRepoId());
      stmt.setString(4, dhb.getDocUri());
      stmt.executeUpdate();
      result = true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_DOCHISTORY_AUTOPUBLISH_AT, e);
    }
    finally
    {
      DBUtil.safeClose(null, stmt, conn);
    }
    return result;
  }

  public ArrayList<DocHistoryBean> get(String repoId, String libraryId, String versionSeriesId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    ArrayList<DocHistoryBean> list = new ArrayList<DocHistoryBean>();
    String stmtString = null;
    try
    {
      if (libraryId == null)
      {
        stmtString = QUERY_DOCHISTORY_BY_VERSIONSERIES;
        stmt = conn.prepareStatement(stmtString);
        stmt.setString(1, repoId);
        stmt.setString(2, versionSeriesId);
      }
      else
      {
        stmtString = QUERY_DOCHISTORY_BY_VERSIONSERIES_BY_LIB;
        stmt = conn.prepareStatement(stmtString);
        stmt.setString(1, repoId);
        stmt.setString(2, libraryId);
        stmt.setString(3, versionSeriesId);
      }
      result = stmt.executeQuery();

      while (result.next())
      {
        DocHistoryBean docHistory = new DocHistoryBean(result.getString("REPO_ID"), result.getString("URI"));
        docHistory.setLastModified(result.getLong("LAST_MODIFIED"));
        docHistory.setOrgId(result.getString("ORG_ID"));
        docHistory.setDocId(result.getString("DOC_ID"));
        docHistory.setVersionSeriesId(result.getString("VERSION_SERIES_ID"));
        docHistory.setLibraryId(result.getString("LIBRARY_ID"));
        docHistory.setCommunityId(result.getString("COMMUNITY_ID"));
        docHistory.setAutoPublish(result.getBoolean("AUTO_PUBLISH"));
        docHistory.setLastAutoPublished(result.getLong("AUTO_PUBLISH_AT"));
        list.add(docHistory);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + stmtString, e);
    }
    finally
    {
      DBUtil.safeClose(result, stmt, conn);
    }
    return list;
  }
}
