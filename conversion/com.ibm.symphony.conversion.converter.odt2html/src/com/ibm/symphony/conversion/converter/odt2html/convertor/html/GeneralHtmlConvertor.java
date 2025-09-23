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
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;

public class GeneralHtmlConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Element htmlNode = convertElement(context, element, parent);
    if (htmlNode != null)
    {
      convertAttributes(context, element, htmlNode);
      convertChildren(context, element, htmlNode);
    }
    else
    {
      convertChildren(context, element, parent);
    }
  }

  protected Element convertElement(ConversionContext context, OdfElement element, Element parent)
  {

    JSONObject jsObj = ConvertUtil.getODFMap();
    Object htmlTag = jsObj.get(element.getNodeName());
    Document doc = (Document) context.getTarget();
    if (htmlTag != null)
    {
      Element newNode = HtmlConvertorUtil.createHtmlElement(context, element, (String) htmlTag);
      parent.appendChild(newNode);
      return newNode;
    }
    else
    {
      return null;
    }

  }

  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);

  }

  protected void convertChildren(ConversionContext context, OdfElement element, Node htmlNode)
  {
    HtmlConvertorUtil.convertChildren(context, element, htmlNode);
  }
}
