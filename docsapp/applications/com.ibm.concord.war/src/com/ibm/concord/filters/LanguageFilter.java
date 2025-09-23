/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.filters;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.Platform;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.helper.LanguageCookieHelper;
import com.ibm.docs.directory.beans.UserBean;

public class LanguageFilter implements Filter
{
  private static Logger log = Logger.getLogger(LanguageFilter.class.getName());

  public static final String CROSS_APP_COOKIE_DOMAIN = Platform.getConcordConfig().getVirtualHostsJunctionDomain();

  private static final String bss_be_url = Platform.getConcordConfig().getBssCoreBackEnd();

  private static final boolean isCloud = Platform.getConcordConfig().isCloud();

  @Override
  public void destroy()
  {
    log.log(Level.FINE, "destroied.");

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest hRequest = (HttpServletRequest) request;
    HttpServletResponse hResponse = (HttpServletResponse) response;

    String locale = null;

    if (isCloud)
    {
      UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
      String sid = user.getId();
      if (sid != null)
      {
        Cookie langCookie = LanguageCookieHelper.getCookie(hRequest, LanguageCookieHelper.AC_LANGUAGE_COOKIENAME);
        if (langCookie == null)
        {
          langCookie = LanguageCookieHelper.getCookie(hRequest, LanguageCookieHelper.LANGUAGE_COOKIENAME);
        }
        // 1. get it from subscriber Cookie first(BSSUI endpoint)
        if (langCookie != null)
        {
          locale = LanguageCookieHelper.validateAndDecode(langCookie.getValue(), sid);
          if (locale == null)
          {
            log.log(Level.FINE, "Found invalid cookie in the request, due to user changes - " + locale);
            locale = LanguageCookieHelper.createLocaleCookie(hRequest, hResponse, sid, bss_be_url, CROSS_APP_COOKIE_DOMAIN);
          }
          else
          {
            log.log(Level.FINE, "Found valid cookie in the request as logged in user - " + locale);
          }
        }
        else
        {
          // 2. get it from BSSUI
          // Lang cookie not present
          // Create cookie
          log.log(Level.FINE, "Failed to find valid cookie. Creating a new one...");
          locale = LanguageCookieHelper.createLocaleCookie(hRequest, hResponse, sid, bss_be_url, CROSS_APP_COOKIE_DOMAIN);
        }
      }
    }
    else
    {
      // 3. otherwise, get it from the request
      locale = request.getLocale().toString().toLowerCase().replaceAll("_", "-");
      log.log(Level.FINE, "Got the locale from request: {0}.", locale);
    }

    if (locale != null && !locale.trim().equals(""))
    {
      locale = LanguageCookieHelper.getFallbackLanguage(locale);
      LangHttpServletRequest lRequest = null;
      lRequest = new LangHttpServletRequest(hRequest, locale.trim());
      chain.doFilter(lRequest, hResponse);
      return;
    }

    chain.doFilter(request, response);
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException
  {
    log.log(Level.FINE, "initialized.");
  }
}
