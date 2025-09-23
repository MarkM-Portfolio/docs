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
package com.ibm.concord.draft.exception;

import com.ibm.concord.spi.beans.DraftDescriptor;

/**
 *
 */
public class DraftTransactionException extends Exception
{
  private static final long serialVersionUID = -4301740320429599531L;

  private DraftDescriptor draftDesc;
  
  /**
   * 
   * @param message
   */
  public DraftTransactionException(String message)
  {
    super(message);
  }
  
  /**
   * 
   * @param message
   * @param cause
   */
  public DraftTransactionException(String message, Throwable cause)
  {
    super(message, cause);
  }
  
  /**
   * 
   * @param draftDesc
   * @param message
   * @param cause
   */
  public DraftTransactionException(DraftDescriptor draftDesc, String message, Throwable cause)
  {
    this(message, cause);
    this.draftDesc = draftDesc;
  }
  
  /**
   * 
   * @return
   */
  public DraftDescriptor getDraftDescriptor()
  {
    return this.draftDesc;
  }
}
