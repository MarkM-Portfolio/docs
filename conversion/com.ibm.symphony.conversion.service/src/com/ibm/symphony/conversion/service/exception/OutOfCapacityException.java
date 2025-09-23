/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.exception;


public class OutOfCapacityException extends ConversionException
{
  private static final long serialVersionUID = -6252999699349999L;

  private int nErrorCode;
  
  public OutOfCapacityException(){
  }
  
  public OutOfCapacityException(final String message)
  {
    super(message);
  }
  public OutOfCapacityException(final int nErrorCode, final String message)
  {
    super(message);
    this.nErrorCode = nErrorCode;
  }

  public int getErrorCode()
  {
    return nErrorCode;
  }

  public void setErrorCode(int nErrorCode)
  {
    this.nErrorCode = nErrorCode;
  }
  
}