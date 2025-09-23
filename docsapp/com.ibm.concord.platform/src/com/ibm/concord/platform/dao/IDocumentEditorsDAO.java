/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

/**
 * 
 */
package com.ibm.concord.platform.dao;

import java.util.List;

import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.spi.beans.IDocumentEntry;

public interface IDocumentEditorsDAO
{
  /**
   * Retrieves all editors of the specified document, identified by document unique id plus repository id.
   * 
   * @param doc
   *          The document's entry data from repository to query editors list
   * @return A list of editors
   */
  public List<DocumentEditorBean> getDocumentEditors(IDocumentEntry doc);

  /**
   * Retrieves the editor of the specified document and userId, document is identified by document unique id plus repository id.
   * 
   * @param doc
   *          The document's entry data from repository to query editors list
   * @param userId
   * @return A editor bean
   */
  public DocumentEditorBean getDocumentEditor(IDocumentEntry doc, String userId);

  /**
   * Adds an editor into a document's editors list.
   * 
   * @param doc
   *          The document's entry data from repository to add editor.
   * @param editor
   *          The editor to be added.
   */
  public void addEditor(IDocumentEntry doc, DocumentEditorBean editor);

  /**
   * Updates an editor's settings. Multiple rows in DB may be updated, since one person can be many documents' editor.
   * 
   * @param editor
   *          The editor to be updated.
   */
  public void updateEditor(DocumentEditorBean editor);

  /**
   * To update the leave session timestamp for the editor.
   * 
   * @param editor
   * @return whether the timestamp has been updated successfully or not
   */
  public boolean updateEditorLeaveSession(DocumentEditorBean editor);

  /**
   * Updates an editor's indicators.
   * 
   * @param editor
   *          The editor to be updated.
   */
  public void updateEditorIndicators(DocumentEditorBean editor);

  /**
   * Removes all editors' settings for the specified document.
   * 
   * @param doc
   *          The document's entry data from repository.
   */
  public void removeAllEditors(IDocumentEntry doc);

  /**
   * Removes editor specified by the editorId from DB.
   * 
   * @param editorId
   *          The editor to be removed.
   */
  public void removeEditor(String editorId);

  /**
   * Delegates editor settings from oldEditorId to the newEditorId.
   * 
   * @param oldEditorId
   *          The editor to be updated.
   * @param newEditorId
   *          The new editor id.
   */
  public void updateEditor(String oldEditorId, String newEditorId);

  public boolean hasEditor(String editorId, String docId);

  public int countEditors(String docId);
}
