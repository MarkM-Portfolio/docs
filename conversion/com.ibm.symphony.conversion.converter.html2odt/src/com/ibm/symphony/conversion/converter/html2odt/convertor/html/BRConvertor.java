/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class BRConvertor extends XMLConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element element, OdfElement parent)
  {
    if( "hideInIE".equals(element.getAttribute(HtmlCSSConstants.CLASS)))
    {
      return;
    }
    String pName = parent.getTagName();    

    if( ODFConstants.TEXT_P.equals(pName) || 
        ODFConstants.TEXT_H.equals(pName) ||
        ODFConstants.TEXT_LIST.equals(pName))
    {
      if( element.getParentNode().getLastChild() == element )
      {
        return;
      }
    }

   parent.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_LINE_BREAK)));
    
  }

}
