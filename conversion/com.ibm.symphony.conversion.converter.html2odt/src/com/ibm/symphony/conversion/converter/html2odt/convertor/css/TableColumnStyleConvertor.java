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

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class TableColumnStyleConvertor extends TableStyleConvertor
{
  public TableColumnStyleConvertor()
  {
    this.odfStyleFamily = OdfStyleFamily.TableColumn;
  }

  protected Map<String, String> getCSSMap(ConversionContext context, OdfDocument odfDoc, Element htmlElement,
      OdfStyleFamily odfStyleFamily, String htmlStyle)
  {
    Map<String, String> cssMap = new HashMap<String, String>();
    if (htmlStyle != null)
    {
      Map<String, String> styleMap = ConvertUtil.buildCSSMap(htmlStyle);
      if (styleMap.containsKey(HtmlCSSConstants.WIDTH))
        cssMap.put("colwidth", styleMap.get(HtmlCSSConstants.WIDTH));
    }
    return cssMap;
  }
}
