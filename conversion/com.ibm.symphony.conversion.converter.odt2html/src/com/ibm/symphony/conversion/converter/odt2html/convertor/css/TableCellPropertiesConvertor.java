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

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class TableCellPropertiesConvertor extends GeneralCSSConvertor
{

  @Override
  public void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    super.doConvertCSS(context, element, map);

    String styleName = CSSConvertorUtil.getStyleName(element);
    Map<String, String> styleMap = CSSConvertorUtil.getStyleMap(styleName, map);

    parseTableDoubleLine(context, element, styleMap);
  }

  private void parseTableDoubleLine(ConversionContext context, OdfElement element, Map<String, String> styleMap)
  {
    for(int i=0;i<5;i++)
    {
      String sidePropertyName = getSidePropertyName(i);
      String temp = "-line-width";

      String sideWidthPropertyName = sidePropertyName + temp;
      if(styleMap.containsKey(sideWidthPropertyName) && styleMap.containsKey(sidePropertyName))
      {
        String sidePropertyValue =  styleMap.get(sidePropertyName).toLowerCase();
        if(sidePropertyValue.contains("double"))
        {
          String[] widths = styleMap.get(sideWidthPropertyName).split(" ");

          if(widths.length == 3)
          {
            if(UnitUtil.compareLength(widths[0], widths[2])>0)
            {
              sidePropertyValue = sidePropertyValue.replace("double", "ridge");
              styleMap.put(sidePropertyName, sidePropertyValue);
            }
            else if(UnitUtil.compareLength(widths[0], widths[2])<0)
            {
              sidePropertyValue = sidePropertyValue.replace("double", "groove");
              styleMap.put(sidePropertyName, sidePropertyValue);
            }
          }
        }
      }
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
        default:
          sidePropertyName = "border";
      }
    return sidePropertyName;
  }

}
