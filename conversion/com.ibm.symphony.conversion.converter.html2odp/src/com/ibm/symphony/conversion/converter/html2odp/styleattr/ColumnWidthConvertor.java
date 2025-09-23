/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableColumnProperties;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.converter.html2odp.style.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class ColumnWidthConvertor extends GeneralPropertyConvertor
{

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    String tableWidth = (String) context.get(ODPConvertConstants.CONTEXT_TABLE_WIDTH);
    String finalValue = CSSUtil.computeMeasureByPercentage(tableWidth, value);
    style.setProperty(OdfStyleTableColumnProperties.ColumnWidth, finalValue);
  }
}
