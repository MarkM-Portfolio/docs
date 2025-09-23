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

public class DraftDataAccessException extends ConcordException
{
  private static final long serialVersionUID = -3038416414599248293L;

  /**
   * Exception code(1601) indicates that cannot access to the storage server(This is a general error for draft data access exception).
   */
  public static final int EC_DRAFTDATA_ACCESS_ERROR = 1601;

  /**
   * Constructs a new instance with the draft description.
   * 
   * @param draftDesc
   *          draft description
   */
  public DraftDataAccessException(DraftDescriptor draftDesc)
  {
    super(EC_DRAFTDATA_ACCESS_ERROR, new JSONObject(), null);
    getData().put("draftDesc", draftDesc.toString());
  }

  /**
   * Constructs a new instance with draft description and the cause.
   * 
   * @param draftDesc
   *          draft description
   * @param cause
   *          the cause
   */
  public DraftDataAccessException(DraftDescriptor draftDesc, Throwable cause)
  {
    super(EC_DRAFTDATA_ACCESS_ERROR, new JSONObject(), cause);
    getData().put("draftDesc", draftDesc.toString());
  }

  /**
   * Get the draft description
   * 
   * @return customId + " " + docUri + " " + draftURI
   */
  public String getDraft()
  {
    return (String) getData().get("draftDesc");
  }

}
