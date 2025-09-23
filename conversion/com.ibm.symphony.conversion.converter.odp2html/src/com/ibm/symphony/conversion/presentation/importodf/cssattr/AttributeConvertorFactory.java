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

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;

public class AttributeConvertorFactory implements IConvertorFactory
{
  private static final String CLASS = AttributeConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static AttributeConvertorFactory instance = new AttributeConvertorFactory();

  private static IConvertor GERERAL_ATTR_CONVERTOR = new GeneralAttributeConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (75 * 1.33) + 1;

  private static Map<String, IConvertor> convertorMap;
  static
  {
    convertorMap = new HashMap<String, IConvertor>(CONVERTOR_MAP_CAPACITY);

    // Add Convertors here - If adding, please update the initial capacity

    // graphical attribute convertor.
    convertorMap.put(ODPConvertConstants.ODF_ATTR_DRAW_FILL, new DrawFillAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR, new DrawFillColorAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_BULLET_STYLE, new TextListLevelAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_IMAGE_STYLE, new TextListLevelAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_TEXTLIST_NUMBER_STYLE, new TextListLevelAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_BORDER_LEFT, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_BORDER_RIGHT, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_BORDER_TOP, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_BORDER_BOTTOM, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_BORDER, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_BORDER_LINE_WIDTH_LEFT, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_BORDER_LINE_WIDTH_RIGHT, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_BORDER_LINE_WIDTH_TOP, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_BORDER_LINE_WIDTH_BOTTOM, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_BORDER_LINE_WIDTH, new BorderAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_COLUMN_WIDTH, new TableColumWidthConverter());
    convertorMap.put(ODPConvertConstants.ODF_STYLE_ROW_HEIGHT, new TableRowHeightConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_DRAW_STROKE, new DrawStrokeAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_SVG_STROKE_COLOR, new DrawStrokeColorAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_POSITION, new TextSuperSubscriptAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_LINE_HEIGHT, new LineHeightAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_TEXT_SHADOW, new TextShadowAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_MARGIN_LEFT, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_MARGIN_RIGHT, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_MARGIN_TOP, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_MARGIN_BOTTOM, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_MARGIN, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_PADDING_LEFT, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_PADDING_RIGHT, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_PADDING_TOP, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_PADDING_BOTTOM, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_PADDING, new MarginPaddingAttributeConverter());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_UNDERLINE_STYLE, new UnderlineLineStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_OVERLINE_STYLE, new OverlineLineStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_STRIKETHROUGH_STYLE, new StrikethroughLineStyleConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_SMIL_TYPE, new TransitionAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_SMIL_SUBTYPE, new TransitionAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_SMIL_DIRECTION, new TransitionAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_TRANSITION_SPEED, new TransitionAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_SMIL_FADECOLOR, new TransitionAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_TRANSITION_DURATION, new TransitionAttributeConvertor());
    
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_NAME, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_STYLE_FAMILY, new NonNumericAttributeConvertor());
    convertorMap.put("style:display-name", new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_COUNTRY, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_LANGUAGE, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_COUNTRY_ASIAN, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_LANGUAGE_ASIAN, new NonNumericAttributeConvertor());
    convertorMap.put("style:country-complex", new NonNumericAttributeConvertor());
    convertorMap.put("style:language-complex", new NonNumericAttributeConvertor());
    convertorMap.put("fo:font-weight", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-weight-asian", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-weight-complex", new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_FO_FONT_STYLE, new NonNumericAttributeConvertor());
    convertorMap.put("style:font-style-asian", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-style-complex", new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN, new NonNumericAttributeConvertor());
    convertorMap.put(ODPConvertConstants.ODF_ATTR_DRAW_TEXTAREA_VERTICAL_ALIGN, new NonNumericAttributeConvertor());
    convertorMap.put("draw:auto-grow-height", new NonNumericAttributeConvertor());
    convertorMap.put("style:punctuation-wrap", new NonNumericAttributeConvertor());
    convertorMap.put("style:writing-mode", new NonNumericAttributeConvertor());
    convertorMap.put("fo:hyphenate", new NonNumericAttributeConvertor());
    convertorMap.put("draw:shadow", new NonNumericAttributeConvertor());
    convertorMap.put("draw:shadow-color", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-family-generic", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-family-generic-asian", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-family-generic-complex", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-family-asian", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-family-complex", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-pitch", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-pitch-asian", new NonNumericAttributeConvertor());
    convertorMap.put("style:font-pitch-complex", new NonNumericAttributeConvertor());
    convertorMap.put("style:line-break", new NonNumericAttributeConvertor());
    convertorMap.put("draw:stroke-linejoin", new NonNumericAttributeConvertor());
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  @SuppressWarnings("restriction")
  public IConvertor getConvertor(Object input)
  {
    OdfAttribute attribute = (OdfAttribute) input;
    // first get the converter that for special element.

    String nodeName = attribute.getOwnerElement().getNodeName();
    IConvertor convertor = convertorMap.get(nodeName);
    // then get the converter for special attribute.
    if (convertor == null)
    {
      nodeName = attribute.getNodeName();
      convertor = convertorMap.get(nodeName);
    }
    if (convertor == null)
    {
      convertor = GERERAL_ATTR_CONVERTOR;

      if (ODPConvertConstants.DEBUG)
      {
        log.info("No specific convertor defined for " + nodeName + ", defaulting to " + GERERAL_ATTR_CONVERTOR.getClass().getName());
      }
    }
    return convertor;
  }

}
