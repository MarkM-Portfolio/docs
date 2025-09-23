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


public class FormatConversionException extends Throwable
{
  private static final long serialVersionUID = 6606901489776765091L;

  private Throwable nestedException;

  public FormatConversionException()
  {
    ;
  }

  public FormatConversionException(Throwable nestedException)
  {
    this.nestedException = nestedException;
  }

  public Throwable getNestedException()
  {
    return nestedException;
  }
}
