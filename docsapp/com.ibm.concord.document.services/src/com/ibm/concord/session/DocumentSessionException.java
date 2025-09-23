/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

/**
 * This class is used to define document session operation related exception.
 * The numbers(31xx) are used to indicate the codes of these related exception.
 *
 */
public class DocumentSessionException extends Exception
{
  private static final long serialVersionUID = 270647201537589913L;

  /**
   * Error code 3100 indicates the participant is kicked out, because the same user joined the document from different browser.
   * 
   */
  public final static int ERR_PT_KICKOUT_DUP = 3100;
  
  /**
   * Error code 3101 indicates the participant can not join co-editing while this participant is not entitled for co-editing.
   * 
   */
  public final static int ERR_PT_NOENTITLED_COEDIT = 3101;
  
  /**
   * Error code 3102 indicates the participant can not join co-editing while another user is editing, but he is not entitled for co-editing.
   * 
   */
  public final static int ERR_PT_NOENTITLED_COEDIT2 = 3102;
  
  private int code;
  private Object data;
  
  /**
   * 
   * @param message error message
   * @param code error code
   */
  public DocumentSessionException(String message, int code)
  {
    super(message);
    this.code = code;
  }
  
  /**
   * Get the error code of this exception.
   * 
   * @return error code
   */
  public int getErrorCode()
  {
    return this.code;
  }
  
  /**
   * Set the additional data of this exception.
   * 
   * @param data
   */
  public void setData(Object data)
  {
    this.data = data;
  }
  
  /**
   * Get the additional data of this exception.
   * 
   * @return
   */
  public Object getData()
  {
    return this.data;
  }
}
