/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

public class OverlineLineStyleConvertor extends LineStyleConvertor
{
  @Override
  protected String getCssLineStyle()
  {
    return ODPConvertConstants.CSS_VALUE_OVERLINE;
  }
}