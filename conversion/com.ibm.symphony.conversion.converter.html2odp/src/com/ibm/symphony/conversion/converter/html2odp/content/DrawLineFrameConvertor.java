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
import com.ibm.symphony.conversion.service.common.util.Measure;

public class DrawLineFrameConvertor extends DrawFrameConvertor
{
  private final double ONE_HUNDRETH = .01;
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

    Map<String, String> copyPreserve = null;
    if (copiedElement)
      copyPreserve = getCopyPreserveAttribute(context);
    String x1, x2, y1, y2;

    if (copyPreserve != null)
    {
      x1 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_X1);
      x2 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_X2);
      y1 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_Y1);
      y2 = copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_Y2);
    }
    else
    {
      x1 = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_X1);
      x2 = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_X2);
      y1 = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_Y1);
      y2 = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_Y2);
    }

    // Verify that we have valid x1, y1 and x2, y2
    if (x1 != null && x1.length() > 0 && x2 != null && x2.length() > 0 && y1 != null && y1.length() > 0 && y2 != null && y2.length() > 0)
    {
      double dX1 = Measure.extractNumber(x1);
      double dX2 = Measure.extractNumber(x2);
      double dY1 = Measure.extractNumber(y1);
      double dY2 = Measure.extractNumber(y2);
      // NOTE: If the lines are "almost" horizontal or "almost" vertical we treat them as such. 
      // By almost here, if the difference is less than 1/100 of a CM. Our logic differs when handling horizontal and vertical lines
      // and not treating these almost veritical and horizontal lines as such caused them to skew to the edges of the viewbox.
      if (x1.equals(x2))
        vertical = true;
      else if (Math.abs(dX1 - dX2) <= ONE_HUNDRETH)
      {
        dX2 = dX1;
        x2 = x1;
        vertical = true;
      }
      else if (y1.equals(y2))
        horizontal = true;
      else if (Math.abs(dY1 - dY2) <= ONE_HUNDRETH)
      {
        dY2 = dY1;
        y2 = y1;
        horizontal = true;
      }
      if (dX2 > dX1)
        lToR = true;
      if (dY2 > dY1)
        tToB = true;
    }

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
}
