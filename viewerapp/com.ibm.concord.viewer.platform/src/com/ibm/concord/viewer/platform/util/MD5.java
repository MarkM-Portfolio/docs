/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.security.MessageDigest;

public class MD5
{
  public static String getMD5(String src)
  {
    if (src == null)
      return "";
    
    byte[] source = src.getBytes();
    String s = null;
    char hexDigits[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' };
    try
    {
      MessageDigest md = MessageDigest.getInstance("MD5");
      md.update(source);
      byte tmp[] = md.digest();
      char str[] = new char[16 * 2];
      int k = 0;
      for (int i = 0; i < 16; i++)
      {
        byte byte0 = tmp[i];
        str[k++] = hexDigits[byte0 >>> 4 & 0xf];
        str[k++] = hexDigits[byte0 & 0xf];
      }
      s = new String(str);
    }
    catch (Exception e)
    {
    }
    return s;
  }

}
