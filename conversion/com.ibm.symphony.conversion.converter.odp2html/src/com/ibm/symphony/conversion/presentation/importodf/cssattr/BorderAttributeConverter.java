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

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class BorderAttributeConverter extends AbstractAttributeConvertor
{

  private static final String CM_MEASUREMENT = "cm";

  private static final String PT_MEASUREMENT = "pt";

  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String name = attr.getNodeName();
    String value = attr.getNodeValue();
    if (ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).containsKey(name))
    {
      String targetAttr = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(name);
      String[] array = value.split(" ");
      StringBuilder valueBuf = new StringBuilder(16);

      if (name.startsWith("fo")) // fo:border, fo:border-left, fo:border-right, fo:border-top, fo:border-bottom
      {
        for (String arrElement : array)
        {
          if (arrElement.endsWith(CM_MEASUREMENT))
          {
            // Convert borders represented in CM to PT
            Measure measure = Measure.parseNumber(arrElement);
            measure.convertCMToPTForBorders();

            // There is a bug in Safari where if the border is less then 1 pixel,
            // the border will not be shown. The other browsers move the value
            // to 1 if less then one so will just do this for all here.
            double borderWidthCheck = measure.getNumber();

            // We want to only convert the value that are between 0 and 1.
            // For borders there could also be valid values of 0 and negative
            // which we do not want to change.
            String borderWidth = "";
            if (borderWidthCheck < 1 && borderWidthCheck > 0)
            {
              borderWidth = MeasurementUtil.formatDecimal(Math.ceil(borderWidthCheck)) + PT_MEASUREMENT;
            }
            else
            {
              borderWidth = MeasurementUtil.formatDecimal(measure.getNumber()) + PT_MEASUREMENT;
            }

            // Why is this being done?
            if (arrElement.equals("0.022cm"))
              borderWidth = "1.6pt";
            valueBuf.append(borderWidth).append(" ");
          }
          else
            valueBuf.append(arrElement).append(" ");
        }
        if (!value.equals("none"))
        {
          if(array.length < 3 && valueBuf.indexOf("#")<0)
            valueBuf.append("#000000").append(" ");

          // Set "!important" for borders that are not "none" when we're processing content.xml.
          // We don't want to set !important at all when we're doing table:template processing in styles.xml
          ODPConvertConstants.DOCUMENT_TYPE documentType = (ODPConvertConstants.DOCUMENT_TYPE) context
              .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
          if (documentType == ODPConvertConstants.DOCUMENT_TYPE.CONTENT)
            valueBuf.append("!important");
        }
      }
      else
      // style:border-line-width, style:border-line-width-left, style:border-line-width-right, style:border-line-width-top,
      // style:border-line-width-bottom
      {
        // The value of the style:border-line-width attribute is a list of three white space-separated
        // lengths, as follows:
        // - The first value specifies the width of the inner line
        // - The second value specifies the distance between the two lines
        // - The third value specifies the width of the outer line
        // Since CSS doesn't allow specification of a distance between the inner and outer lines, we
        // will use the combined width to be the total width of our line. We will attempt to
        // update any existing "border" property. If a matching border property is not
        // found, we will add the mapped attribute with the total value.
        double totalBorderWidth = 0.0;

        for (int i = 0; i < array.length; ++i)
        {
          if (array[i].endsWith(CM_MEASUREMENT))
          {
            // Extract the number
            double borderValue_d = Measure.extractNumber(array[i]);

            totalBorderWidth += borderValue_d;
          }
        }
        if (totalBorderWidth > 0)
        {
          Measure measure = new Measure(totalBorderWidth, Measure.CENTIMETER);
          measure.convertCMToPTForBorders();

          double newBorderWidth = measure.getNumber();

          String[] existingBorder = getExistingBorder(targetAttr, styleMap);
          if (existingBorder != null)
          {
            // Update the existing border attribute if the new value is larger than the existing one
            // If the value is the same or is less, no updates will be performed.
            String[] values = existingBorder[1].split("\\s+"); // Split by white space
            Measure existingMeasure = Measure.parseNumber(values[0]);

            if (newBorderWidth > existingMeasure.getNumber())
            {
              String borderWidth = MeasurementUtil.formatDecimal(newBorderWidth) + PT_MEASUREMENT;
              valueBuf.append(borderWidth).append(" "); // Add the updated width
              for (int i = 1; i < values.length; ++i) // Add back the remaining values
              {
                valueBuf.append(values[i]).append(" ");
              }
              // Update the existing attribute name
              targetAttr = existingBorder[0];
            }

          }
          else
          // Add the new border attribute
          {
            // There is a bug in Safari where if the border is less then 1 pixel,
            // the border will not be shown. The other browsers move the value
            // to 1 if less then one so will just do this for all here.

            // We want to only convert the value that are between 0 and 1.
            // For borders there could also be valid values of 0 and negative
            // which we do not want to change.
            String borderWidth = "";
            if (newBorderWidth < 1 && newBorderWidth > 0)
            {
              borderWidth = MeasurementUtil.formatDecimal(Math.ceil(newBorderWidth)) + PT_MEASUREMENT;
            }
            else
            {
              borderWidth = MeasurementUtil.formatDecimal(measure.getNumber()) + PT_MEASUREMENT;
            }
            valueBuf.append(borderWidth);
          }
        }
      }

      if (valueBuf.length() > 0)
        styleMap.put(targetAttr, valueBuf.toString().trim());
    }
  }

  /**
   * Attempt to get the existing border attribute. Note: we will only look for an existing attribute with the same level of precision. For
   * example, if targetAttr is border-left-width, we will look for border-left, or if targetAttr is border-width, we will look for border
   * 
   * @param targetAttr
   *          - the border attribute being added
   * @param styleMap
   *          - the current styleMap for the style being processed
   * @return String[] containing the existing attr [0], and the existing value [1]. null if not found.
   */
  private String[] getExistingBorder(String targetAttr, Map<String, String> styleMap)
  {
    String[] existingBorder = null;
    String existingAttr = targetAttr.substring(0, targetAttr.indexOf("-width"));
    String existingValue = styleMap.get(existingAttr);
    if (existingValue != null)
    {
      existingBorder = new String[2];
      existingBorder[0] = existingAttr;
      existingBorder[1] = existingValue;
    }

    return existingBorder;
  }
}
