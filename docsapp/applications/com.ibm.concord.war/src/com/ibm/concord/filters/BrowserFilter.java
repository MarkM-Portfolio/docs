/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.platform.browsers.BrowserFilterHelper;
import com.ibm.concord.platform.browsers.BrowserFilterHelper.Browser;

public class BrowserFilter implements Filter
{
	
  private static final String BROWSER_TYPE_FOR_ENCODING = "browser_type";

  public void init(FilterConfig cfg) throws ServletException
  {
  }

  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest request = (HttpServletRequest)req;
    String method = request.getMethod();
    if(method != null && !method.equalsIgnoreCase("GET"))
    {
      chain.doFilter(req, resp);
      return;
    }
    String ua = ((HttpServletRequest) req).getHeader("User-Agent");
    ua = ua != null ? ua.toLowerCase() : null;
    if (ua != null)
    {
      if (ua.contains("mobile"))
      {
        req.setAttribute(BROWSER_TYPE_FOR_ENCODING, Browser.MOBILE_NATIVE);
      }
      else
      {
        Browser browser = getBrowser(ua);
        req.setAttribute(BROWSER_TYPE_FOR_ENCODING, browser);
      }
    }
	chain.doFilter(req, resp);
	return;	
  }

  private BrowserFilterHelper.Browser getBrowser(String ua)
  {
    Browser browser = Browser.UNKNOWN;
    if(ua.indexOf(Browser.ELECTRON.toString().toLowerCase()) != -1)
    {
      browser = Browser.ELECTRON;
    }
    // Because the user may install the chrome frame plug-in in IE, user agent contain the string "chromeframe", but it's IE.
    else if(ua.indexOf(Browser.CHROME.toString().toLowerCase()) != -1 && ua.indexOf(Browser.MSIE.toString().toLowerCase()) < 0)
    {
      browser = Browser.CHROME; // because chrome contains safari keyword, so process it first
    }
    else
    {
      Browser[] browsers = Browser.values();
      for (Browser iBrowser : browsers)
      {
        if (ua.indexOf(iBrowser.toString().toLowerCase()) != -1)
        {
          browser = iBrowser;
          break;
        }
      }  
    }
    return browser;
  }

  public void destroy()
  {
  }
}
