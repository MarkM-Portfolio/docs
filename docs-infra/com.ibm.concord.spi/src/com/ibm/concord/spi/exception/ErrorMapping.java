/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.exception;

import java.util.MissingResourceException;
import java.util.ResourceBundle;

/**
 * Mapping error code to error message
 * 
 */
public class ErrorMapping
{
  private static final String BUNDLE_NAME = "com.ibm.concord.spi.exception.errors";

  private static final String DEFAULT_ERR_MSG = "null";

  private static ResourceBundle RESOURCE_BUNDLE = ResourceBundle.getBundle(BUNDLE_NAME);

  private ErrorMapping()
  {
  }

  /**
   * Get the corresponding error message for the error code.
   * 
   * @param errCode
   *          four-digit integer error code
   * @return corresponding error message for the error code, "null" is returned if the error code not found
   */
  public static String errMsg(int errCode)
  {
    String desc = null;
    try
    {
      desc = RESOURCE_BUNDLE.getString(String.valueOf(errCode));
    }
    catch (MissingResourceException e)
    {
      desc = DEFAULT_ERR_MSG;
    }
    return desc;
  }

}
