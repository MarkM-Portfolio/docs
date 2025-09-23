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
import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class TableRowStyleConvertor extends TableStyleConvertor
{
  public TableRowStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.TableRow;
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfDocument odfDoc, Element htmlElement,
      OdfStyleFamily odfStyleFamily, String htmlStyle)
  {
    String style = htmlElement.getAttribute(Constants.CLASS);
    if (style != null && (style.length() > Constants.TABLE_ALTER_ROW_CELL.length()))
    {
      if (style.contains(Constants.TABLE_ALTER_ROW_CELL)
          && (style.contains(Constants.TABLE_HEADER_ROW_CELL) || style.contains(Constants.TABLE_LAST_ROW_CELL)))
      {
        style = style.replace(Constants.TABLE_ALTER_ROW_CELL, "");
        style += " ";
        style += Constants.TABLE_ALTER_ROW_CELL;
      }
        

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

    Map<String, String> cssMap = new HashMap<String, String>();
    if (htmlStyle != null)
    {
      Map<String, String> styleMap = ConvertUtil.buildCSSMap(htmlStyle);
      if (styleMap.containsKey(HtmlCSSConstants.HEIGHT))
        cssMap.put(HtmlCSSConstants.HEIGHT, styleMap.get(HtmlCSSConstants.HEIGHT));
    }
    return cssMap;
  }

  @Override
  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> cssMap, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle style = super.parseStyle(context, odfDoc, htmlElement, styleName, cssMap, odfStyleFamily);
    OdfStyleBase oldStyle = XMLConvertorUtil.getStyle(styleName, odfStyleFamily, (OdfDocument) context.getTarget());
    if (oldStyle != null)
    {
      OdfStylePropertiesSet proSet = OdfStylePropertiesSet.TableRowProperties;
      OdfStylePropertiesBase proElement = oldStyle.getPropertiesElement(proSet);
      if (proElement != null && proElement.hasAttribute(ODFConstants.STYLE_KEEP_TOGETHER))
      {
        OdfFileDom contentDom = XMLConvertorUtil.getCurrentFileDom(context);
        OdfName name = ConvertUtil.getOdfName((String) ODFConstants.STYLE_KEEP_TOGETHER);
        OdfAttribute odfAttr = contentDom.createAttributeNS(name);
        odfAttr.setValue(proElement.getAttribute(ODFConstants.STYLE_KEEP_TOGETHER));
        style.getOrCreatePropertiesElement(proSet).setAttributeNode(odfAttr);
      }
    }
    return style;
  }

}
