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

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.shape2image.FuncScanner.TOKEN;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class FuncParser
{
  private FuncScanner scanner;

  private TOKEN currentToken;

  public FuncParser()
  {

  }

  public boolean match(TOKEN token)
  {
    currentToken = scanner.nextToken();
    if (currentToken != token)
    {
      return false;
    }
    return true;
  }

  public String transform(String expr)
  {
    scanner = new FuncScanner(expr);
    TOKEN token = scanner.nextToken();
    StringBuilder buf = new StringBuilder(64);
    while (token != TOKEN.END)
    {
      if (token == TOKEN.ROTATE || token == TOKEN.SKEWX)
      {
        buf.append(scanner.tokenValue()).append(' ');
        token = scanner.nextToken();
        while (token != TOKEN.RIGHTPARA)
        {
          if (token == TOKEN.NUMBER || token == TOKEN.NUMBERWITHUNIT)
          {
            RotateHandler handler = new RotateHandler();
            String parameter = handler.process(((String) scanner.tokenValue()));
            buf.append(parameter).append(' ');
          }
          else
            buf.append(scanner.tokenValue()).append(' ');
          token = scanner.nextToken();
        }
      }
      else if (token == TOKEN.TRANSLATE)
      {
        token = scanner.nextToken();
        while (token != TOKEN.RIGHTPARA)
        {
          if (token == TOKEN.NUMBER || token == TOKEN.NUMBERWITHUNIT)
          {
            String value = (String) scanner.tokenValue();
            Measure measure = Measure.parseNumber(value);
            if (measure.isCMMeasure())
            {
              measure.convertCMToPixel();
              @SuppressWarnings("unused")
              String parameter = String.valueOf(measure);
            }
          }
          token = scanner.nextToken();
        }
      }
      buf.append(scanner.tokenValue()).append(' ');
      token = scanner.nextToken();
    }
    return buf.toString().trim();
  }

  public JSONObject parse(String expr)
  {
    JSONObject funcs = new JSONObject();
    scanner = new FuncScanner(expr);
    TOKEN token = scanner.nextToken();
    while (token != TOKEN.END)
    {
      if (token == TOKEN.ROTATE || token == TOKEN.SKEWX)
      {
        token = scanner.nextToken();
        while (token != TOKEN.RIGHTPARA)
        {
          if (token == TOKEN.NUMBER || token == TOKEN.NUMBERWITHUNIT)
          {
            funcs.put("rotate", scanner.tokenValue());
          }
          token = scanner.nextToken();
        }
      }
      else if (token == TOKEN.TRANSLATE)
      {
        token = scanner.nextToken();
        int i = 0;
        String x = "", y = "";
        while (token != TOKEN.RIGHTPARA)
        {
          if (token == TOKEN.NUMBER || token == TOKEN.NUMBERWITHUNIT)
          {
            String value = (String) scanner.tokenValue();
            if (i % 2 == 0)
              x = value;
            else
              y = value;
            i++;
          }
          token = scanner.nextToken();
        }
        funcs.put("translate", x + "," + y);
      }
      token = scanner.nextToken();
    }
    return funcs;
  }

}
