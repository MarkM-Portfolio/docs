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

import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.GeneralCSSPropertyConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TableStyleConvertor extends GeneralCSSStyleConvertor
{
  public TableStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.Table;
  }

  protected String getStyleName(OdfStylableElement stylable, String styleName)
  {
    return stylable.getStyleName();
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    return CSSUtil.getStyleName(odfStyleFamily, "TA");
  }

  protected void setDefaultStyle(OdfStylableElement stylable)
  {
    return;
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfDocument odfDoc, Element htmlElement,
      OdfStyleFamily odfStyleFamily, String htmlStyle)
  {
    Map<String, String> cssMap = HtmlTemplateCSSParser.getTableMergedStyle(context, htmlElement);

    Object[] keySet = cssMap.keySet().toArray();
    for (Object key : keySet)
    {
      if (!isSupportedProperty((String) key))
      {
        cssMap.remove(key);
      }
    }
    
    if(cssMap.containsKey(HtmlCSSConstants.BORDER_COLLAPSE))
    {
      String borderCollapse = cssMap.get(HtmlCSSConstants.BORDER_COLLAPSE);
      if(borderCollapse.equalsIgnoreCase("separate"))
        borderCollapse = "separating";
      else if(borderCollapse.equalsIgnoreCase("collapse"))
        borderCollapse = "collapsing";
      cssMap.put(HtmlCSSConstants.BORDER_COLLAPSE, borderCollapse);
    }
    
    return cssMap;
  }

  protected boolean isSupportedProperty(String htmlCSSProperty)
  {
    Map<String, OdfStyleProperty> familyPropertyMap = GeneralCSSPropertyConvertor.TABLE_STYLE_NAME_PROR_MAP;

    String odfName = (String) CSSUtil.getODFName(odfStyleFamily, htmlCSSProperty);

    if (familyPropertyMap != null && familyPropertyMap.containsKey(odfName))
      return true;

    return false;
  }
}
