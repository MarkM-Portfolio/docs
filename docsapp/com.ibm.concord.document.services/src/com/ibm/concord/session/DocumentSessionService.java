/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

import java.util.List;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocumentSessionBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocumentSessionDAO;
import com.ibm.websphere.runtime.ServerName;

/**
 * 
 */
public class DocumentSessionService
{
  private static final DocumentSessionService _instance = new DocumentSessionService();
  
  private IDocumentSessionDAO sessionDAO;
  
  /**
   * 
   */
  private DocumentSessionService()
  {
    sessionDAO = (IDocumentSessionDAO)Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocumentSessionDAO.class);
  }
  
  /**
   * 
   * @return
   */
  public static DocumentSessionService getInstance()
  {
    return _instance;
  }
  
  /**
   * Check whether specified document session is served by other server.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return true if the document session is served by other server, otherwise false
   * @throws Exception
   */
  public boolean isServedByOtherSrv(String repoId, String docId) throws Exception
  {
    DocumentSessionBean bean = sessionDAO.findById(repoId, docId);
    if (bean != null)
    {
      String serverFullName = ServerName.getFullName();
      if (!serverFullName.equals(bean.getServingServer()))
      {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check whether specified document session is served by current server.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return true if the document session is served by other server, otherwise false
   * @throws Exception
   */
  public boolean isServedByCurrentSrv(String repoId, String docId) throws Exception
  {
    DocumentSessionBean bean = sessionDAO.findById(repoId, docId);
    if (bean != null)
    {
      String serverFullName = ServerName.getFullName();
      if (serverFullName.equals(bean.getServingServer()))
      {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get the full name of the server that is serving the specified document.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return full server name if find the server that is serving the document, null if do not find
   * @throws Exception
   */
  public String getServingServer(String repoId, String docId) throws Exception
  {
    DocumentSessionBean bean = sessionDAO.findById(repoId, docId);
    if (bean != null)
    {
      return bean.getServingServer();
    }
    return null;
  }

  /**
   * Serve the specified document session in current server.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return true if serve the document successfully, otherwise false
   * @throws Exception
   */
  public boolean serveDocument(String repoId, String docId) throws Exception
  {
    if (repoId == null || docId == null)
    {
      return false;
    }
    DocumentSessionBean bean = new DocumentSessionBean(repoId, docId, ServerName.getFullName(), DocumentSessionBean.STATUS_ACTIVE);
    return sessionDAO.add(bean);
  }
  
  /**
   * Un-serve the specified document session in current server.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return true if serve the session successfully, otherwise false
   * @throws Exception
   */
  public boolean unServeDocument(String repoId, String docId) throws Exception
  {
    if (repoId == null || docId == null)
    {
      return false;
    }
    return sessionDAO.delete(repoId, docId, ServerName.getFullName());
  }
  
  /**
   * Using current server to update the server that serving document according to repository and document id.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param oldServerName specifies the old server that serving the document
   * @return true if update the serving server successfully, otherwise false
   * @throws Exception
   */
  public boolean updateServingSrv(String repoId, String docId, String oldServerName) throws Exception
  {
    if (repoId == null || docId == null)
    {
      return false;
    }
    return sessionDAO.update(repoId, docId, oldServerName, ServerName.getFullName());
  }
  
  /**
   * Update the server that serving the document according to repository id, document id, old server and serving status.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param serverName specifies the old server that serving the document
   * @param status specifies the serving status
   * @return true if update the serving server successfully, otherwise false
   * @throws Exception
   */
  public boolean updateSrvWithStatus(String repoId, String docId, String serverName, int status) throws Exception
  {
    if (repoId == null || docId == null)
    {
      return false;
    }
    return sessionDAO.update(repoId, docId, serverName, status, ServerName.getFullName());
  }
  
  /**
   * Update the serving status according to repository id, document id and name of server that serving the document.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param serverName specifies the server that serving the document
   * @param newStatus specifies the status being changed to
   * @return true if update the serving status successfully, otherwise false
   * @throws Exception
   */
  public boolean updateServingSrvStatus(String repoId, String docId, String serverName, int newStatus) throws Exception
  {
    if (repoId == null || docId == null)
    {
      return false;
    }
    return sessionDAO.updateStatus(repoId, docId, serverName, newStatus);
  }
  
  /**
   * Find the document sessions that served by specified server.
   * 
   * @param serverName specifies the full name of server
   * @return list of served document session information
   * @throws Exception
   */
  public List<DocumentSessionBean> getServedDocuments(String serverName) throws Exception
  {
    return sessionDAO.findByServerName(serverName);
  }
}
