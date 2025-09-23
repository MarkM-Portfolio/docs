/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.security;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.httpclient.Cookie;

import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.common.util.WASConfigHelper;

public class CookieHelper
{
  private static Logger logger = Logger.getLogger(CookieHelper.class.getName());

  final static LinkedList<String> splitDomain = new LinkedList<String>();

  static
  {
    String domain = WASConfigHelper.getSSODomain();
    logger.log(Level.INFO, "Initiate SSO domain setting from WAS: {0}", domain);

    if (domain != null)
    {
      StringTokenizer st = new StringTokenizer(domain, ";| ");
      while (st.hasMoreTokens())
      {
        String token = st.nextToken();
        token = token.trim();
        if (!token.isEmpty())
        {
          splitDomain.add(token);
        }
      }
    }
  }

  /**
   * 1. empty 2. one domain/multi 3. set 'useDomainFromURL' return host
   * 
   */
  private static String getDomain(javax.servlet.http.Cookie cookie, String host)
  {
    logger.entering(CookieHelper.class.getName(), "getDomain", new Object[] { cookie, host });

    if (splitDomain != null && !splitDomain.isEmpty() && host != null)
    {
      for (String domain : splitDomain)
      {
        if (domain.equalsIgnoreCase("useDomainFromURL"))
        {
          logger.exiting(CookieHelper.class.getName(), "getDomain -Find useDomainFromURL ", host);
          return host;
        }
        else if (host.endsWith(domain) || host.equals(domain.substring(1)))
        {
          logger.exiting(CookieHelper.class.getName(), "getDomain -Match host ", domain);
          return domain;
        }
      }
    }

    logger.exiting(CookieHelper.class.getName(), "getDomain -No valid domain from WAS config ", cookie.getDomain());
    return cookie.getDomain();
  }

  public static Cookie getLtpaTokenCookie()
  {
    javax.servlet.http.Cookie[] cookies = URLConfig.getRequestCookies();
    for (int i = 0; i < cookies.length; i++)
    {
      javax.servlet.http.Cookie c = cookies[i];
      if (c.getName().equals("LtpaToken"))
      {
        Cookie ltpaCookie = new Cookie(getDomain(c, null), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
        return ltpaCookie;
      }
    }
    return null;
  }

  public static String getCookieValue(javax.servlet.http.Cookie[] cookies, String cookieName)
  {
    String value = null;
    if (cookies != null)
    {
      for (int i = 0; i < cookies.length; ++i)
      {
        if (cookieName.equalsIgnoreCase(cookies[i].getName()))
        {
          value = cookies[i].getValue();
          break;
        }
      }
    }

    return value;
  }

  public static Cookie getLtpaToken2Cookie()
  {
    javax.servlet.http.Cookie[] cookies = URLConfig.getRequestCookies();
    for (int i = 0; i < cookies.length; i++)
    {
      javax.servlet.http.Cookie c = cookies[i];
      if (c.getName().equals("LtpaToken2"))
      {
        Cookie ltpa2Cookie = new Cookie(getDomain(c, null), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
        return ltpa2Cookie;
      }
    }
    return null;
  }

  public static Cookie[] getAllCookies()
  {
    return CookieHelper.getAllCookies(null);
  }

  public static Cookie[] getAllCookies(String host)
  {
    javax.servlet.http.Cookie[] cookies = URLConfig.getRequestCookies();

    if (cookies == null || cookies.length == 0)
    {
      return new Cookie[0];
    }

    Cookie[] aCookies = new Cookie[cookies.length];
    for (int i = 0; i < cookies.length; i++)
    {
      javax.servlet.http.Cookie c = cookies[i];
      if (c.getName().equals("JSESSIONID"))
        continue;

      Cookie aCookie = new Cookie(getDomain(c, host), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
      aCookies[i] = aCookie;
    }
    return aCookies;
  }

  public static String getHost(String requestURL)
  {
    String host = null;
    try
    {
      URL reqUrl = new URL(requestURL);
      host = reqUrl.getHost();
    }
    catch (MalformedURLException e)
    {
      logger.log(Level.WARNING, "Invalid URL of" + requestURL, e);
    }
    return host;
  }

  /**
   * To check whether the current request contains the bh_docs information in entitlements cookies for the given user.
   * 
   * @param request
   * @param userId
   * @return
   */
  public static boolean hasDocsEntitlementCookie(HttpServletRequest request, String userId)
  {
    javax.servlet.http.Cookie[] cookies = request.getCookies();
    if (cookies == null)
    {
      logger.log(Level.INFO, "no cookies are found.");
      return false;
    }
    for (int i = 0; i < cookies.length; i++)
    {
      javax.servlet.http.Cookie c = cookies[i];
      if (c == null)
        continue;
      if ("entitlements".equals(c.getName()))
      {
        String dStr = validateAndDecode(c.getValue(), userId);
        if (dStr != null && dStr.indexOf("bh_docs") > -1)
        {
          return true;
        }
        break;
      }
    }
    return false;
  }

  public static String validateAndDecode(String cookie, String sId)
  {
    String[] data = cookie.split("-");
    if (data.length == 3)
    {
      String sig = base64Decode(data[0]);
      String entitlements = base64Decode(data[1]);
      String user = base64Decode(data[2]);
      String signed_entitelments = sign(entitlements + user);
      if (sig.equals(signed_entitelments))
      {
        if ((user == null) || (user.equalsIgnoreCase(sId)))
          return entitlements;
      }
    }
    return null;
  }

  // The constant value secret is from topology_shared.json, any issue please contact sabdulla@in.ibm.com
  private static final String secret = "G4ZYy6sVrHuDFQUgd3fy";

  private static String sign(String entitlements)
  {
    String signature = null;
    try
    {
      Mac shaMac = Mac.getInstance("HmacSHA1");
      try
      {
        shaMac.init(new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA1"));
        signature = CookieHelper.convertToHexits(shaMac.doFinal(entitlements.getBytes("UTF-8")));
      }
      catch (InvalidKeyException e)
      {
        throw new RuntimeException(e);
      }
      catch (UnsupportedEncodingException e)
      {
        throw new RuntimeException(e);
      }
      catch (IllegalStateException e)
      {
        throw new RuntimeException(e);
      }
    }
    catch (NoSuchAlgorithmException e)
    {
      throw new RuntimeException(e);
    }
    return signature;
  }

  private static String convertToHexits(byte[] input)
  {
    Hex hex = new Hex();
    return new String(hex.encode(input));
  }

  /**
   * Decode base64 encrypted string
   * 
   * @param input
   *          encrypted string
   * @return decoded string
   */
  public static String base64Decode(String input)
  {
    try
    {
      return new String(Base64.decodeBase64(input.getBytes("UTF-8")), "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      throw new RuntimeException(e);
    }
  }

  /**
   * Encode string using base64
   * 
   * @param input
   *          string to be encoded
   * @return encoded string
   */
  public static String base64Encode(String input)
  {
    try
    {
      return new String(Base64.encodeBase64(input.getBytes("UTF-8"), false), "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      throw new RuntimeException(e);
    }
  }
}
