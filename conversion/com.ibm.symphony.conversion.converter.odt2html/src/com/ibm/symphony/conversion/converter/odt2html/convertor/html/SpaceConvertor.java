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
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class SpaceConvertor extends HtmlConvertor
{
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    String textC = element.getAttribute(ODFConstants.TEXT_C);
    if(textC.equals(""))
    {
      parent.appendChild( doc.createTextNode("\u00a0") ); 
    }
    else
    {
      int count = Integer.parseInt(textC);
      for(int i=0; i<count; i++)
        parent.appendChild( doc.createTextNode("\u00a0") ); // 00a0 means &nbsp;
    }
  }
}
