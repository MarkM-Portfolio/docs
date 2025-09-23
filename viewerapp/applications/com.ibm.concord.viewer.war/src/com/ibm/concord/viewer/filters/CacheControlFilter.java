package com.ibm.concord.viewer.filters;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONObject;

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


public class CacheControlFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(CacheControlFilter.class.getName());

  private JSONObject httpParams;

  /**
   * This filter is used to add header request to js and css file to avoid 304 round-trip traffic
   */

  public void destroy()
  {
    httpParams = null;
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    String reqUri = httpRequest.getRequestURI();
    String ctx_root = httpRequest.getContextPath();
    if (reqUri.startsWith(ctx_root+"/static/")||reqUri.startsWith(ctx_root+"/js/")) {
      int value = 365 * 24 * 3600;
      try
      {
        String str = (String) httpParams.get("cache-control");
        if (str != null)
        {
          value = Integer.valueOf(str);
          value = value * 24 * 3600;
        }
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "http-params is not correctly configured. Please check!", e);
      }
      httpResponse.setHeader("Cache-Control", String.valueOf("public, max-age=" + value));
    } else {
      setNoCache(httpResponse);
    }
//    String path = httpRequest.getPathInfo();
//    if (path != null && (path.endsWith(".css") || path.endsWith(".html") || path.endsWith(".js")))
//    {
//      httpResponse.addHeader("Content-Encoding", "gzip");
//    }
    try
    {
      chain.doFilter(request, response);
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.FINE,httpRequest.getPathInfo()+" was not exist.");
    }
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {
    httpParams = Platform.getViewerConfig().getSubConfig("http-params");
  }
  
  private void setNoCache(HttpServletResponse response)
  {
    response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=3600");
  }
}
