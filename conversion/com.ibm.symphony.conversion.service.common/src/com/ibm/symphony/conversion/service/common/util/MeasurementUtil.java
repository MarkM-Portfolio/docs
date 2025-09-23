/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.service.common.util;

import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class MeasurementUtil
{
  private static final String CLASS = MeasurementUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  public static String convertCMToPercentage(Node node, ConversionContext context)
  {
    String attrName = node.getNodeName();
    String attrValue = node.getNodeValue();
    String resultValue = null;

    Measure pageHeight = getHeight(context, attrName);
    Measure pageWidth = getWidth(context, attrName);

    if (!"fo:clip".equals(attrName))
    {
      double index = 0;
      // note that top/bottom percentages are calculated from the WIDTH of the containing element (not the height as you might assume)
      if (attrName.indexOf("svg:y") != -1 || attrName.indexOf(ODFConstants.SVG_ATTR_HEIGHT) != -1 || attrName.indexOf("font-size") != -1)
      {
        index = pageHeight.getNumber(); // page-height
      }
      else
      {
        index = pageWidth.getNumber(); // page-width
      }

      try
      {
        double num = 0;

        if (attrValue != null && attrValue.trim().length() > 0)
        {
          String[] valueList = attrValue.split("\\s+"); // Split by whitespace
          StringBuilder resultBuf = new StringBuilder(16);

          // Some attribute values (such as margin or padding) can have multiple values, so each value
          // must be converted to a percent or em.
          for (String value : valueList)
          {
            Measure measure = Measure.parseNumber(value);
            if (measure != null)
            {
              num = measure.getNumber();
              if (index > 0.0)
              {
                if (measure.isCMMeasure())
                {
                  resultBuf.append(String.valueOf(formatDecimal((num * 100) / index)));
                  resultBuf.append("% ");
                }
                else if (measure.isINMeasure())
                {
                  resultBuf.append(String.valueOf(formatDecimal((num * 100) * Measure.IN_CM_CONVERSION / index)));
                  resultBuf.append("% ");
                }
                else if (measure.isPTMeasure())
                {
                  double parentSize = (Double) context.get(ODFConstants.CONTEXT_PARENT_SIZE);

                  parentSize = parentSize == 0.0 ? 18 : parentSize;

                  resultBuf.append(String.valueOf(formatDecimal(num / parentSize)));
                  resultBuf.append("em ");
                }
                else if (measure.isPercentMeasure()) // Already a % - copy as is
                {
                  resultBuf.append(value);
                  resultBuf.append(" ");
                }
              }
              else{
                resultBuf.append("0% ");                
              }
            }
          }
          resultValue = resultBuf.toString().trim(); // Set the result after trimming the unused last space
        }
      }
      catch (Exception e)
      {
        LOG.logp(Level.WARNING, CLASS, "convertCMToPercentage", e.getLocalizedMessage(), e);
      }

    }
    else
    {
      resultValue = attrValue;
    }
    return resultValue;
  }

  public static String convertCMToPercentage(String indexFlag, double cmValue, ConversionContext context)
  {
    String resultValue = null;
    double index = 28;
    if (indexFlag.equals(ODFConstants.SVG_ATTR_WIDTH))
    {
      Measure pageWidth = getWidth(context, indexFlag);
      index = pageWidth.getNumber(); // page-width
    }
    else if (indexFlag.equals(ODFConstants.SVG_ATTR_HEIGHT))
    {
      Measure pageHeight = getHeight(context, indexFlag);
      index = pageHeight.getNumber(); // page-height
    }
    try
    {

      resultValue = String.valueOf(formatDecimal((cmValue * 100) / index)) + Measure.PERCENT;
    }
    catch (Exception e)
    {
      LOG.logp(Level.WARNING, CLASS, "convertCMToPercentage", e.getLocalizedMessage(), e);
    }
    return resultValue;
  }

  public static String convertCMToPercentage(String base, String value)
  {
    Measure mBase = Measure.parseNumber(base);
    Measure mValue = Measure.parseNumber(value);

    if (!mBase.isCMMeasure() || !mValue.isCMMeasure())
      return null;

    return String.valueOf(formatDecimal(mValue.getNumber() * 100 / mBase.getNumber())) + Measure.PERCENT;
  }

  /**
   * Return the width of the containing (parent) object when processing a special attribute (e.g. padding, margin, or text-indent). When
   * it's not set or its not a special attribute , return the page width
   * 
   * @param context
   *          - conversion context
   * 
   * @param attrName
   *          - name of the attribute being processed
   * 
   * @return Measure containing the width to use (in Centimeters)
   */
  public static Measure getWidth(ConversionContext context, String attrName)
  {
    Measure width = Measure.parseNumber((String) context.get(ODFConstants.CONTEXT_PARENT_WIDTH));

    String lowercaseAttrName = attrName.toLowerCase();
    if (width == null
        || (lowercaseAttrName.indexOf(ODFConstants.HTML_ATTR_PADDING) < 0 && lowercaseAttrName.indexOf(ODFConstants.HTML_ATTR_MARGIN) < 0 && lowercaseAttrName
            .indexOf("text-indent") < 0))
    {
      width = Measure.parseNumber((String) context.get(ODFConstants.CONTEXT_PAGE_WIDTH));
    }
    else
    {
      width.convertINToCM();
    }

    return width;
  }

  /**
   * Return the height of the containing (parent) object.
   * 
   * Note that we only return the page height, not the parent element height, since no calculations currently need to use the containing
   * parent height.
   * 
   * @param context
   *          - conversion context
   * 
   * @param attrName
   *          - name of the attribute being processed
   * 
   * @return Measure containing the width to use (converted to CM if need be)
   */
  public static Measure getHeight(ConversionContext context, String attrName)
  {
    Measure height = Measure.parseNumber((String) context.get(ODFConstants.CONTEXT_PAGE_HEIGHT));
    return height;
  }

  /**
   * Compare the ODF size/length values for numerical equivalence. Note: the parameters are assumed to be of the supported length patterns
   * and they are assumed to be using the same length pattern.
   * 
   * @param value1
   *          - size/length value 1
   * @param value2
   *          - size/length value 2
   * @return the value 0 if value1 is numerically equal to value2; a value less than 0 if value1 is numerically less than value; and a value
   *         greater than 0 if value1 is numerically greater than value2.
   */
  public static int compare(String value1, String value2)
  {
    Double value1_d = Measure.extractNumber(value1);
    Double value2_d = Measure.extractNumber(value2);
    return Double.compare(value1_d, value2_d);
  }

  private static final int DEFAULT_NUMBER_OF_DECIMAL_DIGITS = 3;

  private static final DecimalFormat INTERNAL_DECIMAL_FORMATTER[] = new DecimalFormat[6];
  static
  {
    DecimalFormatSymbols internalFormat = new DecimalFormatSymbols(Locale.US);
    INTERNAL_DECIMAL_FORMATTER[0] = new DecimalFormat("##0", internalFormat);
    INTERNAL_DECIMAL_FORMATTER[1] = new DecimalFormat("##0.0", internalFormat);
    INTERNAL_DECIMAL_FORMATTER[2] = new DecimalFormat("##0.00", internalFormat);
    INTERNAL_DECIMAL_FORMATTER[3] = new DecimalFormat("##0.000", internalFormat);
    INTERNAL_DECIMAL_FORMATTER[4] = new DecimalFormat("##0.0000", internalFormat);
    INTERNAL_DECIMAL_FORMATTER[5] = new DecimalFormat("##0.00000", internalFormat);
    for (int i = 0; i < INTERNAL_DECIMAL_FORMATTER.length; i++)
    {
      INTERNAL_DECIMAL_FORMATTER[i].setRoundingMode(RoundingMode.HALF_EVEN);
    }
  }

  /*
   * Formats the double value as a decimal string in an internal format (en_US) with the specified number of decimal digits.
   * 
   * @param value - number to format
   * 
   * @param decimalDigits - Number of digits after the decimal point (valid range = 0 to 5)
   * 
   * @return String containing the formatted decimal string (or null if the number of decimal digits is invalid)
   */
  public static final String formatDecimal(double value, int decimalDigits)
  {
    if ((decimalDigits < 0) || (decimalDigits > INTERNAL_DECIMAL_FORMATTER.length))
    {
      LOG.warning("Invalid number of decimal digits defined in call to formatDecimal: " + decimalDigits);
      return null;
    }
    synchronized (INTERNAL_DECIMAL_FORMATTER[decimalDigits])
    {
      return INTERNAL_DECIMAL_FORMATTER[decimalDigits].format(value);
    }
  }

  /*
   * Formats the double value as a decimal string in an internal format (en_US) with the 3 decimal digits
   * 
   * @param value - number to format
   * 
   * @return String containing the formatted decimal string
   */
  public static final String formatDecimal(double value)
  {
    synchronized (INTERNAL_DECIMAL_FORMATTER[DEFAULT_NUMBER_OF_DECIMAL_DIGITS])
    {
      return INTERNAL_DECIMAL_FORMATTER[DEFAULT_NUMBER_OF_DECIMAL_DIGITS].format(value);
    }
  }

}
