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

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class PageNumberConvertor extends GeneralFieldsConvertor
{

  @Override
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    if(!htmlElement.hasChildNodes())
      return null;
    
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      return odfElement;
    }
    else
    {
      // New Page Number Element
      return convertNewElement(context, htmlElement, indexTable, parent);
    }
  }

  private OdfElement convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfElement odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_PAGE_NUMBER));
      indexTable.addEntryByHtmlNode(htmlElement, odfElement);
      parent.appendChild(odfElement);
      
      parsePageNumberAttr(context, htmlElement, odfElement);
      
      return odfElement;
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
    }
    
    return null;
  }
  
  private void parsePageNumberAttr(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    odfElement.setAttribute(ODFConstants.TEXT_SELECT_PAGE, "current");
  }


}
