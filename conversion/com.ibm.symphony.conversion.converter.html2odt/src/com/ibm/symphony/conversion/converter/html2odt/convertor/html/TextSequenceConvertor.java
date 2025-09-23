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

import java.util.Iterator;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;

import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class TextSequenceConvertor extends GeneralFieldsConvertor
{

  @Override
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    if (!htmlElement.hasChildNodes())
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
      // New Date and Time Element
      return convertNewElement(context, htmlElement, indexTable, parent);
    }
  }

  private OdfElement convertNewElement(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, OdfElement parent)
  {
    try
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);

      String oldNodeId = null;

      Iterator<String> classes = XMLConvertorUtil.getClassNameList(htmlElement).iterator();
      while (classes.hasNext())
      {
        String className = classes.next();
        if (className.startsWith(Constants.TEXT_SEQUENCE_OID_PREFIX))
        {
          oldNodeId = className.substring(Constants.TEXT_SEQUENCE_OID_PREFIX.length());
          break;
        }   
      }

      if (oldNodeId != null)
      {
        Element oldHtmlNode = (Element) htmlElement.cloneNode(false);
        oldHtmlNode.setAttribute("id", oldNodeId);
        
        OdfElement oldOdfElement = indexTable.getFirstOdfNode(oldHtmlNode);
        OdfElement odfElement = null;
        if(oldOdfElement != null)
        {
          oldOdfElement.removeAttribute("id");
          odfElement = (OdfElement) oldOdfElement.cloneNode(true);
          oldOdfElement.setAttribute("id", oldNodeId);
          
          indexTable.addEntryByHtmlNode(htmlElement, odfElement);
        }
        else
        {
          odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
        }
        
        parent.appendChild(odfElement);

        return odfElement;
      }
      else
      {
        OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
        parent.appendChild(odfElement);
        return odfElement;
      }
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
    }

    return null;
  }
}
