/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.exceptions;

@Deprecated
public class UnknownException extends Exception
{

  /**
   * 
   */
  private static final long serialVersionUID = 6003004939567136291L;
  private final int code;
  public UnknownException(final String message, final int code)
  {
    super(message);
    this.code = code;
  }
  
  public UnknownException(final String message)
  {
    this(message, 100);
  }

  public int getCode()
  {
    return code;
  }
}
