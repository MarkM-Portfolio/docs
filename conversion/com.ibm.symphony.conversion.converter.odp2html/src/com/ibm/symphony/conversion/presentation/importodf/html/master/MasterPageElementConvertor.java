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

public class MasterPageElementConvertor extends AbstractMasterHtmlConvertor
{
  // private static final String CLASS = MasterPageElementConvertor.class.getName();
  //
  // private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    // StyleMasterPageElement masterPage = (StyleMasterPageElement) element;
    // HashSet<String> usedMasterPageStyles = (HashSet<String>) context.get(ODPConvertConstants.CONTEXT_USED_MASTER_PAGE_STYLES);
    //
    // String styleName = masterPage.getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
    // if (styleName != null)
    // {
    // if (!usedMasterPageStyles.contains(styleName))
    // {
    // log.info("Unused Master Page Style = " + styleName);
    // return;
    // }
    // }

    Node htmlNode = addHtmlElement(element, htmlParent, context);

    if (htmlNode instanceof Element)
    {
      htmlNode = parseAttributes(element, (Element) htmlNode, context);
      convertChildren(context, element, (Element) htmlNode);
    }
  }
}
