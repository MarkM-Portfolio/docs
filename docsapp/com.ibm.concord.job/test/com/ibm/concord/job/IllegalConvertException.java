/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;


public class IllegalConvertException extends Throwable
{
  private static final long serialVersionUID = 620109613427146250L;

  private Throwable nestedException;

  public IllegalConvertException()
  {
    ;
  }

  public IllegalConvertException(Throwable nestedException)
  {
    this.nestedException = nestedException;
  }

  public Throwable getNestedException()
  {
    return nestedException;
  }
}
