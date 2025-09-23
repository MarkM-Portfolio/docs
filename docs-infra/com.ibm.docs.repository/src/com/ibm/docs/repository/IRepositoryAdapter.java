/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2020                           */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Vector;

import com.ibm.concord.spi.beans.ACE;
import com.ibm.concord.spi.beans.ActionEnum;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.MediaOptions;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public interface IRepositoryAdapter
{
  public void init(JSONObject config);

  /**
   * Return a document's meta data in requester's context. _
   *
   * @param requester
   *          caller of this request
   * @param docUri
   *          unique identifier of the document in this repository's scope
   * @return IDocumentEntry which represents the document's meta data
   * @throws RepositoryAccessException
   *           if the requester doesn't have access to this document, or cannot connect to the repository, implementation should throw out
   *           RepositoryAccessException. detail @see RepositoryAccessException.
   */
  public IDocumentEntry getDocument(UserBean requester, String docUri) throws RepositoryAccessException;

  /**
   * get the document via admin users
   *
   * @param docUri
   *          is the document id rather than version id
   * @return
   * @throws RepositoryAccessException
   */
  public IDocumentEntry getDocument(String docUri) throws RepositoryAccessException;

  /**
   * Return a document's media in requester's context.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          unique identifier of the document in this repository's scope
   * @return stream of the media
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * Return a document's media in requester's context.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          unique identifier of the document in this repository's scope
   * @param logDownload
   *          specifies whether records the download number in LC UI when download the document from LC
   * @return stream of the media
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry, boolean logDownload) throws RepositoryAccessException;

  /**
   * Update a document's media in requester's context, which may or may not cause a new version being created, depends on the implementation
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          document meta data
   * @param is
   *          stream of the new media
   * @param versionSummary
   *          version summary of the new media
   * @return Updated document meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary)
      throws RepositoryAccessException;

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary,
      boolean overwrite) throws RepositoryAccessException;

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, InputStream is, String versionSummary, String docLabel)
      throws RepositoryAccessException;

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary)
      throws RepositoryAccessException;

  public IDocumentEntry setContentStream(UserBean requester, IDocumentEntry docEntry, MediaDescriptor media, String versionSummary,
      boolean overwrite) throws RepositoryAccessException;

  /**
   * Upload a document's media in requester's context, which cause a new document being created.
   *
   * @param requester
   *          caller of this request
   * @param folderUri
   *          unique identifier of a folder where to put the document into
   * @param folderType
   *          type of a folder, "personalFiles" | "communityFiles"
   * @param docLabel
   *          document title
   * @param is
   *          stream of the new media
   * @return IDocumentEntry which represents the new document's meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is)
      throws RepositoryAccessException;

  /**
   * Upload a document's media in requester's context, which cause a new document being created.
   *
   * @param requester
   *          caller of this request
   * @param folderUri
   *          unique identifier of a folder where to put the document into
   * @param folderType
   *          type of a folder, "personalFiles" | "communityFiles"
   * @param docLabel
   *          document title
   * @param is
   *          stream of the new media
   * @param isExternal
   *          whether allow this document shared out of the organization
   * @param propagate
   *          whether allow others share this document
   * @param options
   *          optional parameters for a new document such as contextType and contextValue
   * @return IDocumentEntry which represents the new document's meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry createDocument(UserBean requester, String folderUri, String folderType, String docLabel, InputStream is,
      Boolean isExternal, Boolean propagate, MediaOptions options) throws RepositoryAccessException;

  /**
   * Set a document's type as 'ibmdocs' in requester's context.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          document meta data
   * @param createVersion
   *          whether to create a new version with 'ibmdocs' type.
   * @return Updated document meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry setIBMdocsType(UserBean requester, IDocumentEntry docEntry, boolean createVersion) throws RepositoryAccessException;

  /**
   * Delete a document from the repository
   *
   * @param requester
   *          caller of this request
   * @param docUri
   *          unique identifier of the document in this repository's scope
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public void deleteDocument(UserBean requester, String docUri) throws RepositoryAccessException;

  /**
   * Rename a document's title.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          the meta data of a document you want to change title
   * @param newLabel
   *          new document title
   * @return IDocumentEntry which represents the updated meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry renameDocument(UserBean requester, IDocumentEntry docEntry, String newLabel) throws RepositoryAccessException;

  /**
   * Lock a document.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          the meta data of a document you want to lock
   * @return IDocumentEntry which represents the lock document meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry lockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * Unlock a document.
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          the meta data of a document you want to unlock
   * @return IDocumentEntry which represents the unlock document meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry unlockDocument(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

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

  /**
   * Restore an older version to latest one.
   *
   * @param requester
   *          caller of this request
   * @param docUri
   *          unique identifier of the document in this repository's scope
   * @param versionId
   *          the version id you want to restore from
   * @return updated document meta data
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry restoreVersion(UserBean requester, String docUri, String versionId) throws RepositoryAccessException;

  /**
   * Get all the meta data of each versions
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   *          unique identifier of the document in this repository's scope
   * @return meta data to all versions
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public IDocumentEntry[] getVersions(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * Add an user to a document's access control list
   *
   * @param requester
   *          caller of this request
   * @param docEntry
   * @param anACE
   *          access control entry indicate what permission granted to whom
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public void addACE(UserBean requester, IDocumentEntry docEntry, ACE anACE) throws RepositoryAccessException;

  /**
   * Retrieve all ACE for the specified document. This call will not expand ACE potentially grant through user group, such as Group and
   * Community in LC Connections, so that YOU CAN NOT use this call result to check permission. Instead, you should always call
   * getDocumentEntry which will leverage impersonation mechanism.
   *
   * @deprecated, NOT ALL repository provides the ability to query all ACE of a file, such as QCS service. Be careful when using this API.
   *
   * @param requester
   * @param docEntry
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException;

  /**
   * Retrieve all the documents owned by the specified requester.
   *
   * @param requester
   * @param pageSize
   * @param pageNumber
   * @return
   * @throws RepositoryAccessException
   */
  public IDocumentEntry[] getOwnedDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException;

  /**
   * Retrieve all the permissive documents of the specified requester.
   *
   * @param requester
   * @param pageSize
   * @param pageNumber
   * @return
   * @throws RepositoryAccessException
   */
  public IDocumentEntry[] getPermissiveDocuments(UserBean requester, int pageSize, int pageNumber) throws RepositoryAccessException;

  /**
   * Get the list of changes from the repository since a specified time. This API is used for HCL Docs house keeping bean to know what
   * documents have been deleted from repository, so HCL Docs can clean things up. For performance consideration, implementation should
   * override Iterator's next method, to return result page by page, instead of returning all the list one time.
   *
   * @param since
   *          The timestamp since last call
   * @param actionEnum
   *          only DELETE action is used so far
   * @return
   * @throws RepositoryAccessException
   * @see RepositoryAccessException
   */
  public Iterator<IDocumentEntry> getSeedList(String since, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException;

  /**
   * Return true if this repository allow HCL Docs to perform impersonation When user A assign a task to user B, Docs server want to detect
   * if B has access to a specific document in user A's context. This method tells Docs server if such detection is allowed.
   *
   * @return
   */
  public boolean impersonationAllowed();

  /**
   * Return the foler uri for the specified community
   *
   * @param caller
   * @param communityUuid
   * @return
   * @throws RepositoryAccessException
   */
  public String getFolderUri(UserBean caller, String communityUuid) throws RepositoryAccessException;

  /**
   * Return config of the repository
   */
  public JSONObject getConfig();

  /**
   * Return repo type: files, cmis, external.rest
   */
  public String getRepoType();

  /**
   * End up with something when user have editing done with the file with docId in specified repo
   * @param user
   * @param repoId
   * @param docId
   * @param data
   */
  public void processLeaveData(UserBean user, String repoId, String docId, JSONObject data);

  /**
   * notifyServerEvent by posting message to a url
   * @param msg
   */

  public void notifyServerEvent(JSONObject msg);
}
