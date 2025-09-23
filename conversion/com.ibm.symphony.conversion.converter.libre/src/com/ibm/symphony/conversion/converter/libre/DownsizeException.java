/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import com.ibm.symphony.conversion.service.exception.ConversionException;

public class DownsizeException extends ConversionException
{
  
  public DownsizeException(String errorMsg)
  {
    super(errorMsg);
  }

  /**
   * 
   */
  private static final long serialVersionUID = -2693927784260380002L;

}
