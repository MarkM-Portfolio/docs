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


public class IllegalDraftStateException extends IllegalStateException
{
  private static final long serialVersionUID = -4773338931282898152L;

  private DraftDescriptor draftDesc;
  private Throwable nested;

  public IllegalDraftStateException()
  {
    this.draftDesc = null;
  }

  public IllegalDraftStateException(DraftDescriptor draftDesc)
  {
    this.draftDesc = draftDesc;
  }

  public IllegalDraftStateException(DraftDescriptor draftDesc, Throwable nested)
  {
    super(nested);
    this.draftDesc = draftDesc;
    this.nested = nested;
  }

  public DraftDescriptor getDraft()
  {
    return draftDesc;
  }

  public Throwable getNested()
  {
    return nested;
  }
}
