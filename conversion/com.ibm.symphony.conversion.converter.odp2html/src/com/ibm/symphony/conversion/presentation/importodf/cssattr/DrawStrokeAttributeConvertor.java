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
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;

/**
 * Map the supported graphic attributes for a draw:stroke to a border.
 * 
 * "draw:stroke":"border-style", (if solid) "draw:stroke-dash":"border-style" (if dash or dot or combination thereof)
 * "svg:stroke-width":"border-width", "svg:stroke-color":"border-color"
 * 
 */
public class DrawStrokeAttributeConvertor extends AbstractAttributeConvertor
{

  Logger log = Logger.getLogger(DrawStrokeAttributeConvertor.class.getName());

  public static String CLASS = DrawStrokeAttributeConvertor.class.toString();

  private static String MIN_BORDER_WIDTH = "0.025em";

  static enum DRAW_STROKE_VALUE {
    DASH, NONE, SOLID;
    public static DRAW_STROKE_VALUE toEnum(String str)
    {
      try
      {
        return valueOf(str);
      }
      catch (Exception ex)
      {
        return NONE;
      }
    }
  };

  @SuppressWarnings("restriction")
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrValue = attr.getNodeValue();
    OdfElement element = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);

    String familyValue = CSSConvertUtil.getStyleFamily(element, false);

    // Skip the draw:stroke if it is within a graphic
    boolean insideShape = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);

    if (insideShape && ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(familyValue))
    {
      return;
    }

    switch (DRAW_STROKE_VALUE.valueOf(odfAttrValue.toUpperCase()))
      {
        case DASH : // Partial supported in current release. All dash and dot variants treated the same
          String strokeDashValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_STROKE_DASH);
          String borderStyle = ODPConvertConstants.BORDER_DASHED; // Default to dashed style
          // Note: this is a short term check. Eventually need more detailed checks to determine
          // dashes vs dots because PPT documents don't use the "Dot" in the name....
          if (strokeDashValue != null && strokeDashValue.contains(ODPConvertConstants.STROKE_DOT))
            borderStyle = ODPConvertConstants.BORDER_DOTTED;
          styleMap.put(HtmlCSSConstants.BORDER_STYLE, borderStyle);

          String dashColorValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_STROKE_COLOR);
          setStyleMapIfValueSet(HtmlCSSConstants.BORDER_COLOR, dashColorValue, styleMap);

          String dashWidthValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_STROKE_WIDTH);
          if (dashWidthValue != null)
          {
            Measure measure = Measure.parseNumber(dashWidthValue);
            if (measure != null && (measure.isCMMeasure() || measure.isINMeasure()))
            {
              double d_width = measure.getNumber();
              if (d_width == 0)
                dashWidthValue = MIN_BORDER_WIDTH;
              else
                dashWidthValue = measure.convertAsStringCMToEM();
            }
            setStyleMapIfValueSet(HtmlCSSConstants.BORDER_WIDTH, dashWidthValue, styleMap);
          }
          break;
        case SOLID :
          styleMap.put(HtmlCSSConstants.BORDER_STYLE, odfAttrValue);
          String solidColorValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_STROKE_COLOR);
          setStyleMapIfValueSet(HtmlCSSConstants.BORDER_COLOR, solidColorValue, styleMap);

          String solidWidthValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_SVG_STROKE_WIDTH);
          if (solidWidthValue != null)
          {
            Measure measure = Measure.parseNumber(solidWidthValue);
            if (measure != null && (measure.isCMMeasure() || measure.isINMeasure()))
            {
              double d_width = measure.getNumber();
              if (d_width == 0)
                solidWidthValue = MIN_BORDER_WIDTH;
              else
                solidWidthValue = measure.convertAsStringCMToEM();
            }
            setStyleMapIfValueSet(HtmlCSSConstants.BORDER_WIDTH, solidWidthValue, styleMap);
          }
          break;
        case NONE :
          styleMap.put(HtmlCSSConstants.BORDER_STYLE, ODPConvertConstants.HTML_VALUE_NONE);
        default:
          break;
      }
  }

  /**
   * Sets the value in the Style Map if the value is not null and not an empty string
   * <p>
   * 
   * @param key
   *          Key of the value
   * @param value
   *          Value to set in Style Map
   * @param styleMap
   *          Style Map
   * @return void
   * 
   */
  private void setStyleMapIfValueSet(String key, String value, Map<String, String> styleMap)
  {
    if ((value != null) && (value.length() > 0))
    {
      styleMap.put(key, value);
    }
  }
}
