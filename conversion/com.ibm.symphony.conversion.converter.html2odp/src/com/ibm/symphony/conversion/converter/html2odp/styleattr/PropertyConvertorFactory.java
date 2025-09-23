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

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

public class PropertyConvertorFactory
{
  private static final String CLASS = PropertyConvertorFactory.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static PropertyConvertorFactory instance = new PropertyConvertorFactory();

  private static PropertyConvertor GENERAL_CSS_CONVERTOR = new GeneralPropertyConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (16 * 1.33) + 1;

  private static Map<String, PropertyConvertor> convertorMap = new HashMap<String, PropertyConvertor>(CONVERTOR_MAP_CAPACITY);
  static
  {
    // Add Convertors here - If adding, please update the initial capacity
    convertorMap.put(ODPConvertConstants.CSS_FONT_FAMILY, new FontFamilyConvertor());
    convertorMap.put(ODPConvertConstants.CSS_TEXT_DECORATION, new TextDecorationConvertor());
    convertorMap.put(ODPConvertConstants.CSS_ABS_FONT_SIZE, new FontSizeConvertor());
    convertorMap.put(ODPConvertConstants.CSS_FONT_STYLE, new FontStyleConvertor());
    convertorMap.put(ODPConvertConstants.CSS_FONT_WEIGHT, new FontWeightConvertor());
    convertorMap.put(ODPConvertConstants.CSS_ROW_HEIGHT, new TableRowHeightConvertor());
    convertorMap.put(ODPConvertConstants.CSS_TEXT_ALIGN, new AlignmentConvertor());
    convertorMap.put(ODPConvertConstants.CSS_VERTICAL_ALIGN, new VerticalAlignConvertor());
    convertorMap.put(ODPConvertConstants.CSS_COL_WIDTH, new ColumnWidthConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, new DrawFillConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BORDER, new BorderConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BORDER_RIGHT, new BorderConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BORDER_LEFT, new BorderConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BORDER_TOP, new BorderConvertor());
    convertorMap.put(ODPConvertConstants.CSS_BORDER_BOTTOM, new BorderConvertor());
    convertorMap.put(ODPConvertConstants.CSS_LINE_HEIGHT, new LineHeightConvertor());

    // convertorMap.put(ODPConvertConstants.CSS_FONT_COLOR, GENERAL_CSS_CONVERTOR);
    // convertorMap.put(ODPConvertConstants.CSS_TEXT_SHADOW, GENERAL_CSS_CONVERTOR);
    // convertorMap.put(ODPConvertConstants.CSS_FONT_VARIANT, GENERAL_CSS_CONVERTOR);
    // convertorMap.put(ODPConvertConstants.CSS_TEXT_TRANSFORM, GENERAL_CSS_CONVERTOR);
    // convertorMap.put(ODPConvertConstants.CSS_FONT_NAME, new FontNameConvertor());
  }

  public static PropertyConvertorFactory getInstance()
  {
    return instance;
  }

  public PropertyConvertor getConvertor(String htmlCSSProperty)
  {
    PropertyConvertor convertor = convertorMap.get(htmlCSSProperty);
    if (convertor == null)
    {
      convertor = GENERAL_CSS_CONVERTOR;
      if (log.isLoggable(Level.FINE))
      {
        log.fine("No specific convertor defined for " + htmlCSSProperty + ", defaulting to " + GENERAL_CSS_CONVERTOR.getClass().getName());
      }
    }
    return convertor;
  }
}
