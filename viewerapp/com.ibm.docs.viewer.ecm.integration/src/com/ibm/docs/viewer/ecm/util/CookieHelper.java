/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.ecm.util;

import java.util.LinkedList;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Cookie;

import com.ibm.concord.viewer.config.WASConfigHelper;
import com.ibm.docs.common.util.URLConfig;

public class CookieHelper
{
  private static Logger logger = Logger.getLogger(CookieHelper.class.getName());
  static LinkedList<String> splitDomain = null;

  static
  {
    String domain = WASConfigHelper.getSSODomain();
    logger.log(Level.FINER, "Initiate SSO domain setting from WAS: {0}", domain);

    if (domain != null)
    {
      StringTokenizer st = new StringTokenizer(domain, ";| ");
      while (st.hasMoreTokens())
      {
        String token = st.nextToken();
        token = token.trim();
        if (!token.isEmpty())
        {
          if (splitDomain == null)
          {
            splitDomain = new LinkedList<String>();
          }
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

    if (splitDomain != null && !splitDomain.isEmpty())
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
}
