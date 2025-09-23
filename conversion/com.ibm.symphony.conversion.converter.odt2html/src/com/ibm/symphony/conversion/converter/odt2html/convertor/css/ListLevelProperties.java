/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.css;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ListLevelProperties extends CSSConvertor
{

  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    String marginLeft = element.getAttribute(ODFConstants.TEXT_SPACE_BEFORE);
   
    if (marginLeft.length() > 0)
    {
      String styleName = CSSConvertorUtil.getStyleName(element);
      Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);
      if(UnitUtil.getUnit(marginLeft).toLowerCase().equals(Unit.INCH.abbr()))
        marginLeft = UnitUtil.convertINToCM(marginLeft);
      styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);
    }
    CSSConvertorUtil.convertChildren(context, element, map);
  }

}
