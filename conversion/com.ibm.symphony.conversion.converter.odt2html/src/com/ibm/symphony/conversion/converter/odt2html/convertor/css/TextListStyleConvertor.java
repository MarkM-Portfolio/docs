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
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;

import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextListStyleConvertor extends GeneralCSSConvertor
{
  @Override
  public void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    if (element instanceof OdfTextListStyle)
      ListUtil.flattenListStyle(context, element);

    super.doConvertCSS(context, element, map);
  }

}
