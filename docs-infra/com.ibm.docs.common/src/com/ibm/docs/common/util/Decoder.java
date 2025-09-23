package com.ibm.docs.common.util;

import com.ibm.docs.common.util.HuffmanTree;

public class Decoder
{

  static public synchronized String decode(String before)
  {
    if (before.length() < 2)
      return "";
    String result = "";
    String binaryStr = "";

    binaryStr = Coding64.decode(before);
    while (binaryStr.length() > 0)
    {
      // System.out.println(binaryStr.length());
      for (int i = 0; i < binaryStr.length(); i++)
      {
        String sub = binaryStr.substring(0, i + 1);
        Integer code = HuffmanTree.getDecodeMap().get(sub);
        if (code != null)
        {
          char character = (char) code.intValue();
          result += character;

          binaryStr = binaryStr.substring(i + 1);
        }

      }
    }

    // System.out.println("result="+result);
    result = Coding64.restore(result);
    return result;
  }
}
