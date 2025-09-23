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

import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class LangHttpServletRequest extends HttpServletRequestWrapper
{

  private static String ACCEPT_LANG_HEADER = "accept-language";

  // private static String REQUEST_LOCALE ="request_locale" ;
  private String language;

  private Logger log = Logger.getLogger(LangHttpServletRequest.class.getName());

  public LangHttpServletRequest(HttpServletRequest request, String language)
  {
    super(request);
    log.log(Level.FINE, "Wrapped request created with language = " + language + " for request to " + request.getRequestURL());
    this.language = language;
  }

  @Override
  public String getHeader(String name)
  {
    HttpServletRequest request = (HttpServletRequest) getRequest();
    if (ACCEPT_LANG_HEADER.equals(name))
    {
      log.log(Level.FINE, "Call to getHeader(accept-language), language = " + language);
      if (language != null)
        return language;
    }
    // else In case language is null or header name is different
    return request.getHeader(name);
  }

  @Override
  public Locale getLocale()
  {
    log.log(Level.FINE, "Call to getLocale(), language = " + language);
    if (language != null && !language.trim().equals(""))
    {
      if (language.length() == 2)
        return new Locale(language);
      else
        return new Locale(language.substring(0, 2), language.substring(3));
    }
    else
      return super.getLocale();
  }

}
