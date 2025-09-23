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

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class GeneralFieldsConvertor extends GeneralXMLConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    
    parent = convertStyleToParent(context, htmlElement, parent);

    OdfElement odfElement = convertElement(context, htmlElement, parent);

    if (odfElement != null)
    {
      convertChildren(context, htmlElement, odfElement);
    }
    else
    {
      convertChildren(context, htmlElement, parent);
    }
  }

  protected OdfElement convertStyleToParent(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    convertSingleChildStyle(context, htmlElement, parent);
    String styleString = htmlElement.getAttribute(Constants.STYLE);
    if (styleString != null && !styleString.equals(""))
    {
      OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
      parent.appendChild(odfElement);
      
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      OdfElement oldOdfElement = indexTable.getFirstOdfNode(htmlElement);
      if(oldOdfElement != null)
        odfElement.appendChild(oldOdfElement);
      
      CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Text).convertStyle(context, htmlElement, odfElement, null, styleString);
      
      htmlElement.removeAttribute(Constants.STYLE);
      parent = odfElement;
    }
    return parent;
  }

  private void convertSingleChildStyle(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String styleString = htmlElement.getAttribute(Constants.STYLE);
    if(styleString != null && !styleString.equals(""))
    {
      if(isSingleChildOfSpan(htmlElement))
      {
        mergeStyleToParentSpan(context,(Element)htmlElement.getParentNode(),parent,styleString);
        htmlElement.removeAttribute(Constants.STYLE);
      }
    }
  }
  
  private boolean isSingleChildOfSpan(Element htmlElement)
  {
    Node parent = htmlElement.getParentNode();
    if(parent.getNodeName().equalsIgnoreCase(HtmlCSSConstants.SPAN))
    {
      NodeList nodes = parent.getChildNodes();
      int childCount = nodes.getLength();
      if(parent.getChildNodes().getLength() == 1)
        return true;
    }
    return false;
  }
  
  private void mergeStyleToParentSpan(ConversionContext context, Element htmlParent, OdfElement odfParent,String style)
  {
    String parentStyle = htmlParent.getAttribute(Constants.STYLE);
    Map<String,String> cssMap = ConvertUtil.buildCSSMap(parentStyle);
    Map<String,String> newCssMap = ConvertUtil.buildCSSMap(style);
    cssMap.putAll(newCssMap);
    htmlParent.setAttribute(Constants.STYLE, ConvertUtil.convertMapToStyle(cssMap));
    XMLConvertorUtil.convertAttributes(context, htmlParent, odfParent, OdfStyleFamily.Text);
  } 
}
