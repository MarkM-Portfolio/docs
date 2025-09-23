/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.util;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.spec.SecretKeySpec;

import com.ibm.misc.BASE64Decoder;
import com.ibm.misc.BASE64Encoder;

public class AESUtil
{
  private static final Logger LOG = Logger.getLogger(AESUtil.class.getName());

  private static final String aesKey = "+aKTyK5aGc31a1YOuTJd7g==";

  public static String aesDecryptByString(String encryptString) throws Exception
  {
    String sKey = aesKey;
    byte[] key = new BASE64Decoder().decodeBuffer(sKey);

    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
    cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"));
    String ret = null;
    try
    {
      ret = new String(cipher.doFinal(new BASE64Decoder().decodeBuffer(encryptString)));
    }
    catch (IllegalBlockSizeException ex)
    {
      LOG.log(Level.WARNING, "Error happen while decrpt string:" + encryptString, ex);
      throw ex;
    }
    return ret;

  }

  public static String aesEncryptToString(String content) throws Exception
  {
    String sKey = aesKey;
    byte[] key = new BASE64Decoder().decodeBuffer(sKey);

    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
    cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
    String ret = null;
    try
    {
      ret = new BASE64Encoder().encode(cipher.doFinal(content.getBytes("utf-8")));
    }
    catch (IllegalBlockSizeException ex)
    {
      LOG.log(Level.WARNING, "Error happen while encrpt string:" + content, ex);
      throw ex;
    }
    return ret;

  }
}
