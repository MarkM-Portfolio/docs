/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class TableRowHeightConvertor extends AbstractAttributeConvertor
{

  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String name = attr.getNodeName();
    String value = attr.getNodeValue();
    JSONObject map = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF);
    if (map.containsKey(name))
    {
      String targetAttr = (String) map.get(name);
      String tableHeight = (String) context.get(ODPConvertConstants.CONTEXT_TABLE_HEIGHT);
      String result;
      if (tableHeight != null)
        result = MeasurementUtil.convertCMToPercentage(tableHeight, value);
      else
        result = MeasurementUtil.convertCMToPercentage(attr, context);
      styleMap.put(targetAttr, result);
    }
  }

}
