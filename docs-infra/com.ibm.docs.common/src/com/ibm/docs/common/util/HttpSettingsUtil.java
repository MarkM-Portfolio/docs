/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 *
 */
public class HttpSettingsUtil
{

  private static final Logger LOG = Logger.getLogger(HttpSettingsUtil.class.getName());

  /**
   * use to response to browser
   */
  public final static String PROBLEM_ID = "problem_id";

  /**
   * use inner application
   */
  public final static String REQUEST_ID = "request_id";

  /**
   * use to get response from other application
   */
  public final static String RESPONSE_ID = "response_id";

  private static SimpleDateFormat dfDateFormat = new SimpleDateFormat("yyyyMMddHHmmss");

  /**
   * @param list
   * @return
   */
  public static String listToString(List<String> list)
  {
    LOG.entering(HttpSettingsUtil.class.getName(), "listToString");
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < list.size(); i++)
    {
      builder.append(list.get(i));
      builder.append("-");
    }
    builder.append(String.valueOf(dfDateFormat.format(new Date()))).append(".");
    builder.append(System.nanoTime());
    String str = builder.toString();
    LOG.exiting(HttpSettingsUtil.class.getName(), "listToString", " str : " + str);
    return str;
  }

  /**
   * @param list
   * @return
   * @throws Exception
   */
  public static String generateProblemId(List<String> list)
  {
    LOG.entering(HttpSettingsUtil.class.getName(), "generateProblemId");
    String str = listToString(list);
    String result = encrypt(str);
    LOG.exiting(HttpSettingsUtil.class.getName(), "generateProblemId", "result : " + result);
    return result;
  }

  /**
   * @param valueToEnc
   * @return
   * @throws Exception
   */
  public static String encrypt(String valueToEnc)
  {
    String encryptedStr = "";
    if (valueToEnc != null && !"".equals(valueToEnc))
    {
      try
      {
        encryptedStr = AESUtil.aesEncryptToString(valueToEnc);
        if (encryptedStr != null)
        {
          Pattern pattern = Pattern.compile("\\s*|\t|\r|\n");
          Matcher matcher = pattern.matcher(encryptedStr);
          encryptedStr = matcher.replaceAll("");
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "failed to encrypt string " + valueToEnc, e);
      }
    }
    return encryptedStr;
  }

  /**
   * @param encryptedValue
   * @return
   * @throws Exception
   */
  public static String decrypt(String encryptedValue)
  {
    String encryptedStr = "";
    if (encryptedValue != null && !"".equals(encryptedValue))
    {
      try
      {
        encryptedStr = AESUtil.aesDecryptByString(encryptedValue);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "failed to decrypt string " + encryptedValue, e);
      }
    }
    return encryptedStr;
  }

  /**
   * @param bytes
   * @return
   */
  public static char[] getChars(byte[] bytes)
  {
    Charset cs = Charset.forName("UTF-8");
    ByteBuffer bb = ByteBuffer.allocate(bytes.length);
    bb.put(bytes);
    bb.flip();
    CharBuffer cb = cs.decode(bb);
    return cb.array();
  }

  /**
   * @return
   */
  public static String getServerName()
  {
    LOG.entering(HttpSettingsUtil.class.getName(), "getServerName");
    String servername = null;
    try
    {
      String hostName = InetAddress.getLocalHost().getHostName();
      if (hostName != null && !"".equals(hostName))
      {
        if (hostName.contains("."))
        {
          String[] args = hostName.split("\\.");
          servername = args[0];
        }
        else
        {
          servername = hostName;
        }
      }
    }
    catch (UnknownHostException e)
    {
      LOG.log(Level.WARNING, "failed to get server ", e);
    }
    LOG.exiting(HttpSettingsUtil.class.getName(), "getServerName", "servername : " + servername);
    return servername;
  }

  public static void main(String[] args) throws Exception
  {
    System.out.println("HostName:" + getServerName());
    Scanner san = new Scanner(System.in);
    String str = san.nextLine();
    String strEnc = decrypt(str);
    System.out.println(strEnc);
  }

}
