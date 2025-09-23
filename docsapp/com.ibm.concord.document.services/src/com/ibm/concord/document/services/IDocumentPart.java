/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONArtifact;
import com.ibm.json.java.JSONObject;

public interface IDocumentPart
{
  /**
   * detect if a message belongs to current document part
   * @param msgData
   *    message itself
   * @return
   *    true if it is
   */
  public boolean belongsTo(JSONObject msgData);
  
  /**
   * get identifier of this document part
   * @return
   *    id
   */
  public String getId();
  
  /**
   * called when a list of messages need to be applied to document part in storage
   * @param draftDesc
   *    descriptor to the draft file
   * @param msgList
   *    message list
   */
  public void applyMessage(DraftDescriptor draftDesc, JSONArray msgList) throws Exception;
  
  /**
   * Called when a client wants to get partial or whole document of the document part according to the criteria.
   * 
   * @param draftDes
   *         the draft document reference
   * @param msgList
   *         messages have been transformed, but need to be merged to document part
   * @param criteria
   *         specifies the condition of getting the document, can get partial content of the document model through this parameter.
   * @return JSON representation of current document part.
   */
  public JSONArtifact getCurrentState(DraftDescriptor draftDes, JSONArray msgList, JSONObject criteria);
}
