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
import com.ibm.symphony.conversion.service.common.IConvertor;

public abstract class AbstractCSSConvertor implements IConvertor
{

  public void convert(ConversionContext context, Object input, Object output)
  {
    Node element = (Node) input;
    doConvert(context, element, output);

  }

  abstract protected void doConvert(ConversionContext context, Node element, Object output);

}
