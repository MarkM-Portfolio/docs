/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class MasterStylesConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = MasterStylesConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  // here we handle style master styles element.
  // and the htmlParent is the element in content.html.
  @SuppressWarnings( { "restriction" })
  protected void doConvertHtml(ConversionContext context, OdfElement odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    NodeList list = odfElement.getElementsByTagName("style:master-page");

    for (int i = 0; i < list.getLength(); i++)
    {
      new StyleMasterPageElementConvertor().doConvertHtml(context, (OdfElement) list.item(i), htmlParent);
    }
  }
}
