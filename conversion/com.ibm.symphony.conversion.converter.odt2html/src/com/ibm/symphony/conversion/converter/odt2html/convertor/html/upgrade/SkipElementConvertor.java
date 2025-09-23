/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;


public class SkipElementConvertor extends HtmlUpgradeConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    convertChildren(context, element, null);
  }

  protected void convertChildren(ConversionContext context, OdfElement element, Node parent)
  {
    UpgradeConvertorUtil.convertChildren(context, element);
  }

}
