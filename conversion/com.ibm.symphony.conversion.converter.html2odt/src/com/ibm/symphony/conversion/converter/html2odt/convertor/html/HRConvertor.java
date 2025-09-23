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
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class HRConvertor extends XMLConvertor
{

  @Override
  protected void doConvertXML(ConversionContext context, Element element, OdfElement parent)
  {
    NamedNodeMap attrs = element.getAttributes();
    Node classAttr = (null == attrs) ? null : attrs.getNamedItem(Constants.CLASS);
    if (null != classAttr)
    {
      String classVal = classAttr.getNodeValue();
      if (classVal != null && Constants.CK_PAGE_BREAK.equals(classVal))
      {
        ImageConvertor.processPageBreak(context, element, parent);
        return;
      }
    }

    convertToCustomShape(context, element, parent);
  }

  protected OdfElement convertToCustomShape(ConversionContext context, Element htmlElement, Node parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      return odfElement;
    }

    OdfElement textPara = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
    OdfElement textPara1 = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
    OdfElement textPara2 = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
    OdfElement drawCustomShape = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(
        ConvertUtil.getOdfName(ODFConstants.DRAW_CUSTOM_SHAPE));
    OdfElement drawEG = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(
        ConvertUtil.getOdfName(ODFConstants.DRAW_ENHANCED_GEOMETRY));
    indexTable.addEntryByHtmlNode(htmlElement, textPara);
    drawCustomShape.appendChild(textPara1);
    drawCustomShape.appendChild(drawEG);
    textPara.appendChild(drawCustomShape);
    parent.appendChild(textPara2);
    parent.appendChild(textPara);

    convertShapeAttributes(context, drawCustomShape);
    convertEGAttributes(context, drawEG);
    return textPara;
  }

  protected void convertShapeAttributes(ConversionContext context, OdfElement odfElement)
  {
    String pageWidth = (String) context.get(Constants.CONCORD_PAGE_WIDTH);
    if (pageWidth == null || pageWidth.equals(""))
      pageWidth = "17cm";

    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_ANCHOR_TYPE), "as-char");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_WIDTH), pageWidth);
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_HEIGHT), "0.05cm");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_Y), "0cm");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_Z_INDEX), "0");

    OdfStylableElement stylable = (OdfStylableElement) odfElement;
    OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
    OdfOfficeAutomaticStyles autoStyles = currentFileDom.getAutomaticStyles();
    OdfStyle newStyle = parseShapeStyle(context, currentFileDom, OdfStyleFamily.Graphic);
    autoStyles.appendChild(newStyle);
    stylable.setStyleName(newStyle.getStyleNameAttribute());
  }

  private OdfStyle parseShapeStyle(ConversionContext context, OdfFileDom odfDoc, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle style = CSSUtil.getOldStyle(context, "concordHRStyle", odfStyleFamily);
    if (style == null)
    {
      style = new OdfStyle(odfDoc);
      style.setStyleFamilyAttribute(odfStyleFamily.getName());
      style.setStyleNameAttribute("concordHRStyle");

      style.setProperty(OdfStyleGraphicProperties.Stroke, "none");
      style.setProperty(OdfStyleGraphicProperties.Fill, "solid");
      style.setProperty(OdfStyleGraphicProperties.FillColor, "#cccccc");
      style.setProperty(OdfStyleGraphicProperties.AutoGrowHeight, "false");
      style.setProperty(OdfStyleGraphicProperties.MarginLeft, "0cm");
      style.setProperty(OdfStyleGraphicProperties.MarginRight, "0cm");
      style.setProperty(OdfStyleGraphicProperties.WrapInfluenceOnPosition, "once-concurrent");
      style.setProperty(OdfStyleGraphicProperties.FlowWithText, "false");
    }

    return style;
  }

  protected void convertEGAttributes(ConversionContext context, OdfElement odfElement)
  {
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_VIEW_BOX), "0 0 21600 21600");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_TEXT_ROTATE_ANGLE), "-0");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_MIRROR_VERTICAL), "true");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_TYPE), "rectangle");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_ENHANCED_PATH), "M 0 0 L 21600 0 21600 21600 0 21600 0 0 Z N");
  }

}
