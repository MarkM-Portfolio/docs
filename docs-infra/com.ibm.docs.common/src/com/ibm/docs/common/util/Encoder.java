package com.ibm.docs.common.util;

public class Encoder
{

  static public synchronized String encode(String before)
  {
    String result = "";
    String inProcess = "";
    // System.out.println("before.length="+before.length());
    // System.out.println("before="+before);
    before = Coding64.replace(before);
    // System.out.println("before="+before);
    for (int i = 0; i < before.length(); i++)
    {

      inProcess += HuffmanTree.getEncodeMap().get(before.codePointAt(i));
    }
    // System.out.println("inProcess="+inProcess);
    result = Coding64.encode(inProcess);
    return result;
  }
}
