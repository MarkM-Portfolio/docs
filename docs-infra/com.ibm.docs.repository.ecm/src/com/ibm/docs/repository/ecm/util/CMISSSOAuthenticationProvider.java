/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.repository.ecm.util;

import java.net.HttpCookie;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;
import org.apache.commons.httpclient.Cookie;

public class CMISSSOAuthenticationProvider extends StandardAuthenticationProvider
{
  private static final long serialVersionUID = 7213201351185848003L;

  private static final Logger LOG = Logger.getLogger(CMISSSOAuthenticationProvider.class.getName());

  public Map<String, List<String>> getHTTPHeaders(String url)
  {

    Map<String, List<String>> result = super.getHTTPHeaders(url);
    String cookiesStr = "";
    List<HttpCookie> cookieObjs = null;
    if (result != null)
    {
      List<String> cookies = result.get("Cookie");
      if (cookies != null)
      {
        cookiesStr = cookies.get(0);        
        cookieObjs = HttpCookie.parse(cookiesStr);
      }
    }
    String host = url;
    try
    {
      URL reqUrl = new URL(url);
      host = reqUrl.getHost();
    }
    catch (MalformedURLException e)
    {
      LOG.log(Level.WARNING, "Invalid URL of" + url, e);
    }
    cookiesStr = mergeCookie(cookieObjs, host);
    LOG.fine(cookiesStr);

    if (result == null)
    {
      result = new HashMap<String, List<String>>();
    }
    result.put("Cookie", Collections.singletonList(cookiesStr));
    return result;
  }

  protected String mergeCookie(List<HttpCookie> cookieObjs, String host)
  {
    StringBuilder cookieBuilder = new StringBuilder("");
    Cookie[] cookies = CookieHelper.getAllCookies(host);
    String split = "";
    
    // cached cookies
    if (cookieObjs != null)
    {
      for( int i=0; i<cookieObjs.size(); i++)
      {
        HttpCookie cookieObj = cookieObjs.get(i);
        if (cookieObj !=  null)
        {
          String name = cookieObj.getName().trim();
          boolean found = false;
          for (Cookie cookie : cookies)
          {
            if (cookie != null)
            {
               String nName = cookie.getName().trim();
               if(nName.equalsIgnoreCase(name))
               {
                 found = true;
                 break;
               }
            }
          }
          if(!found)
          {
            cookieBuilder.append(split);
            cookieBuilder.append(cookieObj.toString());
            split = "; ";
          }
        }
      }
    }
   
    // client cookies
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
}
