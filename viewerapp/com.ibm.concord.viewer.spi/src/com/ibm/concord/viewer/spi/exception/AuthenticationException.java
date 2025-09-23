/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.exception;

public class AuthenticationException extends Exception
{
  private static final long serialVersionUID = 7039832759274614763L;
  
  public AuthenticationException(final String message)
  {
    super(message);
  }

}
