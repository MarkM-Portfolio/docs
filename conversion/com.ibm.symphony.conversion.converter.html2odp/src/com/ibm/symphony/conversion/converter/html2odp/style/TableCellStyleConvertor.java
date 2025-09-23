/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odp.styleattr.GeneralPropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odp.template.TableTemplateParser;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TableCellStyleConvertor extends TableStyleConvertor
{
  /**
   * Return the ODFStyleFamily for this convert.  
   * @return OdfStyleFamily of type TableCell
   */
  @Override
  protected OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.TableCell;
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    return CSSUtil.getStyleName(getStyleFamily(), "TA");
  }

  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName, String styleString)
  {
    // If a table template, update the cell styles accordingly
    TableTemplateParser.updateCellStyles(context, htmlElement, odfElement, styleName);
    super.convertStyle(context, htmlElement, odfElement, styleName, styleString);

  }

  /*
   * protected Map<String, String> getCSSMap(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, OdfStyleFamily
   * odfStyleFamily, String htmlStyle) { //remove selectCellStyle class //String style =
   * htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS); if(style != null &&
   * style.contains(Constants.TABLE_TEMPLATE_STYLE_SEL_CELL)) { style = style.replace(Constants.TABLE_TEMPLATE_STYLE_SEL_CELL, ""); style =
   * style.trim(); if(style.equals("")) { htmlElement.removeAttribute(ODPConvertConstants.HTML_ATTR_CLASS); } else {
   * htmlElement.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, style); } }
   * 
   * Map<String, String> cssMap = TableTemplateParser.getTableMergedStyle(context, htmlElement); Object[] keySet =
   * cssMap.keySet().toArray(); for (Object key : keySet) { if (!isSupportedProperty((String) key)) { cssMap.remove(key); } }
   * 
   * if(cssMap.containsKey("text-align") && cssMap.get("text-align").equals("margins")) cssMap.remove("text-align");
   * 
   * parseCellBorder(cssMap, htmlElement);
   * 
   * return cssMap; }
   */

  protected boolean isSupportedProperty(String htmlCSSProperty)
  {
    Map<String, OdfStyleProperty> familyPropertyMap = GeneralPropertyConvertor.TABLE_CELL_STYLE_NAME_PROR_MAP;

    String odfName = (String) CSSUtil.getODFName(getStyleFamily(), htmlCSSProperty);

    if (familyPropertyMap != null && familyPropertyMap.containsKey(odfName))
      return true;
    // for special attribute
    if (htmlCSSProperty.equalsIgnoreCase("border-color") || htmlCSSProperty.equalsIgnoreCase("border-style"))
      return true;
    if (htmlCSSProperty.contains("table."))
      return true;

    return false;
  }

  @SuppressWarnings("unused")
  private void parseCellBorder(Map<String, String> cssMap, Element htmlElement)
  {
    if (cssMap.containsKey("border-style"))
    {
      splitWidthColorStyleProperty(cssMap);
    }
    else if (cssMap.containsKey("border"))
    {
      splitBorderProperty(cssMap);
    }

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
    else if (cssMap.containsKey("border"))
    {
      cssMap.put("border-top", "none");
    }

    // right column
    if (isRightColumn)
    {
      parseSideBorderProperty(cssMap, 1);
    }
    else if (cssMap.containsKey("border"))
    {
      cssMap.put("border-right", "none");
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
    String sidePropertyName = getSidePropertyName(mark);

    if (!(cssMap.containsKey(sidePropertyName)) || (cssMap.get(sidePropertyName).toLowerCase().contains("none")))
    {
      if (cssMap.containsKey("table." + sidePropertyName))
        cssMap.put(sidePropertyName, cssMap.get("table." + sidePropertyName));
      else if (cssMap.containsKey("table.border"))
        cssMap.put(sidePropertyName, cssMap.get("table.border"));
    }
  }

  private void splitBorderProperty(Map<String, String> cssMap)
  {
    String border = cssMap.get("border");
    mergeBorderPropertyValue(border, cssMap, 0);
    mergeBorderPropertyValue(border, cssMap, 1);
    mergeBorderPropertyValue(border, cssMap, 2);
    mergeBorderPropertyValue(border, cssMap, 3);
  }

  private void splitWidthColorStyleProperty(Map<String, String> cssMap)
  {
    String[] borderWidthArray = { "0.0008in", "0.0008in", "0.0008in", "0.0008in" };
    String[] borderStyleArray = { "solid", "solid", "solid", "solid" };
    String[] borderColorArray = { "#000000", "#000000", "#000000", "#000000" };
    CSSUtil.convertBorderValues(cssMap, "border-width", borderWidthArray);
    CSSUtil.convertBorderValues(cssMap, "border-style", borderStyleArray);
    CSSUtil.convertBorderValues(cssMap, "border-color", borderColorArray);
    String borderTop = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 0).toLowerCase();
    String borderRight = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 1).toLowerCase();
    String borderBottom = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 2).toLowerCase();
    String borderLeft = CSSUtil.getShorthandValue(borderWidthArray, borderStyleArray, borderColorArray, 3).toLowerCase();

    mergeBorderPropertyValue(borderTop, cssMap, 0);
    mergeBorderPropertyValue(borderRight, cssMap, 1);
    mergeBorderPropertyValue(borderBottom, cssMap, 2);
    mergeBorderPropertyValue(borderLeft, cssMap, 3);

    cssMap.remove("border");
    cssMap.remove("border-width");
    cssMap.remove("border-style");
    cssMap.remove("border-color");
  }

  private void mergeBorderPropertyValue(String propertyValue, Map<String, String> cssMap, int mark)
  {
    String sidePropertyName = getSidePropertyName(mark);
    if (cssMap.containsKey(sidePropertyName))
    {
      // do nothing;
    }
    else if (cssMap.containsKey("border"))
    {
      String borderProperty = cssMap.get("border").toLowerCase();
      if (propertyValue.contains("none") && !borderProperty.contains("none"))
        cssMap.put(sidePropertyName, borderProperty);
      else
        cssMap.put(sidePropertyName, propertyValue);
    }
    else
    {
      cssMap.put(sidePropertyName, propertyValue);
    }
  }

  private String getSidePropertyName(int mark)
  {
    String sidePropertyName = "";

    switch (mark)
      {
        case 0 :
          sidePropertyName = "border-top";
          break;
        case 1 :
          sidePropertyName = "border-right";
          break;
        case 2 :
          sidePropertyName = "border-bottom";
          break;
        case 3 :
          sidePropertyName = "border-left";
          break;
      }
    return sidePropertyName;
  }
}
