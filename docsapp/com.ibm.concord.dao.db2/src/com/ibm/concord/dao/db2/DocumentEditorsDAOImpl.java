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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.platform.DBConnection;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.json.java.JSONObject;

public class DocumentEditorsDAOImpl implements IDocumentEditorsDAO
{
  private static final Logger LOG = Logger.getLogger(DocumentEditorsDAOImpl.class.getName());

  private static final String QUERY_EDITORS_PLUS = "SELECT \"CONCORDDB\".\"DOCEDITORS\".\"USERID\", \"CONCORDDB\".\"DOCEDITORS\".\"ORGID\", \"CONCORDDB\".\"DOCEDITORS\".\"COLOR\", \"CONCORDDB\".\"DOCEDITORS\".\"INDICATORS\", \"CONCORDDB\".\"DOCEDITORS\".\"LEAVESESSION\", \"CONCORDDB\".\"SUBSCRIBER\".\"DISPLAY_NAME\", \"CONCORDDB\".\"SUBSCRIBER\".\"EMAIL\" FROM \"CONCORDDB\".\"DOCEDITORS\" JOIN \"CONCORDDB\".\"SUBSCRIBER\" ON \"CONCORDDB\".\"DOCEDITORS\".\"USERID\" = \"CONCORDDB\".\"SUBSCRIBER\".\"ID\" WHERE \"CONCORDDB\".\"DOCEDITORS\".\"DOCID\"=? AND \"CONCORDDB\".\"DOCEDITORS\".\"REPOID\"=?";

  private static final String QUERY_EDITOR = "SELECT * FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"DOCID\"=? AND \"REPOID\"=? AND \"USERID\"=?";

  private static final String ADD_EDITOR = "INSERT INTO \"CONCORDDB\".\"DOCEDITORS\" (\"REPOID\",\"DOCID\",\"USERID\",\"ORGID\",\"COLOR\",\"LEAVESESSION\") VALUES(?,?,?,?,?,?)";

  private static final String REMOVE_ALL = "DELETE FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"REPOID\"=? AND \"DOCID\"=?";

  private static final String REMOVE_EDITOR = "DELETE FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"USERID\"=?";

  private static final String UPDATE_EDITOR = "UPDATE \"CONCORDDB\".\"DOCEDITORS\" SET \"USERID\" = ? WHERE \"USERID\" = ? ";

  private static final String HAS_EDITOR = "SELECT \"CONCORDDB\".\"DOCEDITORS\".\"USERID\" FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"USERID\"=?";

  private static final String HAS_EDITOR_PLUS = "SELECT \"CONCORDDB\".\"DOCEDITORS\".\"USERID\" FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"USERID\"=? and \"DOCID\"=?";

  private static final String COUNT_EDITOR = "SELECT COUNT(\"CONCORDDB\".\"DOCEDITORS\".\"USERID\") FROM \"CONCORDDB\".\"DOCEDITORS\" WHERE \"DOCID\"=?";

  private static final String UPDATE_INDICATORS = "UPDATE \"CONCORDDB\".\"DOCEDITORS\" SET \"INDICATORS\"=? WHERE \"DOCID\"=? AND \"ORGID\"=? AND \"USERID\"=?";

  private static final String UPDATE_LEAVESESSION = "UPDATE \"CONCORDDB\".\"DOCEDITORS\" SET \"LEAVESESSION\"=? WHERE \"DOCID\"=? AND \"ORGID\"=? AND \"USERID\"=?";

  public List<DocumentEditorBean> getDocumentEditors(IDocumentEntry doc)
  {
    List<DocumentEditorBean> editorsList = new ArrayList<DocumentEditorBean>();
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DocumentEditorsDAOImpl.QUERY_EDITORS_PLUS);
      stmt.setString(1, doc.getDocUri());
      stmt.setString(2, doc.getRepository());
      ResultSet result = stmt.executeQuery();
      while (result.next())
      {
        DocumentEditorBean editor = new DocumentEditorBean();

        String userId = result.getString("USERID");
        String orgId = result.getString("ORGID");
        String color = result.getString("COLOR");
        String displayName = result.getString("DISPLAY_NAME");
        String email = result.getString("EMAIL");
        Timestamp leaveSession = result.getTimestamp("LEAVESESSION");

        String indicators = null;
        if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME))
        {
          byte[] bytes = result.getBytes("INDICATORS");
          if (bytes != null)
          {
            indicators = new String(bytes, "UTF-8");
          }
        }
        else
        {
          Blob blob = result.getBlob("INDICATORS");
          if (blob != null)
          {
            byte[] bytes = blob.getBytes(1L, (int) blob.length());
            indicators = new String(bytes, "UTF-8");
          }
        }

        editor.setUserId(userId);
        editor.setOrgId(orgId);
        editor.setDocId(doc.getDocUri());
        editor.setDocRepoId(doc.getRepository());
        editor.setColor(color);
        String borderColor = ConcordUtil.getBorderColor(color);
        if (borderColor == null)
        {
          borderColor = ConcordUtil.DEFAULT_BORDER_COLOR;
        }
        editor.setBorderColor(borderColor);
        editor.setDisplayName(displayName);
        editor.setEmail(email);
        editor.setLeaveSession(leaveSession);
        if (indicators != null && indicators.length() > 0)
        {
          try
          {
            JSONObject obj = JSONObject.parse(indicators);
            editor.setIndicators(obj);
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "failed to parse indicators json object from string: {0}, the exception is: {1}", new Object[] {
                indicators, e });
          }
        }
        editorsList.add(editor);
      }
      result.close();
    }
    catch (Exception e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.DATABASE_OPERATION_ERROR, "error occurs when getting editors from database", e);
      return null;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return editorsList;
  }

  public DocumentEditorBean getDocumentEditor(IDocumentEntry doc, String userId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    DocumentEditorBean editor = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DocumentEditorsDAOImpl.QUERY_EDITOR);
      stmt.setString(1, doc.getDocUri());
      stmt.setString(2, doc.getRepository());
      stmt.setString(3, userId);
      ResultSet result = stmt.executeQuery();
      if (result.next())
      {
        editor = new DocumentEditorBean();
        String orgId = result.getString("ORGID");
        String color = result.getString("COLOR");
        String displayName = result.getString("DISPLAYNAME");
        Timestamp leaveSession = result.getTimestamp("LEAVESESSION");
        String indicators = null;
        if ("Microsoft SQL Server".equals(DBConnection.DATABASE_NAME))
        {
          byte[] bytes = result.getBytes("INDICATORS");
          if (bytes != null)
          {
            indicators = new String(bytes, "UTF-8");
          }
        }
        else
        {
          Blob blob = result.getBlob("INDICATORS");
          if (blob != null)
          {
            byte[] bytes = blob.getBytes(1L, (int) blob.length());
            indicators = new String(bytes, "UTF-8");
          }
        }
        editor.setUserId(userId);
        editor.setOrgId(orgId);
        editor.setDocId(doc.getDocUri());
        editor.setDocRepoId(doc.getRepository());
        editor.setLeaveSession(leaveSession);
        editor.setColor(color);
        String borderColor = ConcordUtil.getBorderColor(color);
        if (borderColor == null)
        {
          borderColor = ConcordUtil.DEFAULT_BORDER_COLOR;
        }
        editor.setBorderColor(borderColor);
        editor.setDisplayName(displayName);
        if (indicators != null && indicators.length() > 0)
        {
          try
          {
            JSONObject obj = JSONObject.parse(indicators);
            editor.setIndicators(obj);
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "failed to parse indicators json object from string: {0}, the exception is: {1}", new Object[] {
                indicators, e });
          }
        }
      }
      result.close();
    }
    catch (Exception e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.DATABASE_OPERATION_ERROR, "error occurs when getting editors from database", e);
      return null;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return editor;
  }

  public void addEditor(IDocumentEntry doc, DocumentEditorBean editor)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DocumentEditorsDAOImpl.ADD_EDITOR);
      stmt.setString(1, doc.getRepository());
      stmt.setString(2, doc.getDocUri());
      stmt.setString(3, editor.getUserId());
      stmt.setString(4, editor.getOrgId());
      stmt.setString(5, editor.getColor());
      stmt.setTimestamp(6, editor.getLeaveSession());

      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error occurs when getting editors from database", e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }

  public void updateEditor(DocumentEditorBean editor)
  {
    throw new IllegalStateException("Not Implemented Function.");
  }

  @Override
  public boolean updateEditorLeaveSession(DocumentEditorBean editor)
  {
    boolean result = true;
    Timestamp leaveSession = editor.getLeaveSession();
    String userId = editor.getUserId();
    String orgId = editor.getOrgId();
    String docId = editor.getDocId();
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_LEAVESESSION);
      stmt.setTimestamp(1, leaveSession);
      stmt.setString(2, docId);
      stmt.setString(3, orgId);
      stmt.setString(4, userId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_LEAVESESSION, e);
      result = false;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return result;
  }

  public void updateEditorIndicators(DocumentEditorBean editor)
  {
    if (editor.getIndicators() == null)
    {
      LOG.warning("The indicators is null when update indicators column in table DOCEDITORS!!!");
      return;
    }

    String indicators = editor.getIndicators().toString();
    if (indicators == null || indicators.length() == 0)
    {
      LOG.warning("The indicators is empty when update indicators column in table DOCEDITORS!!!");
      return;
    }

    String userId = editor.getUserId();
    String orgId = editor.getOrgId();
    String docId = editor.getDocId();
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_INDICATORS);
      stmt.setBytes(1, indicators.getBytes("UTF-8"));
      stmt.setString(2, docId);
      stmt.setString(3, orgId);
      stmt.setString(4, userId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_INDICATORS, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }

  public void removeAllEditors(IDocumentEntry doc)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DocumentEditorsDAOImpl.REMOVE_ALL);
      stmt.setString(1, doc.getRepository());
      stmt.setString(2, doc.getDocUri());

      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to remove all editor from current document", e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }

  public void removeEditor(String editorId)
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(DocumentEditorsDAOImpl.REMOVE_EDITOR);
      stmt.setString(1, editorId);

      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "failed to remove specific editor", e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }

  public void updateEditor(String oldEditorId, String newEditorId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_EDITOR);
      stmt.setString(1, newEditorId);
      stmt.setString(2, oldEditorId);
      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      try
      {
        if (hasEditor(newEditorId))
        {
          LOG.log(Level.FINE, "The new user [{0}] records already exist, so remove the old user [{1}] records to avoid conflicts.",
              new Object[] { newEditorId, oldEditorId });
          this.removeEditor(oldEditorId);
        }
        else
        {
          LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_EDITOR, e);
        }
      }
      catch (Exception ne)
      {
        LOG.log(Level.WARNING, "error when executing SQL:" + HAS_EDITOR, ne);
      }
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }

  public boolean hasEditor(String editorId, String docId)
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(HAS_EDITOR_PLUS);
      stmt.setString(1, editorId);
      stmt.setString(2, docId);
      ResultSet result = stmt.executeQuery();
      return result.next();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + HAS_EDITOR_PLUS, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }

  public int countEditors(String docId)
  {
    int count = 0;
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(COUNT_EDITOR);
      stmt.setString(1, docId);
      ResultSet resultSet = stmt.executeQuery();
      while (resultSet.next())
      {
        count = resultSet.getInt(1);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + COUNT_EDITOR, e);
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return count;
  }

  private boolean hasEditor(String editorId) throws Exception
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(HAS_EDITOR);
      stmt.setString(1, editorId);
      ResultSet result = stmt.executeQuery();
      return result.next();
    }
    catch (Exception e)
    {
      throw e;
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
  }
}
