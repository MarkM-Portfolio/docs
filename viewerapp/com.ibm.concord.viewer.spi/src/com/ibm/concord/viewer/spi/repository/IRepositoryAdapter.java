/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.repository;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Vector;

import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public interface IRepositoryAdapter
{
  public void init(JSONObject config);

  public boolean impersonationAllowed();

  /**
   * 
   * @param requester
   * @param docUri
   *          , For Personal Files, it will be <user id>/<document id>, for Community Files, it will be <library id>/<document id>
   * @return
   * @throws RepositoryAccessException
   */
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException;

  /**
   * 
   * @param requester
   * @param docEntry
   *          , For Personal Files, it will be <user id>/<document id>, for Community Files, it will be <library id>/<document id>
   * @return
   * @throws RepositoryAccessException
   */
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * 
   * @param requester
   * @param docUri
   * @param versionId
   * @return
   * @throws RepositoryAccessException
   */
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException;

  /**
   * 
   * @param requester
   * @param docUri
   *          , For Personal Files, it will be <user id>/<document id>, for Community Files, it will be <library id>/<document id>
   * @param anACE
   * @throws RepositoryAccessException
   */
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException;

  /**
   * Retrieve all ACE for the specified docUri. This call will not expand ACE potentially grant through user group, such as Group and
   * Community in LC Connections, so that YOU CAN NOT use this call result to check permission. Instead, you should always call
   * getDocumentEntry which will leverage impersonation mechanism.
   * 
   * @deprecated, NOT ALL repository provides the ability to query all ACE of a file, such as QCS service. Be careful when using this API.
   * 
   * @param requester
   * @param docEntry
   * @throws RepositoryAccessException
   */
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * 
   * @param timestamp
   * @return
   * @throws RepositoryAccessException
   */
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException;

  /**
   * Retrieve files_path of the repository adapter.
   * 
   * @return files_path
   */
  public String getFilesPath();

  /**
   * For viewer next, it needs to encrypt all it's cache content. This API is to check if the repository needs cache encryption.
   */
  public boolean isCacheEncrypt();

  /**
   * Retrieve home directory of viewer cache based on current repository.
   * 
   * @return cache_path
   */
  public String getCacheHome();

  /**
   * Retrieve shared data name of viewer used to communicate with conversion.
   * 
   * @return sharedDataName
   */
  public String getSharedDataName();
  /**
   * Retrieve config json object of the repository.
   * 
   * @return sharedDataName
   */
  public JSONObject getRepositoryConfig();
  
  /**
   * Post event to the external repository system. The event posted could be leveraged for audit, journal and logging purpose.
   * 
   * @param requester
   *          caller of this request
   * @param docUri
   *          unique identifier of the document in this repository's scope
   * @param type
   *          event typy in download | view | edit
   * @param versionId
   *          the version id you want to log
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   * @throws UnsupportedOperationException
   *           Not all repository support collecting the event information in this way, so thrown UnsupportedOperationException need to be
   *           handled by the caller.
   */
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException;

  void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException;   
 
  public String getRepositoryType();  
}
