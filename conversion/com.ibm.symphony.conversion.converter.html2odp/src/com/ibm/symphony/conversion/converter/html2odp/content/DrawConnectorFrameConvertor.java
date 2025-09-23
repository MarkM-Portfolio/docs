/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.model.Division;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_POINT_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_RANGE_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class DrawConnectorFrameConvertor extends DrawFrameConvertor
{
  /**
   * draw: connector and line use the attributes: svg:x1, svg:y1 and svg:x2, svg y2 instead of svg:x, svg:y, svg:height, svg:width.
   */
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // Call the base class to do the convert.
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, true);
    super.doContentConvert(context, htmlNode, odfParent);
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
  }

  @SuppressWarnings({ "restriction", "unchecked" })
  protected Division convertLocationStyles(String styleValue, OdfElement element, ConversionContext context)
  {
    Map<String, String> styles = (Map<String, String>) context.get("inline-styles-map");

    Division division = new Division();
    String position = styles.get("position");

    String visibility = styles.get("visible");

    if ("hidden".equals(visibility))
    {
      return null;
    }

    division.setPositionType(position);
    for (LOCATION_RANGE_TYPE typeName : LOCATION_RANGE_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        // contains the location type.
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        division.setValue(attributeValue, typeName.toString());
      }
    }

    // Check to see if we are working with a new or existing element.
    // If it is a new element (copied from existing) we need to know if it is a
    // horizontal or vertical line and the direction of the original to draw correctly.
    boolean copiedElement = isCopiedElement(context);
    boolean horizontal = false;
    boolean vertical = false;
    boolean lToR = false; // Orientation of line or connector (left to right)
    boolean tToB = false; // Orientation of line or connector (top to bottom)
    Map<String, String> copyPreserve = getCopyPreserveAttribute(context);
    if (copyPreserve != null)
    {
      String x1 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_X1);
      double dX1 = Measure.extractNumber(x1);
      String x2 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_X2);
      double dX2 = Measure.extractNumber(x2);
      String y1 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_Y1);
      double dY1 = Measure.extractNumber(y1);
      String y2 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_Y2);
      double dY2 = Measure.extractNumber(y2);
      if (x1.equals(x2))
        vertical = true;
      else if (y1.equals(y2))
        horizontal = true;
      if (dX2 > dX1)
        lToR = true;
      if (dY2 > dY1)
        tToB = true;
    }

    String x1 = "";
    String x2;
    String y1 = "";
    String y2;
    for (LOCATION_POINT_TYPE typeName : LOCATION_POINT_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        if (typeName.relateWithWidth())
        {
          if (lToR)
          {
            MetricsUnit x1Value = new MetricsUnit(attributeValue);
            if (vertical)
              // Take half of the width so that line or connector is positioned properly
              x2 = x1 = (.5 * division.getWidth().getRealValue() + x1Value.getRealValue()) + x1Value.getTypeString();
            else
            {
              x1 = attributeValue;
              x2 = (division.getWidth().getRealValue() + x1Value.getRealValue()) + x1Value.getTypeString();
            }
          }
          else
          {
            MetricsUnit x2Value = new MetricsUnit(attributeValue);
            if (vertical)
              // Take half of the width so that line or connector is positioned properly
              x1 = x2 = (.5 * division.getWidth().getRealValue() + x2Value.getRealValue()) + x2Value.getTypeString();
            else
            {
              x2 = attributeValue;
              x1 = (division.getWidth().getRealValue() + x2Value.getRealValue()) + x2Value.getTypeString();
            }
          }
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri("svg:x1"), "svg:x1", x1);
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri("svg:x2"), "svg:x2", x2);
        }
        else
        {
          // related with height.
          if (tToB)
          {
            MetricsUnit y1Value = new MetricsUnit(attributeValue);
            if (horizontal)
              // Take half of the height so that line or connector is positioned properly
              y2 = y1 = (.5 * division.getHeight().getRealValue() + y1Value.getRealValue()) + y1Value.getTypeString();
            else
            {
              y1 = attributeValue;
              y2 = (division.getHeight().getRealValue() + y1Value.getRealValue()) + y1Value.getTypeString();
            }
          }
          else
          {
            MetricsUnit y2Value = new MetricsUnit(attributeValue);
            if (horizontal)
              // Take half of the height so that line or connector is positioned properly
              y1 = y2 = (.5 * division.getHeight().getRealValue() + y2Value.getRealValue()) + y2Value.getTypeString();
            else
            {
              y2 = attributeValue;
              y1 = (division.getHeight().getRealValue() + y2Value.getRealValue()) + y2Value.getTypeString();
            }
          }
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri("svg:y1"), "svg:y1", y1);
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri("svg:y2"), "svg:y2", y2);
        }
      }
    }
    if (copiedElement)
    { // Not an existing element, so set styles appropriately
      if (copyPreserve == null)
        return division;  // Should not happen with a new element

      String d = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_D);
      if (d != null && d.length() > 0)
      {
        d = updatePathStartLocation(d, x1, y1);
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_D), ODPConvertConstants.ODF_ATTR_SVG_D,
            d);
      }

      setCopiedAttrs(context, element);      
    }

    return division;
  }

  /**
   * return true because lines and connectors are modifable
   */
  protected boolean isModifiableShape()
  {
    return true;
  }

  /**
   * 
   * @param path to be modified
   * @param new x start position
   * @param new y start position
   * @return modified path
   */
  private String updatePathStartLocation(String d, String x1, String y1)
  {
    String path = d;
    StringBuilder sb = new StringBuilder(d.length() + 5);
    for (int i = 0; i < path.length(); i++)
    {
      Character ch = path.charAt(i);
      if (Character.isLetter(ch))
        sb.append(ODFConstants.SYMBOL_WHITESPACE + ch + ODFConstants.SYMBOL_WHITESPACE );
      else if (ch.equals(','))
        sb.append(ODFConstants.SYMBOL_WHITESPACE);  // remove comma
      else if (ch.equals('-'))
        sb.append(ODFConstants.SYMBOL_WHITESPACE + '-');  // prepend dash with space
      else
        sb.append(ch);
    }
    path = sb.toString().trim();
    String pathArray[] = path.split("\\s+"); // Split on one or more whitespace
    // If the path does not begin with a move, just return original path
    if (!(pathArray[0].equals("m") || pathArray[0].equals("M")))
      return d;
    double dX1 = Measure.extractNumber(x1) * 1000;
    double dY1 = Measure.extractNumber(y1) * 1000;
    // Set the original start location
    pathArray[1] = MeasurementUtil.formatDecimal(dX1, 0);
    pathArray[2] = MeasurementUtil.formatDecimal(dY1, 0);
    // Rebuild the path string
    StringBuilder newPath = new StringBuilder();
    for (int i = 0; i < pathArray.length; i++)
      newPath.append(pathArray[i] + ODFConstants.SYMBOL_WHITESPACE);
    return newPath.toString();
  }
}
