/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class DrawTransformParser
{
  private static final String CLASS = DrawTransformParser.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final String CSS_TRANSFORM = "transform:";

  private static final String FIREFOX = "-moz-";

  private static final String IE9_PLUS = "-ms-";

  private static final String SAFARI_CHROME = "-webkit-";

  // private static final String OPERA = "-o-";

  /**
   * Parses the draw:transform and returns the angle of rotation
   * 
   * @param attrVal
   *          draw:transform attribute value
   * @return String the angle of rotation or empty string if none is defined
   * 
   */
  public static String getRotationAngleForShape(String attrVal)
  {
    TransformParser scanner = new TransformParser(attrVal);
    String token = scanner.nextToken();
    while (token.length() > 0)
    {
      if (token.equals(TransformParser.ROTATE))
      {
        String angletoken = scanner.nextToken();
        String angle = convertRadianToDegree(angletoken);
        return angle;
      }
      token = scanner.nextToken();
    }
    return "";
  }

  /**
   * Generates the inline style appropriately to handle rotation, etc.
   * <p>
   * Handles Mozilla (Firefox), IE9+, Webkit (Safari/Chrome), and CSS3
   * 
   * @param angle
   *          angle value
   * @return String CSS inline style string for the angle transform
   * 
   */
  public static String generateTransform(String angle)
  {
    String angleTransform = CSS_TRANSFORM + ODPConvertConstants.SYMBOL_WHITESPACE + TransformParser.ROTATE + "(" + angle + "deg)";
    StringBuilder stylebuf = new StringBuilder(256);
    appendMultiBrowserSupport(angleTransform, stylebuf);
    return stylebuf.toString();
  }

  /**
   * Parses the draw:transform and modifies the inline style appropriately to handle rotation, etc.
   * <p>
   * Handles Mozilla (Firefox), IE9+, Webkit (Safari/Chrome), and CSS3
   * 
   * @param attrVal
   *          draw:transform attribute value
   * @param context
   *          Conversion context
   * @param stylebuf
   *          Attribute buffer to which to append
   * @return void
   * 
   */
  public static void handleTransform(String attrVal, ConversionContext context, StringBuilder stylebuf)
  {
    StringBuilder transform = new StringBuilder(256);

    if (LOG.isLoggable(Level.FINE))
    {
      LOG.fine("Transform Value = " + attrVal);
    }

    TransformParser scanner = new TransformParser(attrVal);
    String token = scanner.nextToken();
    while (token.length() > 0)
    {
      if (token.equals(TransformParser.ROTATE))
      {
        handleRadianAngle(TransformParser.ROTATE, scanner, transform);
      }
      else if (token.equals(TransformParser.SKEWX))
      {
        handleRadianAngle(TransformParser.SKEWX, scanner, transform);
      }
      else if (token.equals(TransformParser.SKEWY))
      {
        handleRadianAngle(TransformParser.SKEWY, scanner, transform);
      }
      else if (token.equals(TransformParser.TRANSLATE))
      {
        token = scanner.nextToken();
        String[] lengths = token.split(ODPConvertConstants.SYMBOL_WHITESPACE);

        double x = Measure.extractNumber(lengths[0]);
        String translateX = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_WIDTH, x, context);
        stylebuf.append(ODPConvertConstants.CSS_ATTR_LEFT + ODPConvertConstants.SYMBOL_COLON + translateX
            + ODPConvertConstants.SYMBOL_SEMICOLON);

        double y = Measure.extractNumber(lengths[1]);
        String translateY = MeasurementUtil.convertCMToPercentage(ODPConvertConstants.SVG_ATTR_HEIGHT, y, context);
        stylebuf.append(ODPConvertConstants.CSS_ATTR_TOP + ODPConvertConstants.SYMBOL_COLON + translateY
            + ODPConvertConstants.SYMBOL_SEMICOLON);
      }
      else if (token.equals(TransformParser.SCALE))
      {
        token = scanner.nextToken();
        String[] lengths = token.split(ODPConvertConstants.SYMBOL_WHITESPACE);

        String value = lengths[0] + ",";
        if (lengths.length > 1)
        {
          value += lengths[1];
        }
        else
        {
          value += lengths[0];
        }
        transform.append(ODPConvertConstants.SYMBOL_WHITESPACE + TransformParser.SCALE + "(" + value + ")");
      }
      token = scanner.nextToken();
    }

    appendMultiBrowserSupport(ODPConvertConstants.CSS_VALUE_TRANSFORM_ORIGIN, stylebuf);
    appendMultiBrowserSupport(CSS_TRANSFORM + transform, stylebuf);

    if (LOG.isLoggable(Level.FINE))
    {
      LOG.fine("Modified Style Buffer for Transform = " + attrVal);
    }
  }

  /**
   * Appends Browser-specific notation for the requested feature
   * <p>
   * Handles Mozilla (Firefox), IE9+, Webkit (Safari/Chrome), and CSS3
   * 
   * @param attr
   *          Requested feature attribute
   * @param stylebuf
   *          Attribute buffer to which to append
   * @return void
   * 
   */
  private static void appendMultiBrowserSupport(String attr, StringBuilder stylebuf)
  {
    attr += ODPConvertConstants.SYMBOL_SEMICOLON;
    stylebuf.append(attr); // CSS3
    stylebuf.append(FIREFOX + attr); // Firefox
    stylebuf.append(IE9_PLUS + attr); // IE 9
    stylebuf.append(SAFARI_CHROME + attr); // Safari and Chrome
    // stylebuf.append(OPERA + attr); // Opera
  }

  /**
   * Parses the Radian Angle from the scanned buffer and appends the angle (in degrees) to the style buffer
   * <p>
   * Handles Mozilla (Firefox), IE9+, Webkit (Safari/Chrome), and CSS3
   * 
   * @param feature
   *          Requested feature attribute
   * @param scanner
   *          Token scanner
   * @param stylebuf
   *          Attribute buffer to which to append
   * @return void
   * 
   */
  private static void handleRadianAngle(String feature, TransformParser scanner, StringBuilder stylebuf)
  {
    String token = scanner.nextToken();
    String angle = convertRadianToDegree(token);
    stylebuf.append(ODPConvertConstants.SYMBOL_WHITESPACE + feature + "(" + angle + "deg)");
  }

  /**
   * Converts the Radian Angle to Degrees
   * <p>
   * 
   * @param radian
   *          Angle in Radians
   * @return String Angle in Degrees
   * 
   */
  private static String convertRadianToDegree(String radian)
  {
    long numericValue = Math.round((-1) * Double.parseDouble(radian) * 180 / Math.PI * 100) / 100;
    return String.valueOf(numericValue);
  }

  static class TransformParser
  {
    public static final String ROTATE = ODPConvertConstants.CSS_ATTR_ROTATE;

    public static final String TRANSLATE = "translate";

    public static final String SCALE = ODPConvertConstants.CSS_ATTR_SCALE;

    public static final String SKEWX = ODPConvertConstants.CSS_ATTR_SKEW_X;

    public static final String SKEWY = ODPConvertConstants.CSS_ATTR_SKEW_Y;

    private static final char LEFT_PAREN = '(';

    private static final char RIGHT_PAREN = ')';

    private String expr;

    private int position;

    public TransformParser(String expr)
    {
      this.expr = expr;
      this.position = 0;
    }

    public String nextToken()
    {
      StringBuilder buffer = new StringBuilder(16);
      for (int x = position; x < expr.length(); position++, x++)
      {
        char ch = expr.charAt(x);
        if ((ch == LEFT_PAREN) || (ch == RIGHT_PAREN))
        {
          position++;
          break;
        }
        else
        {
          buffer.append(ch);
        }
      }
      String token = buffer.toString().trim();
      return (token);
    }
  }
}
