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

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

public class UnitUtil
{
  public final static String PT_PATTERN = "^[+-]?\\d+(\\.\\d+)?pt$";// ^(+|\-)?\d+(.\d+)?

  public final static String CM_PATTERN = "(^[+-]?\\d+(\\.\\d+)?)cm$";
  
  public final static String IN_PATTERN = "(^[+-]?\\d+(\\.\\d+)?)in$";

  private static Pattern cm_pattern = Pattern.compile(CM_PATTERN);

  private static Pattern pt_pattern = Pattern.compile(PT_PATTERN);
  
  private static Pattern in_pattern = Pattern.compile(IN_PATTERN);

  public static String convertPXToCM(String value)
  {
    String inValue = convertPXToIN(value);
    return convertINToCM(inValue);
  }

  public static String convertPXToIN(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  public static String convertINToCM(String value)
  {
    try
    {
      String length = value.toLowerCase().replace(Unit.INCH.abbr(), "");
      String indent = length + Unit.INCH.abbr();
      return (Length.parseDouble(indent, Unit.CENTIMETER) + Unit.CENTIMETER.abbr());
    }
    catch (NumberFormatException e)
    {
      return value;
    }
  }

  public static String convertPXToPT(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.POINT) + Unit.POINT.abbr());
  }

  public static String convertPTToIN(String value)
  {
    String length = value.toLowerCase().replace("pt", "");
    String indent = length + Unit.POINT.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }
  
  public static String convertINToPT(String value)
  {
    String length = value.toLowerCase().replace("in", "");
    String indent = length + Unit.INCH.abbr();
    return (Length.parseDouble(indent, Unit.POINT) + Unit.POINT.abbr());
  }

  public static double getCMLength(String input)
  {
    input = input.trim().toLowerCase();
    if (input.endsWith("cm"))
      return getLength(input);
    if (input.endsWith("px"))
      input = convertPXToPT(input);

    Unit inputUnit = getODFUnit(input);
    if (inputUnit == null)
      inputUnit = Unit.CENTIMETER;

    return Length.parseDouble(getLength(input) + inputUnit.abbr(), Unit.CENTIMETER);
  }

  public static String getSumofWidth(String[] rowWidth)
  {
    String sumValue = null;
    for (int i = 0; i < rowWidth.length; i++)
    {
      if (sumValue == null && rowWidth[i] != null)
        sumValue = rowWidth[i];
      else if (rowWidth[i] != null)
        sumValue = addLength(rowWidth[i], sumValue);
    }
    return sumValue;
  }

  public static String addLength(String l1, String l2)
  {
    String l1Unit = getUnit(l1);
    String l2Unit = getUnit(l2);
    if (l1Unit.equals(l2Unit))
      return getLength(l1) + getLength(l2) + l1Unit;

    if (l1Unit.equals("%") || l1Unit.equals("*"))
      return l2;
    else if (l2Unit.equals("%") || l2Unit.equals("*"))
      return l1;

    return (getCMLength(l1) + getCMLength(l2)) + "cm";
  }

  public static String decreaseLength(String l1, String l2)
  {
    String l1Unit = getUnit(l1);
    String l2Unit = getUnit(l2);
    if (l1Unit.equals(l2Unit))
      return getLength(l1) - getLength(l2) + l1Unit;

    return (getCMLength(l1) - getCMLength(l2)) + "cm";
  }

  public static String divideLength(String l1, String l2)
  {
    String l1Unit = getUnit(l1);
    double dl2 = Double.parseDouble(l2);
    if (dl2 == 0)
      return l1;
    else
      return (getLength(l1) / dl2) + l1Unit;
  }

  public static int compareLength(String l1, String l2)
  {
    if (getUnit(l1).equals(getUnit(l2)))
      return new Double(getLength(l1)).compareTo(new Double(getLength(l2)));

    return new Double(getCMLength(l1)).compareTo(new Double(getCMLength(l2)));
  }

  public static double getLength(String input)
  {
    input = input.trim().toLowerCase();
    double val1 = 0;
    if (input.endsWith("%"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 1));

    if (input.endsWith("*"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 1));

    if (input.endsWith("in"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("cm"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("px"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("pt"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("mm"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));
    else if (input.endsWith("pc"))
      val1 = Double.parseDouble(input.substring(0, input.length() - 2));

    return val1;
  }

  public static String getUnit(String input)
  {
    String unit = "";
    if (input.endsWith("%"))
      unit = "%";

    if (input.endsWith("*"))
      unit = "*";

    if (input.endsWith("in"))
      unit = "in";
    else if (input.endsWith("cm"))
      unit = "cm";
    else if (input.endsWith("px"))
      unit = "px";
    else if (input.endsWith("pt"))
      unit = "pt";
    else if (input.endsWith("mm"))
      unit = "mm";
    else if (input.endsWith("pc"))
      unit = "pc";

    return unit;
  }

  public static Unit getODFUnit(String input)
  {
    if (input.endsWith("%") || input.endsWith("*"))
      return null;

    Unit odfUnit = null;

    if (input.endsWith("in"))
      odfUnit = Unit.INCH;
    else if (input.endsWith("cm"))
      odfUnit = Unit.CENTIMETER;
    else if (input.endsWith("px"))
      odfUnit = Unit.PIXEL;
    else if (input.endsWith("pt"))
      odfUnit = Unit.POINT;
    else if (input.endsWith("mm"))
      odfUnit = Unit.MILLIMETER;
    else if (input.endsWith("pc"))
      odfUnit = Unit.PICA;

    return odfUnit;

    // return Length.parseUnit(input);
  }

  public static String getRelativeLength(String input)
  {
    double val1 = Double.parseDouble(input.substring(0, input.length() - 1)) * 100;
    return val1 + "*";
  }

  public static String getPercentage(String input)
  {
    double val = 0;
    if (input != null && input.endsWith("*"))
      val = Double.parseDouble(input.substring(0, input.length() - 1));
    return val / 100 + "%";
  }

  public static String caculateMulWithPercent(String length, String percent)
  {
    if (length.length() <= 2 || !percent.endsWith("%"))
      return length;
    String unit = length.substring(length.length() - 2);
    String number = length.substring(0, length.length() - 2);

    try
    {
      double val = Double.parseDouble(number);
      double p = Double.parseDouble(percent.substring(0, percent.length() - 1));
      return val * p / 100 + unit;
    }
    catch (Exception e)
    {
      return length;
    }
  }

  public static Pattern getPattern(String value)
  {
    if (cm_pattern.matcher(value).matches())
      return cm_pattern;
    else if (pt_pattern.matcher(value).matches())
      return pt_pattern;
    else if (in_pattern.matcher(value).matches())
        return in_pattern;
    else
      return null;
  }

  public static double extractNumber(String value)
  {
    Pattern pattern = getPattern(value);
    Matcher matcher = pattern.matcher(value);
    if (matcher.find())
    {
      String number = matcher.group(1);
      double dNumber = Double.parseDouble(number);
      return dNumber;
    }
    return 0.0;
  }

}
