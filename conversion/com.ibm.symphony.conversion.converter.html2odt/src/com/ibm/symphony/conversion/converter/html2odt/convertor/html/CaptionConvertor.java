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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class CaptionConvertor extends DIVConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      indexTable.removeEntriesByHtmlNode(htmlElement);
    }

    // add caption default style
    String styleString = htmlElement.getAttribute(Constants.STYLE);
    Map<String, String> cssMap = ConvertUtil.buildCSSMap(styleString);

    if (cssMap != null && cssMap.containsKey("display") && cssMap.get("display").equals("none"))
      return;

    parseCaptionDefaultStyle(context, htmlElement);

    odfElement = super.convertToTextBox(context, htmlElement, parent.getParentNode(), parent);

    resetCaptionAttr(context, odfElement, parent);
  }

  private void resetCaptionAttr(ConversionContext context, OdfElement captionElement, OdfElement parent)
  {
    if (parent.getNodeName().equals(ODFConstants.TABLE_TABLE))
    {
      OdfStylableElement stylable = (OdfStylableElement) parent;
      OdfElement drawFrame = (OdfElement) captionElement.getFirstChild();
      if (stylable.hasProperty(OdfStyleTableProperties.Width))
      {
        drawFrame.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_WIDTH), stylable.getProperty(OdfStyleTableProperties.Width));
      }

      OdfStylableElement stylableFrame = (OdfStylableElement) drawFrame;

      if (stylable.hasProperty(OdfStyleTableProperties.Margin))
        stylableFrame.setProperty(OdfStyleGraphicProperties.Margin, stylable.getProperty(OdfStyleTableProperties.Margin));

      if (stylable.hasProperty(OdfStyleTableProperties.MarginLeft))
        stylableFrame.setProperty(OdfStyleGraphicProperties.MarginLeft, stylable.getProperty(OdfStyleTableProperties.MarginLeft));

      if (stylable.hasProperty(OdfStyleTableProperties.MarginRight))
        stylableFrame.setProperty(OdfStyleGraphicProperties.MarginRight, stylable.getProperty(OdfStyleTableProperties.MarginRight));

      if (stylable.hasProperty(OdfStyleTableProperties.MarginTop))
      {
        stylableFrame.setProperty(OdfStyleGraphicProperties.MarginTop, stylable.getProperty(OdfStyleTableProperties.MarginTop));
        stylable.setProperty(OdfStyleTableProperties.MarginTop, "0cm");
      }

      stylableFrame.setProperty(OdfStyleGraphicProperties.MarginBottom, "0cm");

      if (stylable.hasProperty(OdfStyleTableProperties.Align))
        stylableFrame.setProperty(OdfStyleGraphicProperties.HorizontalPos, stylable.getProperty(OdfStyleTableProperties.Align));
    }
  }

  private void parseCaptionDefaultStyle(ConversionContext context, Element htmlElement)
  {

    if (htmlElement.getNodeName().equalsIgnoreCase(HtmlCSSConstants.CAPTION))
    {
      String style = htmlElement.getAttribute(Constants.STYLE);
      if (style == null || !style.toLowerCase().contains("background-color"))
      {
        style = (style == null) ? "" : style;

        Map<String, String> cssMap = getCaptionStyle(context, htmlElement);
        if (cssMap != null && cssMap.containsKey("background-color"))
        {
          style = "background-color:" + cssMap.get("background-color") + ";" + style;
        }
        else
        {
          style = "background-color:#FFFFFF;" + style;
        }

        htmlElement.setAttribute(Constants.STYLE, style);
      }
    }

    NodeList childNodes = htmlElement.getChildNodes();
    for (int i = 0; i < childNodes.getLength(); i++)
    {
      Node child = childNodes.item(i);
      if (child instanceof Element)
      {
        Element childElement = (Element) child;
        if (child.getNodeName().equals(HtmlCSSConstants.UL) || child.getNodeName().equals(HtmlCSSConstants.OL))
        {
          parseCaptionDefaultStyle(context, childElement);
        }
        else
        {
          String styleString = childElement.getAttribute(Constants.STYLE);
          Map<String, String> styleMap = ConvertUtil.buildCSSMap(styleString);
          if (styleMap == null || !styleMap.containsKey(HtmlCSSConstants.TEXT_ALIGN))
          {
            styleMap.put(HtmlCSSConstants.TEXT_ALIGN, "center");
            styleString = ConvertUtil.convertMapToStyle(styleMap);
            childElement.setAttribute(Constants.STYLE, styleString);
          }
        }
      }
    }
  }

  public static Map<String, String> getCaptionStyle(ConversionContext context, Element htmlElement)
  {
    Map<String, String> mapAllStyleInfo = new HashMap<String, String>();
    List<Node> parentNodes = new ArrayList<Node>();
    parentNodes.add(htmlElement.getParentNode());
    HtmlTemplateCSSParser.putTableNodeMergedStyle(htmlElement, parentNodes, mapAllStyleInfo);

    return mapAllStyleInfo;
  }
}
