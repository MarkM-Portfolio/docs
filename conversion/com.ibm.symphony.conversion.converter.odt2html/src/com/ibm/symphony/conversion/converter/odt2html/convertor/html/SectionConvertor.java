/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;


public class SectionConvertor extends HtmlConvertor
{

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    if(!element.hasChildNodes())
      return;    
    IndexUtil.getXmlId(element);
    
    HtmlConvertorUtil.convertChildren(context, element, parent);
  }
}
