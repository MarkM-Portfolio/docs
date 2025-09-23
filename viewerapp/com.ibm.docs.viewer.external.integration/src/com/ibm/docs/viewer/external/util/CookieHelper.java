package com.ibm.docs.viewer.external.util;

import org.apache.commons.httpclient.Cookie;

import com.ibm.concord.viewer.config.WASConfigHelper;
import com.ibm.docs.common.util.URLConfig;

public class CookieHelper
{
  private static String getDomain(javax.servlet.http.Cookie cookie)
  {
    String domain = WASConfigHelper.getSSODomain();
    if (domain != null)
    {
      return domain;
    }
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
        Cookie ltpaCookie = new Cookie(getDomain(c), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
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
        Cookie ltpa2Cookie = new Cookie(getDomain(c), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
        return ltpa2Cookie;
      }
    }
    return null;
  }

  public static Cookie[] getAllCookies()
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
      
      Cookie aCookie = new Cookie(getDomain(c), c.getName(), c.getValue(), "/", c.getMaxAge(), c.getSecure());
      aCookies[i] = aCookie;
    }
    return aCookies;
  }
}
