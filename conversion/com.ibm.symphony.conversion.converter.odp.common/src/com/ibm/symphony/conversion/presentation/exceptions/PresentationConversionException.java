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

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class PresentationConversionException extends RuntimeException
{

  private static final long serialVersionUID = 1L;

  protected String ivConversionCode = null;

  /**
   * Creates a PresentationConversionException (RuntimeException which signals a detected error situation). This method will add the
   * conversion error information to the ConversionResult as a warning and mark the result as failed.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param message
   *          Non-translated error message
   * @param conversionCode
   *          Error code of the Error
   * @return void
   * 
   */
  public PresentationConversionException(ConversionContext context, String message, String conversionCode , String subCode)
  {
    super(message);
    ivConversionCode = conversionCode;
    ODPCommonUtil.addConversionError(context, conversionCode, subCode, message);
  }

  // Hide Default Contructor
  PresentationConversionException()
  {
  }
}
