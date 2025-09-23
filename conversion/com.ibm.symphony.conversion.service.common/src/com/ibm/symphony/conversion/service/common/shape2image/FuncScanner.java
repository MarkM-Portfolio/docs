/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;


import java.util.HashMap;
import java.util.Map;

public class FuncScanner
{
  private String expr;

  private int position;

  private String units[] = new String[] { "cm", "in" };

  private Map<String, TOKEN> keyTokens = new HashMap<String, TOKEN>();

  public enum TOKEN {
    ROTATE, TRANSLATE, MATRIX, SCALE, SKEWX, SKEWY, ROTATEX, ROTATEY, ROTATEZ, NUMBER, NUMBERWITHUNIT, LEFTPARA, RIGHTPARA, UNAVAILABLE, ERROR, END
  };

  private String keyWords[] = new String[] { "rotate", "translate", "matrix", "scale", "skewX", "skewY", "rotatex", "rotatey", "rotatez" };

  private TOKEN currentToken;

  private Object tokenValue;

  public FuncScanner(String expr)
  {
    this.expr = expr;
    for (int i = 0; i < keyWords.length; i++)
    {
      keyTokens.put(keyWords[i], TOKEN.values()[i]);
    }
  }

  public TOKEN nextToken()
  {
    StringBuilder buffer = new StringBuilder(16);
    int ch = read();
    while (ch != 0)
    {
      if (Character.isWhitespace(ch))
      {
        ch = read();
        continue;
      }
      else if (Character.isLetter(ch))
      {
        buffer.append((char) ch);
        ch = read();
        while (Character.isLetter(ch))
        {
          buffer.append((char) ch);
          ch = read();
        }
        unread();
        tokenValue = buffer.toString();
        buffer.setLength(0);
        currentToken = keyTokens.get(tokenValue);
        return currentToken;
      }
      else if (ch == '(')
      {
        tokenValue = "(";
        return TOKEN.LEFTPARA;
      }
      else if (Character.isDigit(ch))
      {
        buffer.append((char) ch);
        ch = read();
        while (Character.isDigit(ch) || ch == '.')
        {
          buffer.append((char) ch);
          ch = read();
        }
        StringBuilder uBuffer = new StringBuilder(16);
        while (Character.isLetter(ch))
        {
          uBuffer.append((char) ch);
          ch = read();
        }
        unread();
        if (isUnit(uBuffer.toString()))
        {
          tokenValue = buffer.append(uBuffer).toString();
          uBuffer.setLength(0);
          buffer.setLength(0);
          return TOKEN.NUMBERWITHUNIT;
        }
        else if (uBuffer.length() == 0)
        {
          tokenValue = buffer.toString();
          buffer.setLength(0);
          uBuffer.setLength(0);
          return TOKEN.NUMBER;
        }
        return TOKEN.ERROR;
      }
      else if (ch == '-')
      {
        buffer.append((char) ch);
        ch = read();
        while (Character.isDigit(ch) || ch == '.')
        {
          buffer.append((char) ch);
          ch = read();
        }
        StringBuilder uBuffer = new StringBuilder(16);
        while (Character.isLetter(ch))
        {
          uBuffer.append((char) ch);
          ch = read();
        }
        unread();
        if (isUnit(uBuffer.toString()))
        {
          tokenValue = buffer.append(uBuffer).toString();
          uBuffer.setLength(0);
          buffer.setLength(0);
          return TOKEN.NUMBERWITHUNIT;
        }
        else if (uBuffer.length() == 0)
        {
          tokenValue = buffer.toString();
          buffer.setLength(0);
          uBuffer.setLength(0);
          return TOKEN.NUMBER;
        }
        return TOKEN.ERROR;  
      }
      else if (ch == ')')
      {
        tokenValue = ")";
        return TOKEN.RIGHTPARA;
      }
    }
    return TOKEN.END;
  }

  private boolean isUnit(String unit)
  {
    for (int i = 0; i < units.length; i++)
    {
      if (unit.equals(units[i]))
      {
        return true;
      }
    }
    return false;
  }

  public Object tokenValue()
  {
    return tokenValue;
  }

  private int read()
  {
    if (position > expr.length() - 1)
      return 0;
    return expr.charAt(position++);
  }

  private void unread()
  {
    position--;

  }

}
