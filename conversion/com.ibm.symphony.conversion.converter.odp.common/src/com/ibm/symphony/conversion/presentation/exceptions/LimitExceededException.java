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

import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class LimitExceededException extends PresentationConversionException
{
  private static final long serialVersionUID = 1L;

  /**
   * Creates a LimitExceededException (RuntimeException which signals a detected error situation). This method will add the conversion error
   * information to the ConversionResult as a warning and mark the result as failed.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param subCode
   *          native conversion error code
   * @param message 
   * Non-translated error message
   * @return void
   * 
   */
  public LimitExceededException(ConversionContext context, String subCode, String message)
  {
    super(context, message, ConversionConstants.ERROR_FILE_IS_TOO_LARGE ,subCode);
  }

  // Hide Default Contructor
  LimitExceededException()
  {
  }
}
