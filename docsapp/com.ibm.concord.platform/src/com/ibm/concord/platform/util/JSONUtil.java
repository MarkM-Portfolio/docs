/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

public class JSONUtil
{
  public static String escape(String jsonString)
  {
    if (jsonString == null)
    {
      throw new NullPointerException();
    }

    StringBuffer sb = new StringBuffer();
    for (int i = 0; i < jsonString.length(); i++)
    {
      char ch = jsonString.charAt(i);
      switch (ch)
      {
          case '\'' :
            sb.append("\\\'");
            break;
          case '"' :
            sb.append("\\\"");
            break;
          case '\\' :
            sb.append("\\\\");
            break;
          default:
            sb.append(ch);
            break;
//          case '\\' :
//            sb.append("\\\\");
//            break;
//          case '\b' :
//            sb.append("\\b");
//            break;
//          case '\f' :
//            sb.append("\\f");
//            break;
//          case '\n' :
//            sb.append("\\n");
//            break;
//          case '\r' :
//            sb.append("\\r");
//            break;
//          case '\t' :
//            sb.append("\\t");
//            break;
//          case '/' :
//            sb.append("\\/");
//            break;
//          default:
//            if (ch >= '\u0000' && ch <= '\u001F')
//            {
//              String ss = Integer.toHexString(ch);
//              sb.append("\\u");
//              for (int k = 0; k < 4 - ss.length(); k++)
//              {
//                sb.append('0');
//              }
//              sb.append(ss.toUpperCase());
//            }
//            else
//            {
//              sb.append(ch);
//            }
      }
    }
    return sb.toString();
  }
}
