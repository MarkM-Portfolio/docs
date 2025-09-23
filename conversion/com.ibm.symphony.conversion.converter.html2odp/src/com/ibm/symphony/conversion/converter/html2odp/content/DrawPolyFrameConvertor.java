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
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_RANGE_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawPolyFrameConvertor extends DrawFrameConvertor
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
    Map<String, String> copyPreserve = getCopyPreserveAttribute(context);

    if (copiedElement)
    { // Not an existing element, so set styles appropriately
      setCopiedAttrs(context, element);
      
      String height = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_HEIGHT);
      if (height != null && height.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_HEIGHT), ODPConvertConstants.ODF_ATTR_SVG_HEIGHT,
            height);
      }

      String width = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_WIDTH);
      if (width != null && width.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_WIDTH), ODPConvertConstants.ODF_ATTR_SVG_WIDTH,
            width);
      }

      String points = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_DRAW_POINTS);
      if (points != null && points.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_DRAW_POINTS), ODPConvertConstants.ODF_ATTR_DRAW_POINTS,
            points);
      }

      String x = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_X);
      if (x != null && x.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_X), ODPConvertConstants.ODF_ATTR_SVG_X,
            x);
      }

      String y = (String) copyPreserve.get(ODPConvertConstants.HTML_ATTR_SVG_Y);
      if (y != null && y.length() > 0)
      {
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(ODPConvertConstants.ODF_ATTR_SVG_Y), ODPConvertConstants.ODF_ATTR_SVG_Y,
            y);
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

}
