package com.ibm.docs.common.util;

import java.util.HashMap;

public class Coding64
{

  static private String nameMapIn[][] = {

  { "\\s*[\'\"]docs_server[\'\"]\\s*:\\s*[\'\"]", "^a" }, { "\\s*[\'\"]conversion_server[\'\"]\\s*:\\s*[\'\"]", "^b" },
      { "\\s*[\'\"]file_id[\'\"]\\s*:\\s*[\'\"]", "^e" }, { "\\s*[\'\"]datetime[\'\"]\\s*:\\s*[\'\"]", "^f" }, { "[\'\"]\\s*}", "^g" },
      { "[\'\"]\\s*,", "^h" }, { "docs", "^d" }, { "Docs", "^D" }, { "DOCS", "^G" }, { "conversion", "^c" }, { "Conversion", "^C" },
      { "CONVERSION", "^H" }, { "server", "^s" }, { "Server", "^S" }, { "SERVER", "^I" } };

  static private String nameMapOut[][] = {

  { "^a", "\"docs_server\":\"" }, { "^b", "\"conversion_server\":\"" }, { "^e", "\"file_id\":\"" }, { "^f", "\"datetime\":\"" },
      { "^g", "\"}" }, { "^h", "\"," }, { "^d", "docs" }, { "^D", "Docs" }, { "^G", "DOCS" }, { "^c", "conversion" },
      { "^C", "Conversion" }, { "^H", "CONVERSION" }, { "^s", "server" }, { "^S", "Server" }, { "^I", "SERVER" } };

  static private char codes[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',// 0-9
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',// 10-35
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',// 36-61
      '=', '_' // 62-63
  };

  static private HashMap<String, String> values = null;

  static public String replace(String before)
  {
    for (int i = 0; i < nameMapIn.length; i++)
    {
      // System.out.println("before="+before);
      // System.out.println("expr="+nameMapIn[i][0]);
      // System.out.println("substitle="+nameMapIn[i][1]);
      // before = Pattern.compile(nameMapIn[i][0]).matcher(before).replaceAll(nameMapIn[i][1]);
      before = before.replaceAll(nameMapIn[i][0], nameMapIn[i][1]);
    }
    // System.out.println("before="+before);
    return before;
  }

  static public String restore(String before)
  {
    // System.out.println("before="+before);
    for (int i = 0; i < nameMapOut.length; i++)
    {
      // System.out.println("expr="+nameMapOut[i][0]);
      // System.out.println("substitle="+nameMapOut[i][1]);
      before = before.replace(nameMapOut[i][0], nameMapOut[i][1]);
      // System.out.println("before="+before);
    }

    return before;
  }

  static public String encode(String before)// Input should be the binary liked string, for example: '0100111011011'
  {
    String result = "";
    String result_prefix = "";

    // System.out.println(before);
    // System.out.println(before.length());
    int prefix = before.length() % 6 == 0 ? 0 : 6 - before.length() % 6;
    result_prefix = String.valueOf(codes[prefix]);
    for (int i = 1; i <= prefix; i++)
      before += '0';

    int nWords = before.length() / 6;

    while (before.length() > 0)
    {
      int value = Integer.parseInt(before.substring(0, 6), 2);
      result += codes[value];

      before = before.substring(6);
    }

    result = result_prefix + result;

    return result;
  }

  static public String decode(String before)// Input should be the 64 bit liked string, for example: '13a_=v5RP='
  {
    if (values == null)
    {
      values = new HashMap<String, String>();
      for (Integer i = 0; i < 64; i++)
      {
        String binaryString = "";
        if (i < 32)
          binaryString += '0';
        if (i < 16)
          binaryString += '0';
        if (i < 8)
          binaryString += '0';
        if (i < 4)
          binaryString += '0';
        if (i < 2)
          binaryString += '0';
        binaryString += Integer.toBinaryString(i);
        values.put(String.valueOf(codes[i]), binaryString);
      }
    }
    String result = "";
    char chars[] = before.toCharArray();
    int nPrefix = Integer.parseInt(values.get(String.valueOf(chars[0])), 2);
    for (int i = 1; i < chars.length; i++)
    {
      result += values.get(String.valueOf(chars[i]));
    }
    result = result.substring(0, result.length() - nPrefix);
    return result;
  }
}
