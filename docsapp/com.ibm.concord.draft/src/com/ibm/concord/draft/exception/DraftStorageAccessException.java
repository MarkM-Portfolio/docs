/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.draft.exception;

import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.json.java.JSONObject;

public class DraftStorageAccessException extends ConcordException
{
  private static final long serialVersionUID = -5559106388346989239L;

  /**
   * Exception code(1602) indicates that cannot access to the storage server(This is a general error for draft storage access exception).
   */
  public static final int EC_DRAFTSTORAGE_ACCESS_ERROR = 1602;
  
  /**
   * Exception code(1603) indicates that cannot acquire the lock from the storage server(This is a critical error for draft storage access exception).
   */
  public static final int EC_DRAFTSTORAGE_LOCK_ERROR = 1603;

  /**
   * Constructs a new instance with the cause.
   * 
   * @param cause
   *          the cause
   */
  protected DraftStorageAccessException(Throwable cause)
  {
    super(EC_DRAFTSTORAGE_ACCESS_ERROR, new JSONObject(), cause);
  }

  /**
   * Constructs a new instance with draft description and the cause.
   * 
   * @param draftDesc
   *          draft description
   * @param cause
   *          the cause
   */
  public DraftStorageAccessException(DraftDescriptor draftDesc, Throwable cause)
  {
    super(EC_DRAFTSTORAGE_ACCESS_ERROR, new JSONObject(), cause);
    getData().put("draftDesc", draftDesc.toString());
  }

  /**
   * Constructs a new instance with the specific document ID and the cause.
   * 
   * @param docId
   *          document ID
   * @param cause
   *          the cause
   */
  public DraftStorageAccessException(String docId, Throwable cause)
  {
    super(EC_DRAFTSTORAGE_ACCESS_ERROR, new JSONObject(), cause);
    getData().put("docId", docId);
  }
  
  public DraftStorageAccessException(DraftDescriptor draftDesc, Throwable cause, int errorCode)
  {
    super(errorCode, new JSONObject(), cause);
    getData().put("docId", draftDesc.getDocId());
  }

  /**
   * Get the draft description
   * 
   * @return customId + " " + docUri + " " + draftURI
   */
  public String getDraftDescriptor()
  {
    return (String) getData().get("draftDesc");
  }

  /**
   * Get the document ID
   * 
   * @return document ID
   */
  public String getDocId()
  {
    return (String) getData().get("docId");
  }

}
