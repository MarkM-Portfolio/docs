/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.helper;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Locale;
import java.util.Map.Entry;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.codec.binary.Base64;

import com.ibm.bss.shim.dto.EntityId;
import com.ibm.bss.shim.dto.member.Subscriber;
import com.ibm.json.java.JSONObject;

public class LanguageCookieHelper
{

  private static Logger log = Logger.getLogger(LanguageCookieHelper.class.getName());

  public static final String LANGUAGE_COOKIENAME = "vn_user_lang";

  public static final String AC_LANGUAGE_COOKIENAME = "user_lang";

  public static final String DEFAULT_LANG = "en_US";

  public static final String FALLBACKRULE_FILE = "fallback.json";

  private static int COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hour

  private static JSONObject fallbackRule = null;

  public static void addLocaleCookie(HttpServletResponse response, String value, String sId, String domain)
  {
    log.entering(LanguageCookieHelper.class.getName(), "addCookie", new Object[] { value, sId });
    try
    {
      String cookievalue = base64Encode(value) + "-" + base64Encode(sId);
      Cookie cookie = new Cookie(LANGUAGE_COOKIENAME, URLEncoder.encode(cookievalue, "utf-8"));
      cookie.setDomain(domain);
      cookie.setPath("/");
      cookie.setMaxAge(COOKIE_MAX_AGE);
      cookie.setSecure(true);
      try
      {
        // cswg is still using WAS7 against servlet 2.5, the cookie does not have method setHttpOnly.
        cookie.setHttpOnly(true);
      }
      catch (Throwable e)
      {
        log.log(Level.WARNING, "No function setHttpOnly defined, just ignore it...");
      }
      response.addCookie(cookie);
    }
    catch (UnsupportedEncodingException usee)
    {
      throw new IllegalStateException("UTF-8 should always be defined...", usee);
    }

    log.exiting(LanguageCookieHelper.class.getName(), "addCookie");
  }

  // Used by LanguageFilter
  public static String createLocaleCookie(HttpServletRequest hrequest, HttpServletResponse hresponse, String sId, String hostname,
      String domain)
  {
    log.entering(LanguageCookieHelper.class.getName(), "createCookie", sId);

    String language = null;
    try
    {
      Subscriber sub = BssSubscriberHelper.fetchSubscriber(hostname, EntityId.n(sId));
      if (sub != null)
      {
        language = sub.getPerson().getLanguagePreference();
      }
    }
    catch (Exception t)
    {
      if (!hrequest.getRequestURI().contains("endpoint"))
      {
        log.severe("Failed to get subscriber sId=" + sId + " " + t.getLocalizedMessage());
      }
    }

    if (language == null || language.equals(""))
    {
      language = LanguageCookieHelper.DEFAULT_LANG;
      log.log(Level.WARNING, "Failed to get language setting from BSS, fall back to default language - {0}.", language);
    }
    LanguageCookieHelper.addLocaleCookie(hresponse, language, sId, domain);
    log.log(Level.INFO, "Added usre_lang cookie {0} to response for user {1}.", new Object[]{language, sId});

    log.exiting(LanguageCookieHelper.class.getName(), "createCookie", language);
    return language;
  }

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

  // Used by Action Class. Interceptor will take care of adding the cookie in
  // the response.
  public static Cookie createCookie(String language, String sId, String domain)
  {
    log.entering(LanguageCookieHelper.class.getName(), "createCookie", new Object[] { language, sId });

    if (language == null || "".equals(language))
      language = DEFAULT_LANG;
    String cookievalue = base64Encode(language) + "-" + base64Encode(sId);
    Cookie cookie = new Cookie(LANGUAGE_COOKIENAME, cookievalue);
    cookie.setDomain(domain);
    cookie.setPath("/");
    cookie.setMaxAge(COOKIE_MAX_AGE);
    cookie.setSecure(true);
    try
    {
      cookie.setHttpOnly(true);
    }
    catch (Throwable e)
    {
      log.log(Level.WARNING, "No function setHttpOnly defined, just ignore it...");
    }

    log.exiting(LanguageCookieHelper.class.getName(), "createCookie", cookie);
    return cookie;
  }

  public static Cookie getCookie(HttpServletRequest req, String name)
  {
    log.entering(LanguageCookieHelper.class.getName(), "getCookie", name);
    String cookieStr = req.getHeader("Cookie"); //$NON-NLS-1$
    if (cookieStr != null)
    {
      String[] cookieArr = cookieStr.split(";"); //$NON-NLS-1$
      for (String c : cookieArr)
      {
        c = c.trim();
        if (c.indexOf(name) == 0)
        {
          int i = c.indexOf("="); //$NON-NLS-1$
          if (i == -1)
          {
            log.exiting(LanguageCookieHelper.class.getName(), "getCookie - null");
            return null;
          }
          else
          {
            Cookie cookie = new Cookie(c.substring(0, i), c.substring(i + 1));
            log.exiting(LanguageCookieHelper.class.getName(), "getCookie - " + cookie);
            return cookie;
          }
        }
      }
    }
    log.exiting(LanguageCookieHelper.class.getName(), "getCookie - null");
    return null;
  }

  public static String validateAndDecode(String cookie, String sId)
  {
    log.entering(LanguageCookieHelper.class.getName(), "validateAndDecode", new Object[] { cookie, sId });
    try
    {
      // first URL decode
      cookie = URLDecoder.decode(cookie, "utf-8");
    }
    catch (UnsupportedEncodingException usee)
    {
      throw new IllegalStateException("UTF-8 should always be defined...", usee);
    }
    // split into parts
    String[] data = cookie.split("-");
    if (data.length == 2)
    {
      String language = LanguageCookieHelper.base64Decode(data[0]);
      String user = LanguageCookieHelper.base64Decode(data[1]);

      if (user.equalsIgnoreCase(sId))
      {
        log.exiting(LanguageCookieHelper.class.getName(), "validateAndDecode", language);
        return language;
      }
    }
    log.exiting(LanguageCookieHelper.class.getName(), "validateAndDecode", null);
    return null;
  }

  // public static Cookie deleteCookieWithOldDomain(String cookieName)
  // {
  //
  // if (log.isLoggable(Level.FINE))
  // log.fine("in LanguageCookieHelper deleteCookieWithOldDomain");
  // Cookie cookie = new Cookie(cookieName, "");
  // cookie.setDomain(LOCAL_COOKIE_DOMAIN);
  // cookie.setPath("/");
  // cookie.setMaxAge(0);
  // return cookie;
  // }

  public static String getSupportedLanguage(Locale locale)
  {

    // // refer to $ConfigFS/bss.shim/language.json
    // Map<String, String> languageMap = coordinator.getLanguageMap(new Locale(DEFAULT_LANG));
    // Set<String> languageSet = new TreeSet<String>(languageMap.keySet());
    //
    // // try to match the whole locale
    // if (languageSet.contains(locale.toString()))
    // {
    // return locale.toString();
    // }
    //
    // // try to match the language part
    // String tmpLang = null;
    // for (String lang : languageSet)
    // {
    // if (lang.contains(locale.getLanguage() + ":"))
    // {
    // // if preferred locale for a language was provided in the json file (like: "pt:pt_PT":"pt"), we take it
    // return lang.substring(3);
    // }
    //
    // if (lang.contains(locale.getLanguage()))
    // {
    // // in case there is no preferred locale specified for a given language, we just remember it
    // tmpLang = lang;
    // }
    // }
    //
    // if (tmpLang != null)
    // {
    // return tmpLang;
    // }
    // passed language not supported. so return default
    return DEFAULT_LANG;

  }

  public static String getFallbackLanguage(String locale)
  {
    if (locale == null)
    {
      locale = "en-us";
    }
    locale = locale.toLowerCase().replaceAll("_", "-");
    locale = locale.trim();
    if (fallbackRule == null)
    {
      InputStream is = null;
      try
      {
        is = LanguageCookieHelper.class.getResourceAsStream("/config/" + FALLBACKRULE_FILE);
        if (is == null)
        {
          throw new IllegalArgumentException("Failed to load " + FALLBACKRULE_FILE);
        }
        fallbackRule = JSONObject.parse(is);
      }
      catch (IOException e)
      {
        throw new IllegalArgumentException("Error happened when load " + FALLBACKRULE_FILE, e);
      }
      finally
      {
        if (is != null)
        {
          try
          {
            is.close();
          }
          catch (IOException e)
          {
            log.severe("Cannot close FileInputStream for " + FALLBACKRULE_FILE);
          }
        }
      }
    }
    String retLocale = locale;
    for (Object obj : fallbackRule.entrySet())
    {
      Entry<String, String> entry = (Entry<String, String>) obj;
      if (locale.matches(entry.getKey()))
      {
        retLocale = entry.getValue();
        break;
      }
    }
    log.log(Level.FINE, "Language Fallback from " + locale + " to " + retLocale);
    return retLocale;
  }
}
