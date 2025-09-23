/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.list;

import com.ibm.symphony.conversion.service.common.g11n.OpenSymbolUtil;

public class ListSymbolUtil
{
  public static String openSymbol2Unicode(String str)
  {
    return OpenSymbolUtil.transformUnicode(str);
  }

  public static String extractToUnicode(String str)
  {
    int count = str.codePointCount(0, str.length());
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < count; i++)
    {
      sb.append("\\");
      sb.append(String.format("%04x", str.codePointAt(i)));
    }
    return sb.toString();
  }
}
