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

import java.util.List;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class SpanConvertor extends GeneralXMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    List<String> htmlClass = XMLConvertorUtil.getClassNameList(htmlElement);

    if (htmlClass != null)
    {
      if (htmlClass.contains(Constants.PAGE_NUMBER_CLASS))
      {
        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(Constants.PAGE_NUMBER_CLASS);
        convertor.convert(context, htmlElement, parent);
        return;
      }
      else if (htmlClass.contains(Constants.DATE_TIME_CLASS))
      {
        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(Constants.DATE_TIME_CLASS);
        convertor.convert(context, htmlElement, parent);
        return;
      }
      else if (htmlClass.contains(Constants.TEXT_SEQUENCE_CLASS))
      {
        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(Constants.TEXT_SEQUENCE_CLASS);
        convertor.convert(context, htmlElement, parent);
        return;
      }      
    }

    super.doConvertXML(context, htmlElement, parent);
  }
  
  private boolean isInParagraph(OdfElement element)
  {
    Node node = element;
    
    while( node != null)
    {
      if(  ODFConstants.TEXT_P.equals(node.getNodeName()) || ODFConstants.TEXT_H.equals(node.getNodeName()) )
        return true;
      node = node.getParentNode();
      
      if( node != null && ( ODFConstants.OFFICE_TEXT.equals( node.getNodeName() )) )
        return false;      
    }
    return false;
  }

  @Override
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null && ODFConstants.TEXT_P.equals(odfElement.getNodeName()) 
        && isInParagraph( parent ) )
    {
      // Defect 40617, current span is the child of a list item, but the list is converted to a paragraph.
      // should be span
      return XMLConvertorUtil.convertElement(context, htmlElement, parent);
    }
    else
    {
      // maybe not span
      return super.convertElement(context, htmlElement, parent);
    }
  }

}
