/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.auth;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Decoder;
import com.ibm.misc.BASE64Encoder;

public class S2SCallHelper
{
  private static final Logger LOG = Logger.getLogger(S2SCallHelper.class.getName());

  private static final String CONFIG_S2S = "S2S";

  public static final String CONFIG_S2S_NAME = "token";

  public static final String CONFIG_UPLOAD_S2S_NAME = "s2stoken";

  private static String code = null;

  private static String token = null;

  static
  {
    try
    {
      JSONObject o = Platform.getViewerConfig().getSubConfig(CONFIG_S2S);
      token = (String) o.get(CONFIG_S2S_NAME);
      code = new BASE64Encoder().encode(token.getBytes());
      LOG.log(Level.FINE, "s2s token from viewer to conversion server is initialized.");
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Unable to get s2s security token", e);
    }
  }

  /**
   * Conversion requires encoded token for both SC and on-prem
   * 
   * @return encoded token
   */
  public static String getEncodedToken()
  {
    if (code == null)
    {
      LOG.severe("Unable to set s2s call encoded token, the code is null");
    }
    return code;
  }

  /**
   * Docs requires non-encoded token for both SC and on-prem
   * 
   * @return encoded token
   */
  public static String getToken()
  {
    if (token == null)
    {
      LOG.severe("Unable to set s2s call non-encoded token, the code is null");
    }
    return token;
  }

  public static String decode(String value)
  {
    if (value == null)
      return null;
    BASE64Decoder decoder = new BASE64Decoder();
    try
    {
      byte[] bytes;
      bytes = decoder.decodeBuffer(value);
      return new String(bytes);
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Decoding error: " + e.getMessage() + e);
      return null;
    }
  }

  public static boolean verifyNonEncoding(HttpServletRequest request)
  {
    LOG.entering(S2SCallHelper.class.getName(), "verifyNonEncoding");
    boolean verified = false;
    String s2sToken = request.getHeader(CONFIG_UPLOAD_S2S_NAME);

    if (token != null)
    {
      if ((s2sToken != null) && s2sToken.equals(token))
      {
        verified = true;
      }
    }
    if (!verified)
    {
      LOG.log(Level.SEVERE, "Authentication token mismatch! Please check the config file.");
      LOG.log(Level.FINER, "Token mismatch, got {0}, expected: {1}", new String[] { s2sToken, token });
    }
    LOG.exiting(S2SCallHelper.class.getName(), "verifyNonEncoding");
    return verified;
  }

  public static boolean verify(HttpServletRequest request)
  {
    LOG.entering(S2SCallHelper.class.getName(), "verify");
    boolean verified = false;
    String s2sToken = decode(request.getHeader(CONFIG_UPLOAD_S2S_NAME));

    if (token != null)
    {
      if ((s2sToken != null) && s2sToken.equals(token))
      {
        verified = true;
      }
    }
    if (!verified)
    {
      LOG.log(Level.SEVERE, "Authentication token mismatch! Please check the config file");
      LOG.log(Level.FINER, "Token mismatch, got {0}, expected: {1}", new String[] { s2sToken, token });
    }
    LOG.exiting(S2SCallHelper.class.getName(), "verify");
    return verified;
  }

}
