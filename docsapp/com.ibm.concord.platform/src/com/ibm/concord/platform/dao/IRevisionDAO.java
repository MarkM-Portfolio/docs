/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.dao;

import java.util.List;

import com.ibm.concord.platform.revision.IRevision;

/**
 * @author fengyaoy
 *
 */
public interface IRevisionDAO
{
  /**
   * Get metadata of specified revision 
   * 
   * @param repoId repository id
   * @param docUri doc uri
   * @param revisionNo revision number
   * @return the metadata of the revision
   */
  public IRevision getRevision(String repoId, String docUri, String revisionNo);
  
  /**
   * Get the last revision of the document 
   * 
   * @param repoId repository id
   * @param docUri doc uri
   * @return the last revision of the document
   */
  public IRevision getLastRevision(String repoId, String docUri);
  
  /**
   * Get all the revisions of the document
   * 
   * @param repoId repository id
   * @param docUri doc uri
   * @return the revision list of the document including all the major and minor revision
   */
  public List<IRevision> getAllRevision(String repoId, String docUri);
  
  /**
   * Get all the revisions of the document
   * 
   * @param repoId repository id
   * @param docUri doc uri
   * @param includeMinor if include minor revision
   * @return 
   *    if includeMinor is true, return the revision list of the document including all the major and minor revision
   *    if not, return the revision list without minor revision
   *
   */
  public List<IRevision> getAllRevision(String repoId, String docUri, boolean includeMinor);
  
  /**
   * Get all the minor revisions of one major revision
   * 
   * @param repoId
   * @param docUri
   * @param majorNo
   * @return all the minor revisions of one major revision
   */
  public List<IRevision> getAllMinorRevision(String repoId, String docUri, int majorNo);
  
  /**
   * Add a revision
   * 
   * @param revision
   * @return if the operation is successful
   */
  public boolean addRevision(IRevision revision);
  
}
