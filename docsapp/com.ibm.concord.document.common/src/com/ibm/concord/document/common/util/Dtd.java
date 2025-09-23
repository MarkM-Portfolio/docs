/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

/*
 * This class is same with dtd.js in CKEditor
 */
public class Dtd
{
  final static String[] B = { "input", "button", "select", "textarea", "label" };

  final static String[] F = { "ins", "del", "script" };

  final static String[] G = { "b", "acronym", "bdo", "var", "#", "abbr", "code", "br", "i", "cite", "kbd", "u", "strike", "s", "tt",
      "strong", "q", "samp", "em", "dfn", "span" };

  final static String[] H = { "sub", "img", "object", "sup", "basefont", "map", "applet", "font", "big", "small" };

  final static String[] listItems = { "dd", "dt", "li" };

  final static String[] list = { "ul", "ol", "dl" };

  private static boolean isInArray(String string, String[] b2)
  {
    for (String s : b2)
    {
      if (s.equals(string))
        return true;
    }
    return false;
  }

  final public static boolean isInline(String string)
  {
    return isL(string);
  }

  final public static boolean isListItem(String string)
  {
    return isInArray(string, listItems);
  }

  final public static boolean isList(String string)
  {
    return isInArray(string, list);
  }

  private static boolean isL(String string)
  {
    if (string.equals("a"))
      return true;
    return isJ(string);
  }

  private static boolean isJ(String string)
  {
    if (string.equals("iframe"))
      return true;
    return isH(string) || isB(string);
  }

  private static boolean isB(String string)
  {
    return isInArray(string, B);
  }

  private static boolean isG(String string)
  {
    return isInArray(string, G) || isF(string);
  }

  private static boolean isF(String string)
  {
    return isInArray(string, F);
  }

  private static boolean isH(String string)
  {
    return isInArray(string, H) || isG(string);
  }

}
