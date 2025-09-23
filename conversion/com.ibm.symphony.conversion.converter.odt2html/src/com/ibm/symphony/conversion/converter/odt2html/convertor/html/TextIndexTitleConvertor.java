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
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TextIndexTitleConvertor extends GeneralHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    super.doConvertHtml(context, element, parent);
    
    if(ODFConstants.TEXT_TABLE_OF_CONTENT.equals(element.getParentNode().getParentNode().getNodeName())
        && element.getFirstChild() != null)
    {
      Element p = (Element) parent.getLastChild();
      HtmlConvertorUtil.setAttribute(p,HtmlCSSConstants.NAME, element.getAttribute(ODFConstants.TEXT_NAME)+"|region");
      String className = p.getAttribute(HtmlCSSConstants.CLASS);
      //tocTitle in class is a tag for editor distract TOC title style
      HtmlConvertorUtil.setAttribute(p,HtmlCSSConstants.CLASS, className+" tocTitle");
    }
  }

}
