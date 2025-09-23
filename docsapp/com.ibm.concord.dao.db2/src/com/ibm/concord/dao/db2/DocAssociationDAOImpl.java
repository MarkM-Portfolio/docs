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

import com.ibm.concord.platform.bean.DocAssociationBean;
import com.ibm.concord.platform.dao.IDocAssociationDAO;
import com.ibm.concord.spi.exception.AccessException;

public class DocAssociationDAOImpl implements IDocAssociationDAO
{
  private static final Logger LOG = Logger.getLogger(DocAssociationDAOImpl.class.getName());

  private static final String ADD_ASSOCIATION = "INSERT INTO \"CONCORDDB\".\"ASSOCIATEDWITH\" ( \"ASSOCIATION_ID\",\"ASSOCIATION_TYPE\",\"LABEL\",\"ASSOCIATIONCONTENT\",  \"ASSOCIATION_TAG\", \"CHANGESET\") VALUES (?,?,?,?,?,?)";

  private static final String REMOVE_ASSOCIATION = "DELETE FROM \"CONCORDDB\".\"ASSOCIATEDWITH\" WHERE \"ASSOCIATION_ID\" = ?";

  private static final String QUERY_ASSOCIATION = "SELECT * FROM \"CONCORDDB\".\"ASSOCIATEDWITH\" WHERE \"ASSOCIATION_ID\" = ?";

  private static final String QUERY_ASSOCIATIONS = "SELECT * FROM \"CONCORDDB\".\"ASSOCIATEDWITH\"";

  private static final String UPDATE_ASSOCIATION = "UPDATE \"CONCORDDB\".\"ASSOCIATEDWITH\" SET \"CHANGESET\"=? WHERE \"ASSOCIATION_ID\" = ? ";

  public boolean addAssociation(DocAssociationBean bean) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(ADD_ASSOCIATION);
      stmt.setString(1, bean.getAssociationid());
      stmt.setString(2, bean.getAssociationType());
      stmt.setString(3, bean.getLabel());
      stmt.setString(4, bean.getContent());
      stmt.setString(5, bean.getTag());
      stmt.setString(6, bean.getChangeset());
      stmt.execute();

    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:", e);
      throw new AccessException("failed to add an association");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public boolean deleteAssociation(String associationid) throws AccessException
  {
    Connection conn = null;
    PreparedStatement stmt = null;
    try
    {
      conn = DBManager.getConnection();
      stmt = conn.prepareStatement(REMOVE_ASSOCIATION);
      stmt.setString(1, associationid);
      stmt.execute();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + REMOVE_ASSOCIATION, e);
      throw new AccessException("failed to delete an association");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return true;
  }

  public DocAssociationBean getAssociation(String associationid) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    DocAssociationBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ASSOCIATION);
      stmt.setString(1, associationid);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocAssociationBean();

        bean.setAssociationid(result.getString("ASSOCIATION_ID"));
        bean.setAssociationType(result.getString("ASSOCIATION_TYPE"));
        bean.setLabel(result.getString("LABEL"));
        bean.setContent(result.getString("ASSOCIATIONCONTENT"));
        bean.setTag(result.getString("ASSOCIATION_TAG"));
        bean.setChangeset(result.getString("CHANGESET"));
        break;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ASSOCIATION, e);
      throw new AccessException("failed to get the association");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return bean;
  }

  public List<DocAssociationBean> getAssociations() throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    ResultSet result = null;
    List<DocAssociationBean> beanList = new ArrayList<DocAssociationBean>();
    DocAssociationBean bean = null;
    try
    {
      stmt = conn.prepareStatement(QUERY_ASSOCIATIONS);
      result = stmt.executeQuery();

      while (result.next())
      {
        bean = new DocAssociationBean();

        bean.setAssociationid(result.getString("ASSOCIATION_ID"));
        bean.setAssociationType(result.getString("ASSOCIATION_TYPE"));
        bean.setLabel(result.getString("LABEL"));
        bean.setContent(result.getString("ASSOCIATIONCONTENT"));
        bean.setTag(result.getString("ASSOCIATION_TAG"));
        bean.setChangeset(result.getString("CHANGESET"));
        beanList.add(bean);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + QUERY_ASSOCIATIONS, e);
      throw new AccessException("failed to get all associations");
    }
    finally
    {
      DBManager.safeClose(result, stmt, conn);
    }
    return beanList;
  }

  public boolean updateAssociation(DocAssociationBean bean) throws AccessException
  {
    Connection conn = DBManager.getConnection();
    PreparedStatement stmt = null;
    try
    {
      stmt = conn.prepareStatement(UPDATE_ASSOCIATION);
      stmt.setString(1, bean.getChangeset());
      stmt.setString(2, bean.getAssociationid());

      stmt.executeUpdate();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when executing SQL:" + UPDATE_ASSOCIATION, e);
      throw new AccessException("failed to update");
    }
    finally
    {
      DBManager.safeClose(null, stmt, conn);
    }
    return false;
  }
}
