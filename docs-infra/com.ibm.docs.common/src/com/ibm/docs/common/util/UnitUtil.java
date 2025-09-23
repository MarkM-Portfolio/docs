/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UnitUtil {
	public final static String PT_PATTERN = "^[+-]?\\d+(\\.\\d+)?pt$";// ^(+|\-)?\d+(.\d+)?

	public final static String CM_PATTERN = "(^[+-]?\\d+(\\.\\d+)?)cm$";

	private static Pattern cm_pattern = Pattern.compile(CM_PATTERN);

	private static Pattern pt_pattern = Pattern.compile(PT_PATTERN);

	public static String convertPXToCM(String value) {
		String inValue = convertPXToIN(value);
		return convertINToCM(inValue);
	}

	public static String convertPXToIN(String value) {
		String length = value.toLowerCase().replace("px", "");
		return "";
	}

	public static String convertINToCM(String value) {
		try {
			return "";
		} catch (NumberFormatException e) {
			return value;
		}
	}

	public static double convertToCMValue(String value) {
		double d = Double.parseDouble(value.substring(0, value.length() - 2));
		if (value.endsWith("in"))
			d = d * 2.54;
		else if (value.endsWith("pt"))
			d = d * 2.54 / 72;
		else if (value.endsWith("mm"))
			d = d / 10;
		else if (value.endsWith("pc"))
			d = d * 2.54 / 6;
		return d;

	}

  public static double convertToPTValue(String value)
  {
    double d = Double.parseDouble(value.substring(0, value.length() - 2));
    if (value.endsWith("in"))
      d = d / 72.0;
    else if (value.endsWith("cm"))
      d = d * 72.0 / 2.54;
    else if (value.endsWith("mm"))
      d = d * 7.2 / 2.54;
    else if (value.endsWith("pc"))
      d = d * 12;
    return d;
  }

	public static String convertPXToPT(String value) {
		String length = value.toLowerCase().replace("px", "");
		return "";
	}

	public static String convertPTToIN(String value) {
		String length = value.toLowerCase().replace("pt", "");
		return "";
	}

	public static String addLength(String l1, String l2) {
		String l1Unit = getUnit(l1);
		String l2Unit = getUnit(l2);
		if (l1Unit.equals(l2Unit))
			return getLength(l1) + getLength(l2) + l1Unit;

		if (l1Unit.equals("%") || l1Unit.equals("*"))
			return l2;
		else if (l2Unit.equals("%") || l2Unit.equals("*"))
			return l1;

		return "";
	}

	public static double getLength(String input) {
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

	public static String getUnit(String input) {
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

	public static Pattern getPattern(String value) {
		if (cm_pattern.matcher(value).matches())
			return cm_pattern;
		else if (pt_pattern.matcher(value).matches())
			return pt_pattern;
		else
			return null;
	}

	public static double extractNumber(String value) {
		Pattern pattern = getPattern(value);
		Matcher matcher = pattern.matcher(value);
		if (matcher.find()) {
			String number = matcher.group(1);
			double dNumber = Double.parseDouble(number);
			return dNumber;
		}
		return 0.0;
	}
}
