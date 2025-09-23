/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.dao;

import java.sql.SQLException;
import java.util.List;

import com.ibm.concord.platform.bean.DocumentSessionBean;

/**
 * Data access object for accessing DocumentSession table in this database.
 * 
 */
public interface IDocumentSessionDAO
{
  /**
   * Add document session bean into database, this bean includes repository  
   * id, document id, and the full name of server that serving the document.
   * 
   * @param bean specifies document session bean
   * @return true if add successfully, otherwise false
   * @throws SQLException
   */
  public boolean add(DocumentSessionBean bean) throws SQLException;

  /**
   * Delete document session information from database according to repository id and document id. 
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @return true if delete successfully, otherwise false
   * @throws SQLException
   */
  public boolean delete(String repoId, String docId) throws SQLException;

  /**
   * Delete document session related information from database according to the 
   * repository id, document id and full name of server that serving the document.
   *  
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param serverName specifies the full name of server that serving the document
   * @return true if delete successfully, otherwise false
   * @throws SQLException
   */
  public boolean delete(String repoId, String docId, String serverName) throws SQLException;

  /**
   * Update the server that serving the document according to the repository id and document id.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param newServerName specifies the full name of new server that serving the document
   * @return true if update successfully, otherwise false
   * @throws SQLException
   */
  public boolean update(String repoId, String docId, String newServerName) throws SQLException;
  
  /**
   * Update the server that serving the document according to the repository id, document id and old serving server.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param oldServerName specifies the full name of old server that serving the document
   * @param newServerName specifies the full name of new server that serving the document
   * @return true if update successfully, otherwise false
   * @throws SQLException
   */
  public boolean update(String repoId, String docId, String oldServerName, String newServerName) throws SQLException;
  
  /**
   * Update the server that serving the document according to repository id, document id, old server and serving status.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param serverName specifies the full name of old server that serving the document
   * @param status specifies the serving status
   * @param newServerName specifies the full name of new server that will serve the document
   * @return true if update successfully, otherwise false
   * @throws SQLException
   */
  public boolean update(String repoId, String docId, String serverName, int status, String newServerName) throws SQLException;
  
  /**
   * Update the serving status according to repository id, document id and name of server that serving the document.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the id of the document
   * @param serverName specifies the server that serving the document
   * @param newStatus specifies the status being changed to
   * @return true if update the serving status successfully, otherwise false
   * @throws SQLException
   */
  public boolean updateStatus(String repoId, String docId, String serverName, int newStatus) throws SQLException;

  /**
   * Find document session information from database by repository and document id. The information 
   * includes the repository id, document id, and the full name of server that serving the document.
   * 
   * @param repoId specifies the repository id of the document
   * @param docId specifies the repository id of the document
   * @return DocumentSessionBean instance that contains document session information
   * @throws SQLException
   */
  public DocumentSessionBean findById(String repoId, String docId) throws SQLException;
  
  /**
   * Find the document sessions that served by specified server.
   * 
   * @param serverName specifies the full name of server
   * @return list of served document session information
   * @throws SQLException
   */
  public List<DocumentSessionBean> findByServerName(String serverName) throws SQLException;
}
