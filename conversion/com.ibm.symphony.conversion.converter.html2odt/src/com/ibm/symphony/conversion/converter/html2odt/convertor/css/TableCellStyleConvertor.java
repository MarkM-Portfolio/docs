/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.util.Map;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.common.CSSGroupStylesUtil;
import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.GeneralCSSPropertyConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TableCellStyleConvertor extends TableStyleConvertor
{
  public TableCellStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.TableCell;
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    return CSSUtil.getStyleName(odfStyleFamily, "TA");
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfDocument odfDoc, Element htmlElement,
      OdfStyleFamily odfStyleFamily, String htmlStyle)
  {
    // remove selectCellStyle class
    String style = htmlElement.getAttribute(Constants.CLASS);
    if (style != null && style.contains(Constants.TABLE_TEMPLATE_STYLE_SEL_CELL))
    {
      style = style.replace(Constants.TABLE_TEMPLATE_STYLE_SEL_CELL, "");
      style = style.trim();
      if (style.length() == 0)
      {
        htmlElement.removeAttribute(Constants.CLASS);
      }
      else
      {
        htmlElement.setAttribute(Constants.CLASS, style);
      }
    }

    Map<String, String> cssMap = HtmlTemplateCSSParser.getTableMergedStyle(context, htmlElement);

    parseCellBorder(cssMap, htmlElement);

    Object[] keySet = cssMap.keySet().toArray();
    for (Object key : keySet)
    {
      if (!isSupportedProperty((String) key))
      {
        cssMap.remove(key);
      }
    }

    if (cssMap.containsKey("text-align") && cssMap.get("text-align").toLowerCase().equals("margins"))
      cssMap.remove("text-align");

    if (htmlElement.getNodeName().equals(HtmlCSSConstants.TH))
    {
      if (!cssMap.containsKey(HtmlCSSConstants.FONT_WEIGHT))
        cssMap.put(HtmlCSSConstants.FONT_WEIGHT, "bold");
    }

    return cssMap;
  }

  protected boolean isSupportedProperty(String htmlCSSProperty)
  {
    Map<String, OdfStyleProperty> familyPropertyMap = GeneralCSSPropertyConvertor.TABLE_CELL_STYLE_NAME_PROR_MAP;

    String odfName = (String) CSSUtil.getODFName(odfStyleFamily, htmlCSSProperty);

    if (familyPropertyMap != null && familyPropertyMap.containsKey(odfName))
      return true;
    // for special attribute
    if (htmlCSSProperty.equalsIgnoreCase("border-color") || htmlCSSProperty.equalsIgnoreCase("border-style"))
      return true;
    if (htmlCSSProperty.contains("table."))
      return true;

    return false;
  }

  private void parseCellBorder(Map<String, String> cssMap, Element htmlElement)
  {
    CSSGroupStylesUtil.mergeBorderSeparateStyle(cssMap);

    boolean isTopColumn = isSideCell(htmlElement, 0);
    boolean isRightColumn = isSideCell(htmlElement, 1);
    boolean isBottomColumn = isSideCell(htmlElement, 2);
    boolean isLeftColumn = isSideCell(htmlElement, 3);

    // 0,top;1,right;2,bottom;3,left
    // top column
    if (isTopColumn)
    {
      parseSideBorderProperty(cssMap, 0);
    }

    // right column
    if (isRightColumn)
    {
      parseSideBorderProperty(cssMap, 1);
    }

    // bottom column
    if (isBottomColumn)
    {
      parseSideBorderProperty(cssMap, 2);
    }

    // left column
    if (isLeftColumn)
    {
      parseSideBorderProperty(cssMap, 3);
    }

    cssMap.remove("border");
    parseBorderLineProperty(cssMap);
  }

  private boolean isSideCell(Element htmlElement, int mark)
  {
    // 0,top;1,right;2,bottom;3,left
    boolean isSideCell = false;
    if (mark == 0)
    {
      Node parentNod = htmlElement.getParentNode();
      Node topLine = parentNod.getPreviousSibling();
      if (topLine == null || !topLine.getNodeName().equals(HtmlCSSConstants.TR))
      {
        isSideCell = true;
      }
    }
    else if (mark == 1)
    {
      String isRightCellValue = htmlElement.getAttribute("isRightCell");
      if (isRightCellValue.length() == 0)
      {
        Node nextNode = htmlElement.getNextSibling();
        if (nextNode == null)
          isSideCell = true;
      }
    }
    else if (mark == 2)
    {
      Node parentNod = htmlElement.getParentNode();
      Node bottomLine = parentNod.getNextSibling();

      String isBottomCellValue = htmlElement.getAttribute("isBottomCell");
      if (isBottomCellValue.length() > 0 || bottomLine == null || !bottomLine.getNodeName().equals(HtmlCSSConstants.TR))
        isSideCell = true;
    }
    else if (mark == 3)
    {
      String isLeftCellValue = htmlElement.getAttribute("isLeftCell");
      if (isLeftCellValue.length() == 0)
      {
        Node previousNode = htmlElement.getPreviousSibling();
        if (previousNode == null)
          isSideCell = true;
      }
    }
    return isSideCell;
  }

  private void parseSideBorderProperty(Map<String, String> cssMap, int mark)
  {
    String sidePropertyName = CSSGroupStylesUtil.getBorderCSSStyleName(mark, 0);

    if (!(cssMap.containsKey(sidePropertyName)) || (cssMap.get(sidePropertyName).toLowerCase().contains("none")))
    {
      if (cssMap.containsKey("table." + sidePropertyName))
        cssMap.put(sidePropertyName, cssMap.get("table." + sidePropertyName));
    }
  }

  private void parseBorderLineProperty(Map<String, String> cssMap)
  {
    for (int i = 0; i < 4; i++)
    {
      String sidePropertyName = CSSGroupStylesUtil.getBorderCSSStyleName(i, 0);
      if (cssMap.containsKey(sidePropertyName))
      {
        String sidePropertyValue = cssMap.get(sidePropertyName).toLowerCase();
        if (sidePropertyValue.contains("none"))
          cssMap.put(sidePropertyName, "none");
        else if (sidePropertyValue.contains("double"))
          parseDoubleBorderProperty(cssMap, sidePropertyName, sidePropertyValue, 0);
        else if (sidePropertyValue.contains("ridge"))
        {
          parseDoubleBorderProperty(cssMap, sidePropertyName, sidePropertyValue, 1);
          sidePropertyValue = sidePropertyValue.replace("ridge", "double");
          cssMap.put(sidePropertyName, sidePropertyValue);
        }
        else if (sidePropertyValue.contains("groove"))
        {
          parseDoubleBorderProperty(cssMap, sidePropertyName, sidePropertyValue, 2);
          sidePropertyValue = sidePropertyValue.replace("groove", "double");
          cssMap.put(sidePropertyName, sidePropertyValue);
        }
      }
    }

    if (cssMap.containsKey("border-line-width"))
    {
      cssMap.remove("border-line-width");
      return;
    }
  }

  private void parseDoubleBorderProperty(Map<String, String> cssMap, String borderPropertyName, String borderPropertyValue, int mark)
  {
    String borderLinePropertyName = borderPropertyName + "-line-width";
    String borderWidth = "";

    String[] proArr = borderPropertyValue.split(" ");
    for (int i = 0; i < proArr.length; i++)
    {
      borderWidth = proArr[i].trim();
      if (UnitUtil.getUnit(borderWidth).length() > 0)
        break;
    }

    if (!cssMap.containsKey(borderLinePropertyName))
    {
      if (cssMap.containsKey("border-line-width"))
      {
        cssMap.put(borderLinePropertyName, cssMap.get("border-line-width"));
        return;
      }

      // 0:double;1:ridge;2:groove
      if (mark == 0)
      {
        String width = UnitUtil.caculateMulWithPercent(borderWidth, "33.33%");
        cssMap.put(borderLinePropertyName, width + " " + width + " " + width);
      }
      else if (mark == 1)
      {
        String width0 = UnitUtil.caculateMulWithPercent(borderWidth, "45%");
        String width1 = UnitUtil.caculateMulWithPercent(borderWidth, "40%");
        String width2 = UnitUtil.caculateMulWithPercent(borderWidth, "15%");
        cssMap.put(borderLinePropertyName, width0 + " " + width1 + " " + width2);
      }
      else if (mark == 2)
      {
        String width0 = UnitUtil.caculateMulWithPercent(borderWidth, "15%");
        String width1 = UnitUtil.caculateMulWithPercent(borderWidth, "40%");
        String width2 = UnitUtil.caculateMulWithPercent(borderWidth, "45%");
        cssMap.put(borderLinePropertyName, width0 + " " + width1 + " " + width2);
      }
    }
  }
}
