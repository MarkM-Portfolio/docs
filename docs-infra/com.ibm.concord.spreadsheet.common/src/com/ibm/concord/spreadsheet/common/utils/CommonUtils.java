package com.ibm.concord.spreadsheet.common.utils;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ErrorCode;

/**
 * Misc utils. Only add utility methods here if the method is used both by the main project and the common project (mainly partial load
 * part).
 */
public class CommonUtils
{
  private final static Logger LOG = Logger.getLogger(CommonUtils.class.getName());

  // check if value has content
  public static boolean hasValue(String value)
  {
    return ((value != null) && (value.length() > 0));
  }

  // the address might composed by several range address with space as
  // separator
  public static ArrayList<String> getRanges(String address)
  {
    String sep = "'";
    ArrayList<String> newRanges = new ArrayList<String>();
    if (address.startsWith("(") && address.endsWith(")"))
      address = address.substring(1, address.length() - 1);// remove ();
    else
    {
      newRanges.add(address);
      return newRanges;
    }
    Pattern pattern = Pattern.compile("(,)+");

    if (hasValue(address))
    {
      StringBuffer partRange = new StringBuffer();
      int count = 0;
      int index = 0;
      Matcher m = pattern.matcher(address);
      while (m.find())
      {
        int start = m.start();
        String range = address.subSequence(index, start).toString();
        index = m.end();
        int n = 0;
        while (true)
        {
          n = range.indexOf(sep, n);
          if (n != -1)
          {
            count++;
            n++;
          }
          else
            break;
        }
        partRange.append(range);
        if (count % 2 == 0)
        {
          newRanges.add(partRange.toString());
          partRange = new StringBuffer();
          count = 0;
        }
        else
        {
          partRange.append(address.subSequence(start, index).toString());
        }
      }
      partRange.append(address.subSequence(index, address.length()).toString());// last one
      newRanges.add(partRange.toString());
    }

    return newRanges;
  }

  final private static Pattern PATTERN_NUMBER = Pattern.compile("(^[\\-|\\+]?\\d+(\\.\\d+)?([e|E][\\-|\\+]?\\d+)?$)");
  
  final private static Pattern PATTERN_SCI = Pattern.compile("[E|e]");

  // (^=.+)|(^{=.+}$)
  // add DOTALL flag to make DOT(".") represent any character including line terminators (\n). 
  final private static Pattern FORMULA_PATTERN = Pattern.compile("(^=.+)", Pattern.DOTALL);

  private static boolean isFormula(String text)
  {
    return FORMULA_PATTERN.matcher(text).matches();
  }

  /**
   * <p>
   * Detect and return cell type by its value and calcValue.
   * <p>
   * Cell type is a 32bit int. Lower 3 bit is formula type. The left is cell type.
   * <p>
   * <strong>For the lower 3 bits</strong>, currently if parameter value is a formula, set to 1, otherwise, set to 0.
   * <p>
   * <strong>For the left bits</strong>,
   * <ol>
   * <li>If cell value is class Number, or value is string and is of pattern Number, set to 1 (Number).
   * <li>If cell value is formula, calcValue is not null and refer to item 1, is determined to be Number, set to 1.
   * <li>If cell value is string and not of pattern Number, set to 0. (String).
   * <li>If cell value is formula, calcValue is not null and refer to item 3 & 5, is determined to be String and not Boolean, set to 0.
   * <li>If isFormatBoolean is true, set to 2. (Boolean).
   * <li>If cell value is "True" or "False" ignoring case, set to 2. (Boolean)
   * <li>If cell value is formula, calcValue is of any error message (#REF! for example), set to 3.
   * <li>If cell value is formula, calcValue is null, set to 4.
   * </ol>
   * 
   * @param value
   * @param cellStyle
   * @param calcValue
   * @return
   */
  public static int getCellType(Object value, Object calcValue, boolean isFormatBoolean, boolean noNumberParse)
  {
    int ret = 0;

    // if it is formula or not
    boolean isString = value instanceof String;
    if (isString)
    {
      ret = isFormula((String) value) ? ConversionConstant.FORMULA_TYPE_NORMAL : ConversionConstant.FORMULA_TYPE_NONE;
    }

    Object v;

    if (ret == ConversionConstant.FORMULA_TYPE_NONE)
    {
      v = value;
    }
    else
    {
      v = calcValue;
      isString = calcValue instanceof String;
    }

    if (v == null)
    {
      if (ret == ConversionConstant.FORMULA_TYPE_NORMAL)
      {
        // for formula, calcValue null means not calculated, mark as unknown
        ret |= (ConversionConstant.CELL_TYPE_UNKNOWN << 3);
      }
      // else, keep 0 for value null and non-formula
    }
    else
    {
      if (isFormatBoolean)
      {
        // isFormatBoolean is set to true, set type to boolean
        ret |= (ConversionConstant.CELL_TYPE_BOOLEAN << 3);
      }
      else
      {
        // no style provided
        if (isString)
        {
          String strv = (String) v;

          if (!noNumberParse && PATTERN_NUMBER.matcher(strv).matches())
          {
            // v is number
            if (PATTERN_SCI.matcher(strv).find())
            {
              // is scientific number, careful it might be infinity, try parse at first
              try
              {
                double parsev = Double.parseDouble(strv);
                if (Double.isInfinite(parsev) || Double.isNaN(parsev))
                {
                  // number is infinite, as string
                  ret |= ConversionConstant.CELL_TYPE_STRING << 3;
                }
              }
              catch (NumberFormatException e)
              {
                // parse failed, as string
                ret |= ConversionConstant.CELL_TYPE_STRING << 3;
              }
            }
            else
            {
              // as number
              ret |= (ConversionConstant.CELL_TYPE_NUMBER << 3);
            }
          }
          else if ("true".equalsIgnoreCase(strv) || "false".equalsIgnoreCase(strv))
          {
            // is boolean
            // TODO check by locale of the "true", "false" string
            ret |= (ConversionConstant.CELL_TYPE_BOOLEAN << 3);
          }
          else if (ErrorCode.isError(strv.toUpperCase()))
          {
            // error code
            ret |= (ConversionConstant.CELL_TYPE_ERROR << 3);
          }
          else
          {
            // regular string
            ret |= ConversionConstant.CELL_TYPE_STRING << 3;
          }
        }
        else if (v instanceof Number)
        {
          // v is number
          ret |= (ConversionConstant.CELL_TYPE_NUMBER << 3);
        }
        else if (v instanceof ErrorCode)
        {
          // v is error
          ret |= (ConversionConstant.CELL_TYPE_ERROR << 3);
        }
        else if (v instanceof Boolean)
        {
          ret |= (ConversionConstant.CELL_TYPE_BOOLEAN << 3);
        }
        // else, don't know what the value is
      }
    }

    return ret;
  }

  /**
   * Shortcut for calling 4 parameters version, with noNumberParse set to false
   * 
   * @param value
   * @param calcValue
   * @param isFormatBoolean
   * @return
   */
  public static int getCellType(Object value, Object calcValue, boolean isFormatBoolean)
  {
    return getCellType(value, calcValue, isFormatBoolean, false);
  }

  /**
   * Fix/normalize cell value by provided cell type
   * 
   * @param value
   * @param cellType
   * @return
   */
  public static Object fixValueByType(Object value, int cellType)
  {
    switch (cellType >> 3)
      {
        case ConversionConstant.CELL_TYPE_NUMBER :
          if (value instanceof String)
          {
            try
            {
              String s = (String) value;
              if (s.indexOf('.') > -1)
              {
                // fraction
                return Double.parseDouble(s);
              }
              else
              {
                // try long parse first
                try
                {
                  return Long.parseLong(s);
                }
                catch (NumberFormatException ex)
                {
                  // long can't work, use double..
                  try
                  {
                    return Double.parseDouble(s);
                  }
                  catch (NumberFormatException ex2)
                  {
                    // even double can't work... log the incident
                    LOG.log(Level.WARNING, "cannot fix a number string value to number class.", ex2);
                    return value;
                  }
                }
              }
            }
            catch (NumberFormatException ex)
            {
              // a fraction can't be parsed to double, log the incident
              LOG.log(Level.WARNING, "cannot fix a number string value to number class.", ex);
              return value;
            }
          }
          else
          {
            return value;
          }
        case ConversionConstant.CELL_TYPE_BOOLEAN :
          if (value instanceof String)
          {
            if (Boolean.parseBoolean((String) value))
            {
              // value parsed to be true, return true
              return 1;
            }
            else
            {
              return 0;
            }
          }
          else if (value instanceof Number)
          {
            if (((Number) value).intValue() != 0)
            {
              return 1;
            }
            else
            {
              return 0;
            }
          }
          else if (value instanceof Boolean)
          {
            return (Boolean) value ? 1 : 0;
          }
          else
          {
            // i don't know what this is...
            return 0;
          }
        case ConversionConstant.CELL_TYPE_ERROR :
          if (value instanceof String)
          {
            return ErrorCode.getByErrorMessage((String) value).toString();
          }
          else if (value instanceof ErrorCode)
          {
            return value.toString();
          }
          else
          {
            return value;
          }
        default:
          return value;
      }
  }
}
