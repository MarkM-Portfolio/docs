/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.cmisproviders;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;
import org.apache.commons.httpclient.Cookie;

import com.ibm.docs.common.security.CookieHelper;

public class SSOCookieAuthenticationProvider extends StandardAuthenticationProvider
{
  private static final long serialVersionUID = 7213201351185848004L;

  private static final Logger LOG = Logger.getLogger(SSOCookieAuthenticationProvider.class.getName());

  public Map<String, List<String>> getHTTPHeaders(String url)
  {
    Map<String, List<String>> result = new HashMap<String, List<String>>();
    String cookiesStr = "";   
    cookiesStr = mergeCookie(cookiesStr);
    LOG.fine(cookiesStr);
    result.put("Cookie", Collections.singletonList(cookiesStr));
    return result;
  }

  protected String mergeCookie(String cookiesStr)
  {
    StringBuilder cookieBuilder = new StringBuilder("");
    if (cookiesStr != null)
    {
      cookieBuilder.append(cookiesStr);
    }
    Cookie[] cookies = getAllCookies();
    String split = "";
    for (Cookie cookie : cookies)
    {
      if (cookie != null)
      {
        cookieBuilder.append(split);
        cookieBuilder.append(cookie.toString());
        split = "; ";
      }
    }
    return cookieBuilder.toString();
  }
  
  protected Cookie[] getAllCookies()
  {
    return CookieHelper.getAllCookies();
  }
}
