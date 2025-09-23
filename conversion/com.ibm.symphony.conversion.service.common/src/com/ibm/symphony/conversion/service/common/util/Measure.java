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
import java.text.ParseException;
import java.util.Locale;
import java.util.logging.Logger;

public class Measure
{
  private static final String CLASS = Measure.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  public static final String CENTIMETER = "cm";

  public static final String EM = "em";

  public static final String INCH = "in";

  public static final String PERCENT = "%";

  public static final String POINT = "pt";

  public static final String PIXEL = "px";

  public static final String NONE = "";

  public static final double IN_CM_CONVERSION = 2.5399;

  public static final double CM_EM_CONVERSION = 2.37106301584;

  public static final double CM_PT_CONVERSION = 28.3464567;

  public static final double IN_PT_CONVERSION = 72;

  private double ivNumber = 0.0;

  private String ivUnit = "";

  private static final DecimalFormat INTERNAL_DECIMAL_FORMATTER;
  static
  {
    DecimalFormatSymbols internalFormat = new DecimalFormatSymbols(Locale.US);
    INTERNAL_DECIMAL_FORMATTER = new DecimalFormat("##0.000", internalFormat);
    INTERNAL_DECIMAL_FORMATTER.setRoundingMode(RoundingMode.HALF_EVEN);
  }

  /**
   * HIDE DEFAULT CONSTRUCTOR
   */
  @SuppressWarnings("unused")
  private Measure()
  {
  }

  /**
   * Construct a Measure
   * 
   * @param number
   *          Numeric value
   * @param unit
   *          Unit of Measure
   */
  public Measure(double number, String unit)
  {
    this.ivNumber = number;
    this.ivUnit = unit;
  }

  /**
   * Parses a String and converts the String into a Measure class (extracting to a String Unit and numeric value).
   * 
   * @param value
   *          String to parse
   * 
   * @return Measure Parsed result in a Measure class
   */
  public static Measure parseNumber(String value)
  {
    if ((value == null) || (value.length() == 0))
    {
      return null;
    }

    String unit = Measure.NONE;
    int index = value.lastIndexOf(Measure.CENTIMETER);
    if (index < 0)
    {
      index = value.lastIndexOf(Measure.POINT);
      if (index < 0)
      {
        index = value.lastIndexOf(Measure.INCH);
        if (index < 0)
        {
          index = value.lastIndexOf(Measure.PERCENT);
          if (index < 0)
          {
            index = value.lastIndexOf(Measure.EM);
            if (index >= 0)
            {
              unit = Measure.EM;
            }
          }
          else
          {
            unit = Measure.PERCENT;
          }
        }
        else
        {
          unit = Measure.INCH;
        }
      }
      else
      {
        unit = Measure.POINT;
      }
    }
    else
    {
      unit = Measure.CENTIMETER;
    }

    try
    {
      // Make sure the unit id found and is at the end of the string (This assumes that the value is trimmed)
      if ((index >= 0) && ((index + unit.length()) == value.length()))
      {
        // We found an unit at the end, so attempt to convert the number portion prior to the unit
        return new Measure(Double.parseDouble(value.substring(0, index)), unit);
      }
      else
      {
        if (index < 0)
        {
          // We didn't find an unit, so next check if this is just a number
          return new Measure(Double.parseDouble(value), unit);
        }
        else
        {
          // This is not a valid number/unit combination
          return null;
        }
      }
    }
    catch (NumberFormatException e)
    {
      // In case the number was in scientific notation, try to format using DecimalFormat before giving up.
      Number number;
      try
      {
        if (index >= 0)
        {
          // We found an unit at the end, so attempt to convert the number portion prior to the unit
          number = parseForScientificNotation(value.substring(0, index));
        }
        else
        {
          // We didn't find an unit, so next check if this is just a scientific number
          number = parseForScientificNotation(value);
        }
        return new Measure(number.doubleValue(), unit);
      }
      catch (Exception e1)
      {
        return null;
      }
    }
  }

  /**
   * Parses a String and converts the String into a double (extracting the numeric value).
   * 
   * @param value
   *          String to parse
   * 
   * @return double Parsed numeric value result. If the value is not a valid Measure, 0.0 will be returned.
   */
  public static double extractNumber(String value)
  {
    Measure measure = Measure.parseNumber(value);
    if (measure != null)
    {
      return measure.getNumber();
    }
    else
    {
      // TODO: may be issue in future
      // log.warning("Invalid measure value: " + value);
      return 0.0;
    }
  }

  /**
   * Calculates which measurement is a greater value, returning the numeric value of that measurement. If the units of measure are not the
   * same, a value of 0 is returned.
   * 
   * @param value1
   *          First value to compare
   * @param value2
   *          Second value to compare
   * @return The maximum numeric value if the units are the same (or 0 is they are not equivalent)
   */
  public static double max(String value1, String value2)
  {
    Measure value1Measure = Measure.parseNumber(value1);
    Measure value2Measure = Measure.parseNumber(value2);

    if (value1Measure.getUnit().equals(value2Measure.getUnit()))
    {
      if (value1Measure.getNumber() > value2Measure.getNumber())
        return value1Measure.getNumber();
      else
        return value2Measure.getNumber();
    }
    return 0;
  }

  /**
   * Calculates which measurement is a lesser value, returning the numeric value of that measurement. If the units of measure are not the
   * same, a value of 0 is returned.
   * 
   * @param value1
   *          First value to compare
   * @param value2
   *          Second value to compare
   * @return The minimum numeric value if the units are the same (or 0 is they are not equivalent)
   */
  public static double min(String value1, String value2)
  {
    Measure value1Measure = Measure.parseNumber(value1);
    Measure value2Measure = Measure.parseNumber(value2);

    if (value1Measure.getUnit().equals(value2Measure.getUnit()))
    {
      if (value1Measure.getNumber() < value2Measure.getNumber())
        return value1Measure.getNumber();
      else
        return value2Measure.getNumber();
    }
    return 0;
  }

  /**
   * Retrieves the numeric value of the Measure
   * 
   * @return double Numeric value
   */
  public final double getNumber()
  {
    return this.ivNumber;
  }

  /**
   * Retrieves the unit value of the Measure
   * 
   * @return String Unit of Measure
   */
  public final String getUnit()
  {
    return this.ivUnit;
  }

  /**
   * Converts the Measure to a string which includes the numeric value and the unit of measure
   * 
   * @return String Measure as a string
   */
  public String toString()
  {
    return Double.toString(this.ivNumber) + this.ivUnit;
  }

  /**
   * Returns true if the Measure is a CM measure
   * 
   * @return boolean - True is Measure is a CM measure
   */
  public final boolean isCMMeasure()
  {
    if (ivUnit.equals(Measure.CENTIMETER))
    {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the Measure is a IN measure
   * 
   * @return boolean - True is Measure is a IN measure
   */
  public final boolean isINMeasure()
  {
    if (ivUnit.equals(Measure.INCH))
    {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the Measure is a PT measure
   * 
   * @return boolean - True is Measure is a PT measure
   */
  public final boolean isPTMeasure()
  {
    if (ivUnit.equals(Measure.POINT))
    {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the Measure is a Percentage measure
   * 
   * @return boolean - True is Measure is a Percentage measure
   */
  public final boolean isPercentMeasure()
  {
    if (ivUnit.equals(Measure.PERCENT))
    {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the Measure is a EM measure
   * 
   * @return boolean - True is Measure is a EM measure
   */
  public final boolean isEMMeasure()
  {
    if (ivUnit.equals(Measure.EM))
    {
      return true;
    }
    return false;
  }

  /**
   * Convert an IN value to an CM value. Note: This changes the state of the Measure instance (value is converted and the unit is changed).
   * 
   * @return boolean Flag indicating success (true) or failure (false) of the conversion
   */
  public final boolean convertINToCM()
  {
    if (ivUnit.equals(Measure.INCH))
    {
      ivNumber = ivNumber * IN_CM_CONVERSION;
      ivUnit = CENTIMETER;
      return true;
    }
    return false;
  }

  /**
   * Convert a CM value to an EM value (straight conversion without using any relative information such as parent being taken into account)
   * 
   * @return String containing the em value ending in 'em'
   */
  public final String convertAsStringCMToEM()
  {
    if ((isINMeasure()) && (!isCMMeasure()))
      return null;

    double dValue = getNumber();
    if (isINMeasure())
    {
      dValue *= Measure.IN_CM_CONVERSION;
    }

    return String.valueOf(MeasurementUtil.formatDecimal(dValue * Measure.CM_EM_CONVERSION)) + Measure.EM;
  }

  /**
   * Convert an CM value to a PX value. Note: This changes the state of the Measure instance (value is converted and the unit is changed).
   * 
   * @return boolean Flag indicating success (true) or failure (false) of the conversion
   */
  public final boolean convertCMToPixel()
  {
    if (isCMMeasure())
    {
      ivNumber = ivNumber * 96 / Measure.IN_CM_CONVERSION;
      ivUnit = PIXEL;
      return true;
    }
    if (isINMeasure())
    {
      ivNumber = ivNumber * 96;
      ivUnit = PIXEL;
      return true;
    }
    return false;
  }

  /**
   * Convert an CM value to a PT value. Note: This changes the state of the Measure instance (value is converted and the unit is changed).
   * 
   * @return boolean Flag indicating success (true) or failure (false) of the conversion
   */
  public final boolean convertCMToPT()
  {
    if (isCMMeasure())
    {
      ivNumber = ivNumber * Measure.CM_PT_CONVERSION;
      ivUnit = POINT;
      return true;
    }
    if (isINMeasure())
    {
      ivNumber = ivNumber * Measure.IN_PT_CONVERSION;
      ivUnit = POINT;
      return true;
    }
    return false;
  }

  /**
   * FOR BORDER USE ONLY - Convert an CM value to a PT value. Note: This changes the state of the Measure instance (value is converted and
   * the unit is changed).
   * 
   * @return boolean Flag indicating success (true) or failure (false) of the conversion
   */
  public final boolean convertCMToPTForBorders()
  {
    if (isCMMeasure())
    {
      ivNumber = ivNumber / 0.02; // NOTE: THIS IS PROBABLY WRONG - USE Measure.CM_PT_CONVERSION instead
      ivUnit = POINT;
      return true;
    }
    if (isINMeasure())
    {
      ivNumber = ivNumber * IN_CM_CONVERSION / 0.02; // NOTE: THIS IS PROBABLY WRONG - USE Measure.IN_PT_CONVERSION instead
      ivUnit = POINT;
      return true;
    }
    return false;
  }

  /**
   * Parses the value and returns a number using the default decimal formatter
   * 
   * @param value
   *          - the string containing the number to parse
   * 
   * @return - a number parsed from the string
   * 
   * @throws ParseException
   *           - if the beginning of the specified string cannot be parsed as a number.
   */
  private static final Number parseForScientificNotation(String value) throws ParseException
  {
    Number number = null;
    synchronized (INTERNAL_DECIMAL_FORMATTER)
    {
      number = INTERNAL_DECIMAL_FORMATTER.parse(value);
    }
    return number;
  }
}