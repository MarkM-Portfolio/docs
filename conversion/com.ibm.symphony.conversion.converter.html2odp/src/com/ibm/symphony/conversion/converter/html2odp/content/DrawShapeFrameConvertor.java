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

import java.util.HashMap;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.model.Division;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.IMetricsRelation;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_POINT_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit.LOCATION_RANGE_TYPE;
import com.ibm.symphony.conversion.converter.html2odp.shape.SvgShapeConvertor;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ZIndexUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class DrawShapeFrameConvertor extends DrawFrameConvertor
{
  private static final String CLASS = DrawShapeFrameConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement odfParent)
  {
    String drawType = SvgShapeConvertor.getDrawType(htmlElement);

    // If the Draw Type is defined, perform the Shape Export in this class; otherwise, for Shapes as Images, this processing will be done in
    // the parent class via super.doContentConvert. This is because the relative position might be changed when import to concord.

    if (drawType != null)
    {
      OdfElement dcsElement = null;
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SVGSHAPE, true);
      Object originalParentWidth = (Object) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);

      // Decide whether to create or update an odfElement
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      if (indexTable.isHtmlNodeIndexed(htmlElement))
      {
        dcsElement = indexTable.getFirstOdfNode(htmlElement);

        // Update the IBM Docs SVG Shape
        SvgShapeConvertor.updateShapeFromSvg(context, htmlElement, dcsElement, drawType);

        // Update the placement for the draw:frame based on the z-index
        ZIndexUtil.updateOrder(context, htmlElement, dcsElement, odfParent);
      }
      else
      {
        // Convert the IBM Docs SVG Shape to an new ODF Shape
        dcsElement = SvgShapeConvertor.createShapeFromSvg(context, htmlElement, odfParent, drawType);

        // Insert the new draw:frame based on the z-index
        ZIndexUtil.appendInOrder(context, htmlElement, dcsElement, odfParent);
      }

      // Parse the HTML attributes to update the Style information in the ODF Element. This method indirectly will call back to
      // convertLocationStyles(), which is overridden in this class to make adjustments to the ODF shape based on information in the style
      // and the just processed Shape template.
      convertLocationStylesForSvg(htmlElement, dcsElement, context);

      // Set draw frame width for children and Convert the Children
      setParentFontSizeContext(context, htmlElement, dcsElement);
      setParentWidth(context, dcsElement);
      this.convertChildren(context, htmlElement, dcsElement);

      context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, originalParentWidth);
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SVGSHAPE, false);
    }
    else
    {
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, true);

      super.doContentConvert(context, htmlElement, odfParent);

      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
    }
  }

  protected boolean isModifiableShape()
  {
    return true;
  }

  @SuppressWarnings("restriction")
  protected void convertLocationStylesForSvg(Element htmlElement, OdfElement element, ConversionContext context)
  {
    String style = htmlElement.getAttribute(ODPConvertConstants.HTML_STYLE_TAG);
    Map<String, String> styles = buildStringStringMap(style, false, true);

    for (LOCATION_RANGE_TYPE typeName : LOCATION_RANGE_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        // contains the location type.
        String qName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML).get(typeName.toString());
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        String currentValue = element.getAttribute(qName);

        // Update the height or width if it has changed
        if (currentValue == null || currentValue.length() == 0 || MeasurementUtil.compare(currentValue, attributeValue) != 0)
        {
          element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attributeValue);
        }
      }
    }

    for (LOCATION_POINT_TYPE typeName : LOCATION_POINT_TYPE.values())
    {
      String valueStr = styles.get(typeName.toString());
      if (valueStr != null)
      {
        String qName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_HTML).get(typeName.toString());
        String attributeValue = convertMetricsValues(valueStr, context, typeName);
        element.setAttributeNS(ContentConvertUtil.getNamespaceUri(qName), qName, attributeValue);
      }
    }

    SvgShapeConvertor.makeStyleAdjustments(context, element);
  }

  protected String convertMetricsValues(String valueStr, ConversionContext context, IMetricsRelation relation)
  {
    MetricsUnit value = new MetricsUnit(valueStr);
    double cmValue = 0.0;
    switch (value.getType())
      {
        case PERCENTAGE :
          Division size = (Division) context.get(ODPConvertConstants.CONTEXT_CURRENT_SIZE);
          double pValue = 0.0;
          pValue = relation.relateWithWidth() ? size.getWidth().getRealValue() : size.getHeight().getRealValue();

          cmValue = pValue * value.getRealValue();
          break;
        case PX :
          cmValue = value.getRealValue() * ODPConvertConstants.CM_TO_INCH_CONV / 96;
          break;
        case CM :
        default:
          cmValue = value.getRealValue();
          break;
      }
    String attributeValue = MeasurementUtil.formatDecimal(cmValue) + "cm";

    return attributeValue;
  }

  private static Map<String, String> buildStringStringMap(String attr, boolean preserveCase, boolean removeWhiteSpace)
  {
    if (removeWhiteSpace)
      attr = attr.replaceAll("\\s", "");
    if (!preserveCase)
      attr = attr.toLowerCase();
    StringTokenizer tokenizer = new StringTokenizer(attr, ODPConvertConstants.SYMBOL_SEMICOLON);

    Map<String, String> stringStringMap = new HashMap<String, String>();

    while (tokenizer.hasMoreTokens())
    {
      String next = tokenizer.nextToken();
      int delim = next.indexOf(ODPConvertConstants.SYMBOL_COLON);
      if (delim > 0)
      {
        stringStringMap.put(next.substring(0, delim), next.substring(delim + 1));
      }
    }
    return stringStringMap;
  }
}
