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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ParagraphStyleConvertor extends GeneralCSSStyleConvertor
{
  private static Set<String> PROPS_USE_DEFAULT = null;
  static
  {
    PROPS_USE_DEFAULT = new HashSet<String>();
    PROPS_USE_DEFAULT.add("margin-top");
    PROPS_USE_DEFAULT.add("margin-bottom");
    PROPS_USE_DEFAULT.add("margin-left");
    PROPS_USE_DEFAULT.add("margin-right");
  }

  private static HashMap<String, String> tabstopPropertyMap = new HashMap<String, String>();
  static
  {
    tabstopPropertyMap.put("c", ODFConstants.STYLE_CHAR);
    tabstopPropertyMap.put("lc", ODFConstants.STYLE_LEADER_COLOR);
    tabstopPropertyMap.put("ls", ODFConstants.STYLE_LEADER_STYLE);
    tabstopPropertyMap.put("ltx", ODFConstants.STYLE_LEADER_TEXT);
    tabstopPropertyMap.put("lts", ODFConstants.STYLE_LEADER_TEXT_STYLE);
    tabstopPropertyMap.put("lt", ODFConstants.STYLE_LEADER_TYPE);
    tabstopPropertyMap.put("lw", ODFConstants.STYLE_LEADER_WIDTH);
    tabstopPropertyMap.put("p", ODFConstants.STYLE_POSITION);
    tabstopPropertyMap.put("t", ODFConstants.STYLE_TYPE);
  }

  private static Set<String> tocClassName = new HashSet<String>();
  static
  {
    tocClassName.add("L1");
    tocClassName.add("L2");
    tocClassName.add("L3");
    tocClassName.add("L4");
    tocClassName.add("L5");
    tocClassName.add("L6");
    tocClassName.add("tocTitle");
  }

  public ParagraphStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.Paragraph;
  }

  protected boolean useDefaultValue(String key, String value)
  {
    if (PROPS_USE_DEFAULT.contains(key) && value.endsWith("px"))
    {
      int iValue = Integer.parseInt(value.substring(0, value.length() - 2));
      if (0 == iValue)
        return true;
    }
    return false;
  }

  @Override
  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> cssMap, OdfStyleFamily odfStyleFamily)
  {
    String styleKey = ReusableStyleUtil.generateKey(htmlElement, new String[] { "class", "_ts" }, cssMap);
    OdfStyle style = ReusableStyleUtil.getReusableStyle(context, styleKey);
    if (style != null)
      return style;

    String lineHeight = cssMap.get(HtmlCSSConstants.LINE_HEIGHT);
    if (lineHeight != null)
    {
      int unitL = UnitUtil.getUnit(lineHeight).length();
      if(unitL > 1)
        calcLineHeight(cssMap, htmlElement, lineHeight);
      else if (unitL == 0)
      {
        Double value = Double.parseDouble(lineHeight);
        String valuePercentage = String.valueOf((int) (value * 100)) + "%";
        cssMap.put(HtmlCSSConstants.LINE_HEIGHT, valuePercentage);
      }
    }

    style = super.parseStyle(context, odfDoc, htmlElement, styleName, cssMap, odfStyleFamily);

    OdfStyleBase oldStyle = XMLConvertorUtil.getStyle(styleName, odfStyleFamily, (OdfDocument) context.getTarget());

    if (htmlElement == null)
    {
      applyParentStyle(style, oldStyle);
      ReusableStyleUtil.addReusableStyle(context, styleKey, style);
      return style;
    }

    if (oldStyle != null && !htmlElement.getNodeName().startsWith("h") && !isTopDiv(htmlElement))
    {
      OdfStyleBase oldParentStyle = oldStyle.getParentStyle();
      if (oldParentStyle != null)
      {
        String oldParentStyleName = oldParentStyle.getAttribute(ODFConstants.STYLE_NAME);
        if (!"Header".equals(oldParentStyleName) && !"Footer".equals(oldParentStyleName))
          XMLConvertorUtil.removeInheritStyle(style, oldStyle, oldParentStyle);
      }
    }

    String marginLeft = null;
    Boolean trti = (Boolean)context.get("TabsRelativeToIndent");
    if (trti != null && trti)
    {
      marginLeft = cssMap.get(HtmlCSSConstants.MARGIN_LEFT);
    }
    String tabstopAllStyle = htmlElement.getAttribute(HtmlCSSConstants.TABSTOP);
    if (tabstopAllStyle != null && !tabstopAllStyle.equals(""))
    {
      OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfElement pagragraphElement = (OdfElement) style.getOrCreatePropertiesElement(OdfStylePropertiesSet.ParagraphProperties);
      OdfElement tabstopsOdfElement = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.STYLE_TAB_STOPS));
      pagragraphElement.appendChild(tabstopsOdfElement);
      tabstopAllStyle = tabstopAllStyle.replaceAll("::", ":cc");
      tabstopAllStyle = tabstopAllStyle.replaceAll(":;", ":aa");
      tabstopAllStyle = tabstopAllStyle.replaceAll(":,", ":bb");
      String[] tabstopStyle = tabstopAllStyle.split(";");
      for (int i = 0; i < tabstopStyle.length; i++)
      {
        String[] tabstopAttr = tabstopStyle[i].split(",");
        OdfElement tabstopOdfElement = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.STYLE_TAB_STOP));
        tabstopsOdfElement.appendChild(tabstopOdfElement);
        for (int j = 0; j < tabstopAttr.length; j++)
        {
          String[] attr = tabstopAttr[j].split(":");
          if (tabstopAttr[j].endsWith("cc"))
            tabstopOdfElement.setOdfAttributeValue(ConvertUtil.getOdfName(tabstopPropertyMap.get(attr[0])), ":");
          else
          {
            if (attr[1].equals("aa"))
              attr[1] = ";";
            else if (attr[1].equals("bb"))
              attr[1] = ",";

            if ("p".equals(attr[0]) && marginLeft != null && !"".equals(marginLeft))
              tabstopOdfElement.setOdfAttributeValue(ConvertUtil.getOdfName(tabstopPropertyMap.get(attr[0])),
                  UnitUtil.decreaseLength(attr[1], marginLeft));
            else
              tabstopOdfElement.setOdfAttributeValue(ConvertUtil.getOdfName(tabstopPropertyMap.get(attr[0])), attr[1]);
          }
        }
      }
    }
    else if (oldStyle != null) // In case parent style has tab stop, new style shouldn't inherit it.
    {
      Node tabstops = oldStyle.getElementsByTagName(ODFConstants.STYLE_TAB_STOPS).item(0);
      if (tabstops != null && tabstops.getFirstChild() == null)
      {
        OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
        OdfElement pagragraphElement = (OdfElement) style.getOrCreatePropertiesElement(OdfStylePropertiesSet.ParagraphProperties);
        OdfElement tabstopsOdfElement = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.STYLE_TAB_STOPS));
        pagragraphElement.appendChild(tabstopsOdfElement);
      }
    }

    applyParentStyle(style, oldStyle);
    ReusableStyleUtil.addReusableStyle(context, styleKey, style);
    return style;
  }

  private static void applyParentStyle(OdfStyle style, OdfStyleBase oldStyle)
  {
    if (oldStyle != null)
    {
      String parentStyleName = oldStyle.getAttribute(ODFConstants.STYLE_PARENT_STYLE_NAME);

      if (parentStyleName != null && parentStyleName.length() > 0)
      {
        style.setStyleParentStyleNameAttribute(parentStyleName);
      }
      else
      {
        String styleName = oldStyle.getAttribute(ODFConstants.STYLE_NAME);
        style.setStyleParentStyleNameAttribute(styleName);
      }
    }
    else
    {
      style.setStyleParentStyleNameAttribute("Default_20_Text");
    }
  }

  protected String getStyleName(OdfStylableElement stylable, String styleName)
  {
    if (styleName != null)
    {
      String[] styles = styleName.split(" ");
      if (styles.length > 1)
      {
        if (tocClassName.contains(styles[1]) || "thinborder".equals(styles[1]))
          return styles[0];
      }
    }
    return styleName;
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    return super.newStyleName(stylable, getStyleName(stylable, styleName));
  }

  private void calcLineHeight(Map<String, String> cssMap, Element htmlElement, String lineHeight)
  {
    double lineHeightVal = UnitUtil.getCMLength(lineHeight);
    cssMap.put(HtmlCSSConstants.LINE_HEIGHT, lineHeightVal + "cm");

    Node node = htmlElement.getFirstChild();
    while (node != null)
    {
      if (HtmlCSSConstants.IMG.equals(node.getNodeName()))
      {
        String imageStyle = ((Element) node).getAttribute(HtmlCSSConstants.STYLE).toLowerCase();
        Map<String, String> imageStyleMap = ConvertUtil.buildCSSMap(imageStyle);
        String imageHeight = CSSUtil.getUpdatedHeight(imageStyleMap);
        if (imageHeight != null)
        {
          if((UnitUtil.getUnit(imageHeight)).length() > 1)
          {
	        double imageHeightVal = UnitUtil.getCMLength(imageHeight) * 1.25;	
	        if (imageHeightVal > lineHeightVal)
	        {
	          cssMap.remove(HtmlCSSConstants.LINE_HEIGHT);
	          break;
	        }
          }
        }
      }
      node = node.getNextSibling();
    }
  }

  private boolean isTopDiv(Element htmlElement)
  {
    if (htmlElement.getNodeName().equals("div"))
    {
      String _type = (String) htmlElement.getAttribute("_type");
      if (_type != null)
      {
        if (_type.equals(HtmlCSSConstants.TOPDIV))
        {
          return true;
        }
      }
    }
    return false;
  }

}
