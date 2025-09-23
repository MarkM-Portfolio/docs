/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class GeneralCSSConvertor extends AbstractCSSConvertor
{

  @Override
  public void doConvert(ConversionContext context, Node element, Object output)
  {
    // do nothing currently.
    CSSConvertUtil.convertCSSChildren(context, element, output);
  }
}
