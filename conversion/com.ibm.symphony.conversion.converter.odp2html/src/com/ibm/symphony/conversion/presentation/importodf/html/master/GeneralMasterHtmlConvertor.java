/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class GeneralMasterHtmlConvertor extends AbstractMasterHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    Node htmlNode = addHtmlElement(element, htmlParent, context);

    if (htmlNode instanceof Element)
    {
      htmlNode = parseAttributes(element, (Element) htmlNode, context);
      convertChildren(context, element, (Element) htmlNode);
    }
  }

}
