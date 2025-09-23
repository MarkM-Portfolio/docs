package com.ibm.concord.spreadsheet.common;

import java.util.HashMap;
import java.util.Map;

public enum ErrorCode {
  NONE("NONE"), // no error
  ERR7("#N/A"), //
  ERR501("#Err501!"), //
  ERR502("#Err502!"), //
  ERR503("#Err503!"), //
  ERR504("#NUM!"), //
  ERR508("#Err508!"), //
  ERR509("#Err509!"), //
  ERR510("#Err510!"), //
  ERR511("#Err511!"), //
  ERR512("#Err512!"), //
  ERR513("#Err513!"), //
  ERR514("#Err514!"), //
  ERR516("#Err516!"), //
  ERR517("#Err517!"), //
  ERR518("#Err518!"), //
  ERR519("#VALUE!"), //
  ERR520("#Err520!"), //
  ERR521("#Err521!"), //
  ERR522("#Err522!"), //
  ERR523("#Err523!"), //
  ERR524("#REF!"), //
  ERR525("#NAME?"), //
  ERR526("#Err526!"), //
  ERR527("#Err527!"), //
  ERR532("#DIV/0!"), //
  ERR533("#NULL!"), //
  ERR1001("UNSUPPORT_FORMULA"), //
  ERR1002("#ERROR!"), //
  ERR1003("REF_UNSUPPORT_FORMULA"), //
  ERR2001("UNPARSE");

  private String errorMessage;

  private int intCode;

  /**
   * @param msg
   *          error code message in en.
   */
  private ErrorCode(String msg)
  {
    errorMessage = msg;

    String name = name();

    if ("NONE".equals(name))
    {
      intCode = 0;
    }
    else
    {
      intCode = Integer.parseInt(name.substring(3));
    }
  }

  public String toString()
  {
    return errorMessage;
  }

  public int toIntValue()
  {
    return intCode;
  }

  private final static Map<String, ErrorCode> byUpperMessageMap;

  private final static Map<Integer, ErrorCode> byCodeMap;

  static
  {
    byUpperMessageMap = new HashMap<String, ErrorCode>();

    byCodeMap = new HashMap<Integer, ErrorCode>();

    ErrorCode[] codes = ErrorCode.class.getEnumConstants();
    for (int i = 0; i < codes.length; i++)
    {
      byUpperMessageMap.put(codes[i].toString().toUpperCase(), codes[i]);

      byCodeMap.put(codes[i].toIntValue(), codes[i]);
    }
  }

  /**
   * Determine if provided object v is any error code kind.
   * 
   * @param err
   * @return
   */
  public static boolean isError(Object v)
  {
    return v instanceof ErrorCode || (v instanceof String && (byUpperMessageMap.containsKey(((String) v).toUpperCase())));
  }

  public static ErrorCode getByCode(int code)
  {
    return byCodeMap.get(code);
  }

  public static ErrorCode getByErrorMessage(String message)
  {
    ErrorCode ec = byUpperMessageMap.get(message.toUpperCase());

    return ec;
  }
}
