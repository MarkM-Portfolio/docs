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
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.attribute.fo.FoColorAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoTextAlignAttribute;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class TextListLevelAttributeConvertor extends AbstractAttributeConvertor
{

  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String value = attr.getNodeValue();
    String jsonValue = null;

    OdfElement element = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);

    if ("standard".equals(((OdfElement) element.getParentNode()).getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME))
        && "draw:fill-color".equals(attr.getNodeName()))
    {
      return;
    }

    if (ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).containsKey(attr.getNodeName()))
    {
      jsonValue = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(attr.getNodeName());

      Measure measure = Measure.parseNumber(value);
      if (measure.isPTMeasure() || measure.isCMMeasure())
      {
        value = MeasurementUtil.convertCMToPercentage(attr, context);

      }
      else if (attr instanceof FoColorAttribute)
      {
        value = null;
      }
      else if (attr instanceof FoTextAlignAttribute)
      {
        value = null;
      }
      else
      {

      }
      if (value != null)
      {
        if ("line-height".equals(jsonValue) && value.endsWith("%"))
        {
          // change the line-height value from % to nothing.
          value = String.valueOf(Double.parseDouble(value.substring(0, value.length() - 1)) / 100);
        }
        styleMap.put(jsonValue, value);
      }
    }
  }

}
