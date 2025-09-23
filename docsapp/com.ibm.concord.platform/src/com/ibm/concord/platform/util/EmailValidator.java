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

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 
 * @author huoqif@cn.ibm.com
 *
 */
public class EmailValidator
{
  private static Matcher matcher;

  private static Pattern pattern;

  private final static String REG_EXP = "^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";

  static
  {
    pattern = Pattern.compile(REG_EXP);
  }

  public static boolean isEmail(final String email)
  {
    if (email == null || email.length() == 0)
    {
      return false;
    }

    matcher = pattern.matcher(email);
    return matcher.matches();
  }
}
