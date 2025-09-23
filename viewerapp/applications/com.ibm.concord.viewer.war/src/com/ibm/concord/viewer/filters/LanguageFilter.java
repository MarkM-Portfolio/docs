/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.filters;

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
import javax.servlet.http.HttpSession;

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.docs.common.helper.LanguageCookieHelper;

/**
 * This filter is injected while building package for SmartCloud ViewerNext.
 * 
 * @author kjye
 * 
 */
public class LanguageFilter implements Filter
{
  private static Logger log = Logger.getLogger(LanguageFilter.class.getName());

  public static final String CROSS_APP_COOKIE_DOMAIN = ViewerConfig.getInstance().getVirtualHostsJunctionDomain();

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
    HttpSession session = hRequest.getSession();
    UserBean userBean = (UserBean) session.getAttribute(UserBean.class.getName());
    String language;
    if (userBean != null)
    {
      String sId = userBean.getId();
      log.log(Level.FINE, "Get userbean. sId={0}", sId);

      if (sId != null)
      {
        LangHttpServletRequest lRequest = null;
        Cookie langCookie = LanguageCookieHelper.getCookie(hRequest, LanguageCookieHelper.AC_LANGUAGE_COOKIENAME);
        if (langCookie == null)
        {
          langCookie = LanguageCookieHelper.getCookie(hRequest, LanguageCookieHelper.LANGUAGE_COOKIENAME);
        }

        if (langCookie != null)
        {
          language = LanguageCookieHelper.validateAndDecode(langCookie.getValue(), sId);
          if (language == null)
          {
            log.log(Level.FINE, "Found invalid cookie in the request, due to user changes - " + language);
            language = LanguageCookieHelper.createLocaleCookie(hRequest, hResponse, sId, ViewerConfig.getInstance().getBssCoreBackEnd(),
                CROSS_APP_COOKIE_DOMAIN);
          }
          else
          {
            log.log(Level.FINE, "Found valid cookie in the request as logged in user - " + language);
          }
        }
        else
        { // Lang cookie not present
          // Create cookie
          log.log(Level.FINE, "Failed to find valid cookie. Creating a new one...");
          language = LanguageCookieHelper.createLocaleCookie(hRequest, hResponse, sId, ViewerConfig.getInstance().getBssCoreBackEnd(),
              CROSS_APP_COOKIE_DOMAIN);
        }

        // replace request with RequestWrapper.
        if (language != null)
        {
          language = LanguageCookieHelper.getFallbackLanguage(language);
          log.log(Level.FINE, "Add the request wrapper for language Header - " + language);
          lRequest = new LangHttpServletRequest(hRequest, language);
          chain.doFilter(lRequest, hResponse);
          return;
        }
      }
    }
    else
    {
      log.log(Level.WARNING, "Failed to get valid userbean.");
      if (hRequest.getParameter("locale") != null && hRequest.getParameter("locale") != "")
      {
        language = hRequest.getParameter("locale");
        // LanguageCookieHelper.addNonUserCookie(hResponse, language);
      }
      else
      { // set nonuser_lang cookie based on the language preference of the client.
        language = LanguageCookieHelper.getSupportedLanguage(hRequest.getLocale());
        // LanguageCookieHelper.addNonUserCookie(hResponse, language);
      }

      // If language is set replace request with RequestWrapper to use this language value
      if (language != null && !language.trim().equals(""))
      {
        language = LanguageCookieHelper.getFallbackLanguage(language);
        LangHttpServletRequest lRequest = null;
        lRequest = new LangHttpServletRequest(hRequest, language.trim());
        chain.doFilter(lRequest, hResponse);
        return;
      }
    }

    chain.doFilter(request, response);
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException
  {
    log.log(Level.FINE, "initialized.");
  }
}
