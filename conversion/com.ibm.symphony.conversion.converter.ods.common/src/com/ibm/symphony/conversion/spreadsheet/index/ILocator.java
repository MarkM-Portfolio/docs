/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public interface ILocator
{
  public void traverse(ConversionContext localtorContext, Object element, Object jsonObj);
}
